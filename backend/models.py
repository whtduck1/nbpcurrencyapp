from sqlalchemy import Column, Integer, String, Numeric, Date
from database import Base

class CurrencyRate(Base):
    __tablename__ = "currency_rates"

    id = Column(Integer, primary_key=True, index=True)
    currency_code = Column(String(3), index=True)
    currency_name = Column(String(100))      
    exchange_rate = Column(Numeric(10, 4))
    rate_date = Column(Date, index=True)