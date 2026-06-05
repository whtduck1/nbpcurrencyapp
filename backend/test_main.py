from fastapi.testclient import TestClient
from main import app
import pytest

client = TestClient(app)

def test_get_currencies_endpoint():
    response = client.get("/currencies")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    
def test_get_currencies_by_date_endpoint():
    response = client.get("/currencies/2026-06-05")
    assert response.status_code == 200
    assert isinstance(response.json(), list)