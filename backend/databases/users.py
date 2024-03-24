from sqlmodel import Session, select
from passlib.hash import bcrypt

from databases.models import engine, User


def create_user(user: User):
    user.password = bcrypt.hash(user.password)

    with Session(engine) as session:
        session.add(user)
        session.commit()
        session.refresh(user)
        return user


def get_all_users():
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        return users


def get_user(username: str):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.username == username)).first()
        return user
def authenticate_user(username: str, password: str):
    users = get_all_users()

    for user in users:
        if username == user.username:
            if bcrypt.verify(password, user.password):
                return user

    return None

