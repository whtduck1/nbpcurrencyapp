from fastapi import FastAPI

app = FastAPI(title="NBP Currency API")

@app.get("/")
def read_root():
    return {"status": "FastAPI works"}