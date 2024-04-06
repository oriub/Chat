from fastapi import FastAPI, Depends, HTTPException, status
from fastapi import Response, Request
from fastapi import WebSocket, WebSocketDisconnect
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


TOKEN_EXPIRE_MINUTES = 10
JWT_SECRET_KEY = "e280a46c1b7635282e98a5b39e9cdefda930783272c6c0791a1fb49637b93247"
JWT_ALGORITHM = "HS256"


# returned jwt token scheme
class Token(BaseModel):
    access_token: str
    token_type: str


class UserLoginInfo(BaseModel):
    username: str
    password: str


class UsernameInfo(BaseModel):
    username: str


app = FastAPI()

origins = ['*']

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

connection_manager = SocketConnectionManager()


def create_token(data: dict, expire_delta: timedelta | None = None):
    data_to_encode = data.copy()
    if expire_delta:
        expire = datetime.now() + expire_delta
    else:
        expire = datetime.now() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    data_to_encode["exp"] = int(expire.timestamp())

    encoded = jwt.encode(data_to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded


async def validate_user_token(request: Request):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="unable to validate credentials, you are either unauthenticated or your token is invalid or expired",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        token = request.cookies.get("jwt")
        if not token:
            raise credentials_exception
        decoded = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        username = decoded["sub"]
        expires = datetime.fromtimestamp(decoded["exp"])

        if username is None or expires < datetime.now():
            raise credentials_exception

        user = users.get_user(username)
        if user is None:
            raise credentials_exception

    except ExpiredSignatureError:
        raise credentials_exception

    return user.username


@app.on_event("startup")
def startup():
    create_tables_and_db()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/token")
async def token_login(user_data: UserLoginInfo, response: Response) -> Token:
    user = users.authenticate_user(user_data.username, user_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username and/or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = create_token(data={"sub": user.username})
    response.set_cookie(key="jwt", value=access_token)
    return Token(access_token=access_token, token_type="bearer")


@app.post("/signup")
def signup(user: User):
    try:
        user = users.create_user(user)
    except IntegrityError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This user already exists"
        )
    return user.username


@app.get("/activeusers")
def get_active_users(username: Annotated[str, Depends(validate_user_token)]) -> list[str]:
    return list(connection_manager.connections.keys())


@app.websocket("/socket/{username}")
async def socket_endpoint(websocket: WebSocket, username: Annotated[str, Depends(validate_user_token)]):
    await connection_manager.connect(websocket=websocket, username=username)

    try:
        while True:
            received_data = await websocket.receive_json()
            await connection_manager.send_message(sender_username=username, message=received_data["message"], recipient_username=received_data["recipcient"])
    except WebSocketDisconnect:
        await connection_manager.send_message(sender_username=username, message="Client Disconnected", recipient_username=received_data["recipient"])


