from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
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


@app.get("/currencies")
def get_all_currencies(db: Session = Depends(get_db)):
    rates = db.query(models.CurrencyRate).order_by(models.CurrencyRate.rate_date.desc()).all()
    return rates

@app.get("/currencies/{date}")
def get_currencies_by_date(date: str, db: Session = Depends(get_db)):
    rates = db.query(models.CurrencyRate).filter(models.CurrencyRate.rate_date == date).all()
    return rates

@app.post("/currencies/fetch")
def fetch_currencies(target_date: str, db: Session = Depends(get_db)):
    try:
        inserted_count = fetch_rates_from_nbp(target_date, db)
        
        if inserted_count == 0:
            return {
                "status": "Ostrzeżenie", 
                "message": f"API NBP nie udostępnia tabeli kursów dla daty {target_date} (weekend/święto) lub rekordy istnieją już w bazie.",
                "pobrano": 0
            }
            
        return {
            "status": "Sukces", 
            "message": f"Pomyślnie pobrano i zapisano w bazie {inserted_count} kursów walut.",
            "pobrano": inserted_count
        }
        
    except Exception as e:
        print(f"Błąd krytyczny aplikacji backendowej: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Wystąpił wewnętrzny błąd serwera FastAPI: {str(e)}"
        )