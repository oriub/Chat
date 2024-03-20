from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base


database_url = r"sqlilite:///users.db"

engine = create_engine(database_url)

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String(10), unique=True, nullable=False)
    password = Column(String(30), unique=True, nullable=False)

