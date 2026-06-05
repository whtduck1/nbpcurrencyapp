from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import get_db, engine
import models
from nbp_service import fetch_rates_from_nbp

models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="NBP Currency API")

@app.post("/currencies/fetch")
def fetch_and_save_currencies(target_date: str, db: Session = Depends(get_db)):
    nbp_rates = fetch_rates_from_nbp(target_date)
    
    for rate in nbp_rates:
        db_rate = models.CurrencyRate(
            currency_code=rate["code"],
            currency_name=rate["currency"],
            exchange_rate=rate["mid"],
            rate_date=target_date 
        )
        db.add(db_rate)
        
    db.commit()
    return {"status": "Sukces", "pobrano": len(nbp_rates)}

@app.get("/currencies")
def get_available_currencies(db: Session = Depends(get_db)):
    return db.query(models.CurrencyRate).all()

@app.get("/currencies/{target_date}")
def get_currencies_by_date(target_date: str, db: Session = Depends(get_db)):
    return db.query(models.CurrencyRate).filter(models.CurrencyRate.rate_date == target_date).all()