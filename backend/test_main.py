import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_currencies_endpoint():
    response = client.get("/api/currencies")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_currencies_by_date_endpoint():
    response = client.get("/api/currencies/2026-06-05")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_currencies_by_month():
    response = client.get("/api/currencies/month/2026/6")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_currencies_by_quarter_valid():
    response = client.get("/api/currencies/quarter/2026/2")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_currencies_by_quarter_invalid():
    response = client.get("/api/currencies/quarter/2026/5")
    assert response.status_code == 400
    assert response.json()["detail"] == "Kwartał musi być w przedziale 1-4"