from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from jose import jwt, JWTError

from datetime import timedelta, datetime
from typing import Annotated

from databases.models import create_tables_and_db, User
from databases import users


TOKEN_EXPIRE_MINUTES = 15
JWT_SECRET_KEY = "e280a46c1b7635282e98a5b39e9cdefda930783272c6c0791a1fb49637b93247"
JWT_ALGORITHM = "HS256"


# returned jwt token scheme
class Token(BaseModel):
    access_token: str
    token_type: str


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()


def create_token(data: dict, expire_delta: timedelta | None = None):
    data_to_encode = data.copy()
    if expire_delta:
        expire = datetime.now() + expire_delta
    else:
        expire = datetime.now() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    data_to_encode["exp"] = expire

    encoded = jwt.encode(data_to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded


async def validate_user_token(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail = "unable to validate credentials, token is either invalid or expired",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        username = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])["sub"]

        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = users.get_user(username)
    if user is None:
        raise credentials_exception

    return user


@app.on_event("startup")
def startup():
    create_tables_and_db()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/token")
async def token_login(user_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> Token:
    user = users.authenticate_user(user_data.username, user_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username and/or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = create_token(data={"sub": user.username})
    return Token(access_token=access_token, token_type="bearer")


@app.post("/signup")
def signup(user: User):
    return users.create_user(user)
