# In-memory items API for the status-code lab. Runs inside the container only.
# Missing X-Token is 422 (Header is required). Wrong value is 401. secret-token is 200.
import itertools
from pathlib import Path

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

TOKEN = "secret-token"
UI_DIR = Path(__file__).resolve().parent / "ui"

app = FastAPI()

_ids = itertools.count(3)
items: dict[int, dict] = {
    1: {"id": 1, "name": "Apple", "price": 1.25},
    2: {"id": 2, "name": "Bread", "price": 3.5},
}


class ItemIn(BaseModel):
    name: str = Field(min_length=1)
    price: float = Field(gt=0)


def get_current_user(x_token: str = Header(...)):
    if x_token != TOKEN:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"username": "admin"}


def _get_or_404(item_id: int) -> dict:
    item = items.get(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@app.get("/api/items")
def list_items(user: dict = Depends(get_current_user)):
    return list(items.values())


@app.get("/api/items/{item_id}")
def read_item(item_id: int, user: dict = Depends(get_current_user)):
    return _get_or_404(item_id)


@app.post("/api/items")
def create_item(body: ItemIn, user: dict = Depends(get_current_user)):
    item_id = next(_ids)
    item = {"id": item_id, "name": body.name, "price": body.price}
    items[item_id] = item
    return item


@app.put("/api/items/{item_id}")
def replace_item(item_id: int, body: ItemIn, user: dict = Depends(get_current_user)):
    _get_or_404(item_id)
    item = {"id": item_id, "name": body.name, "price": body.price}
    items[item_id] = item
    return item


@app.delete("/api/items/{item_id}")
def delete_item(item_id: int, user: dict = Depends(get_current_user)):
    item = _get_or_404(item_id)
    del items[item_id]
    return item


app.mount("/", StaticFiles(directory=str(UI_DIR), html=True), name="ui")
