import httpx

NBP_API_URL = "https://api.nbp.pl/api/exchangerates/tables/A"

def fetch_rates_from_nbp(target_date: str):
    url = f"{NBP_API_URL}/{target_date}/?format=json"
    
    with httpx.Client() as client:
        response = client.get(url)
        data = response.json()
        return data[0]["rates"]