from fastapi import FastAPI, Depends, HTTPException, status
from fastapi import Response, Request
from fastapi import WebSocket
from fastapi.responses import JSONResponse
from starlette.websockets import WebSocketDisconnect
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jose import jwt, ExpiredSignatureError
from sqlalchemy.exc import IntegrityError

from datetime import timedelta, datetime
from typing import Annotated

from databases.models import create_tables_and_db, User
from databases import users
from socketconnectionmanager import SocketConnectionManager


# JWT Settings
TOKEN_EXPIRE_MINUTES = 10
JWT_SECRET_KEY = "e280a46c1b7635282e98a5b39e9cdefda930783272c6c0791a1fb49637b93247"
JWT_ALGORITHM = "HS256"


# returned jwt token scheme
class Token(BaseModel):
    access_token: str
    token_type: str


# login info scheme
class UserLoginInfo(BaseModel):
    username: str
    password: str


# username api input scheme
class UsernameInfo(BaseModel):
    username: str

class AuthenticationError(Exception):
    def __init__(self, msg:str):
        self.msg = msg


app = FastAPI()

# allowed origins, should be changed if not running on localhost
origins = ["http://localhost:3000", "0.0.0.0"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex="http://localhost.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# initialize socket connections manager
connection_manager = SocketConnectionManager()


# create a jwt token
def create_token(data: dict, expire_delta: timedelta | None = None):
    data_to_encode = data.copy()
    if expire_delta:
        expire = datetime.now() + expire_delta
    else:
        expire = datetime.now() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    data_to_encode["exp"] = int(expire.timestamp())

    encoded = jwt.encode(data_to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded


# check if given jwt is valid (from request cookie)
async def validate_user_token(request: Request = None, websocket: WebSocket = None):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="unable to validate credentials, you are either unauthenticated or your token is invalid or expired",
        headers={"WWW-Authenticate": "Bearer"}
    )
    # credentials_exception = JSONResponse(content={"message": "unable to validate credentials, you are either unauthenticated or your token is invalid or expired"}, status_code=401)

    try:
        if request:
            token = request.cookies.get('jwt')
        else:
            token = websocket.cookies.get('jwt')

        # if no cookie exists
        if not token:
            print("token is None")
            raise AuthenticationError("no authentication token found in cookies")

        decoded = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        username = decoded["sub"]
        expires = datetime.fromtimestamp(decoded["exp"])

        if username is None:
            raise AuthenticationError("no username provided")

        if expires < datetime.now():
            raise AuthenticationError("token is expired, please login again")

        user = users.get_user(username)
        if user is None:
            raise AuthenticationError(f"user {username} doesn't exist")

    except ExpiredSignatureError:
        raise AuthenticationError("token is expired, please login again")

    return user.username


#create db tables on app startup
@app.on_event("startup")
def startup():
    create_tables_and_db()

@app.exception_handler(AuthenticationError)
def authentication_error(request: Request, exc: AuthenticationError):
    return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED,
                        content={"message": f"unable to validate credentials, detail: {exc.msg}"},
                        headers={"WWW-Authenticate": "Bearer"})

# authenticate user with db, and respond with jwt
@app.post("/token")
async def token_login(user_data: UserLoginInfo, response: Response) -> Token:
    # check if given info matches db
    user = users.authenticate_user(user_data.username, user_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username and/or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # generate jwt token
    access_token = create_token(data={"sub": user.username})
    # set cookie on client with cookie
    response.set_cookie(key="jwt", value=access_token)
    return Token(access_token=access_token, token_type="Bearer")


# create user with given info
@app.post("/signup")
def signup(user: User) -> UsernameInfo:
    try:
        user = users.create_user(user)
    except IntegrityError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This user already exists"
        )
    return UsernameInfo(username=user.username)


# get current user username
@app.get("/users/me")
def get_my_username(request: Request, username: str=Depends(validate_user_token)) -> UsernameInfo:
    return UsernameInfo(username=username)


# list all app active users
@app.get("/users/activeusers")
def get_active_users(request: Request, username: str=Depends(validate_user_token)) -> list[str]:
    return list(connection_manager.connections.keys())


# create socket endpoint per user, send and receive messages
@app.websocket("/socket/{user}")
async def socket_endpoint(websocket: WebSocket, user: str, username: str = Depends(validate_user_token)):
    await connection_manager.connect(websocket=websocket, username=username)

    try:
        while True:
            received_data = await websocket.receive_json()
            print(f"data: {received_data}, type: {type(received_data)}")
            await connection_manager.send_message(sender_username=username, message=received_data["message"], recipient_username=received_data["recipient"])
    except WebSocketDisconnect:
        print("caught socket disconnect - ", username)
        #await connection_manager.send_message(sender_username=username, message="Client Disconnected", recipient_username=received_data["recipient"])
        #await websocket.close()
        connection_manager.disconnect(username=username)

    except KeyError:
        print("no longer connected - ", username)

    except HTTPException as e:
        print(e)


