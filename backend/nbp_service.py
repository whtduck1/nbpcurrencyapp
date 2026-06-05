import requests
from sqlalchemy.orm import Session
import models
from datetime import datetime

def fetch_rates_from_nbp(target_date: str, db: Session) -> int:
    try:
        datetime.strptime(target_date, "%Y-%m-%d")
    except ValueError:
        raise Exception(f"Niepoprawny format daty: {target_date}. Oczekiwano YYYY-MM-DD.")

    url = f"https://api.nbp.pl/api/exchangerates/tables/A/{target_date}/?format=json"
    
    try:
        response = requests.get(url, timeout=10)
    except requests.exceptions.RequestException as e:
        print(f"Błąd sieciowy podczas połączenia z NBP: {e}")
        return 0
    
    if response.status_code != 200:
        return 0

    data = response.json()
    if not data or not isinstance(data, list):
        return 0

    table_data = data[0]
    rate_date = table_data.get("effectiveDate", target_date)
    rates = table_data.get("rates", [])

    inserted_count = 0

    for r in rates:
        code = r.get("code")
        name = r.get("currency")
        mid_value = r.get("mid")

        if not code or mid_value is None:
            continue

        existing = db.query(models.CurrencyRate).filter(
            models.CurrencyRate.currency_code == code,
            models.CurrencyRate.rate_date == rate_date
        ).first()

        if not existing:
            new_rate = models.CurrencyRate(
                currency_code=code,
                currency_name=name,
                exchange_rate=float(mid_value),
                rate_date=rate_date
            )
            db.add(new_rate)
            inserted_count += 1

    if inserted_count > 0:
        db.commit()

    return inserted_count