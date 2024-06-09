from sqlalchemy import Engine, create_engine


def get_engine(db_uri: str) -> Engine:
  return create_engine(db_uri, echo=True)
