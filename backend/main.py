from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from database import get_db, engine
import models
from nbp_service import fetch_rates_from_nbp

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="NBP Currency API")

origins = [
    "http://localhost:4200",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/currencies")
def get_all_currencies(db: Session = Depends(get_db)):
    return db.query(models.CurrencyRate).order_by(models.CurrencyRate.rate_date.desc()).all()

@app.get("/api/currencies/{date}")
def get_currencies_by_date(date: str, db: Session = Depends(get_db)):
    return db.query(models.CurrencyRate).filter(models.CurrencyRate.rate_date == date).all()

@app.get("/api/currencies/year/{year}")
def get_currencies_by_year(year: int, db: Session = Depends(get_db)):
    return db.query(models.CurrencyRate).filter(
        extract('year', models.CurrencyRate.rate_date) == year
    ).all()

@app.get("/api/currencies/quarter/{year}/{quarter}")
def get_currencies_by_quarter(year: int, quarter: int, db: Session = Depends(get_db)):
    if quarter < 1 or quarter > 4:
        raise HTTPException(status_code=400, detail="Kwartał musi być w przedziale 1-4")
    
    start_month = (quarter - 1) * 3 + 1
    end_month = start_month + 2
    
    return db.query(models.CurrencyRate).filter(
        extract('year', models.CurrencyRate.rate_date) == year,
        extract('month', models.CurrencyRate.rate_date).between(start_month, end_month)
    ).all()

@app.get("/api/currencies/month/{year}/{month}")
def get_currencies_by_month(year: int, month: int, db: Session = Depends(get_db)):
    return db.query(models.CurrencyRate).filter(
        extract('year', models.CurrencyRate.rate_date) == year,
        extract('month', models.CurrencyRate.rate_date) == month
    ).all()

@app.post("/api/currencies/fetch")
def fetch_currencies(target_date: str, db: Session = Depends(get_db)):
    try:
        inserted_count = fetch_rates_from_nbp(target_date, db)
        if inserted_count == 0:
            return {"status": "Ostrzeżenie", "message": f"Brak nowej tabeli dla {target_date}.", "pobrano": 0}
        return {"status": "Sukces", "message": f"Pobrano {inserted_count} kursów.", "pobrano": inserted_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))