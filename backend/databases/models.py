from sqlmodel import Field, SQLModel, create_engine


class User(SQLModel, table=True):

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(min_length=3, max_length=10, unique=True)
    password: str = Field(min_length=8, max_length=25)


sqlite_url = r"sqlite:///users.db"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)


def create_tables_and_db():
    SQLModel.metadata.create_all(engine)


