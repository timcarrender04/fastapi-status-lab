# FastAPI status codes — 422, 401, 200

About 60 minutes. From this folder, before students arrive:

```bash
docker compose up --build
```

Open http://localhost:8000 and a second terminal for curl. FastAPI is not running on the laptop. The page and the API are the container. Do not run python or uvicorn on the host. The list is in memory. It resets when the container restarts. Seeded ids are 1 (Apple) and 2 (Bread). The token is `secret-token`.

## 0–10 min — Read the Dockerfile

Project `Dockerfile`. One line at a time, same words as the page.

```dockerfile
FROM python:3.12-slim
```

Python is in the image. The laptop does not need it.

```dockerfile
WORKDIR /app
```

Later paths are `/app` inside the image.

```dockerfile
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
```

Install before the code. An edit to `app.py` does not reinstall FastAPI.

```dockerfile
COPY app.py .
COPY ui ./ui
```

The API and the page both go into the image.

```dockerfile
EXPOSE 8000
```

Documents the port inside the container. It does not publish it.

```dockerfile
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

`0.0.0.0` is required. `127.0.0.1` answers only inside the container. Compose could not reach that process.

Then `docker-compose.yml`. `8000:8000` is host:container. Curl and the browser use the host port.

```bash
docker compose ps
docker compose top
```

`top` shows uvicorn with `--host 0.0.0.0`. That process is inside the container. The slim image has no `ps` command of its own.

## 10–20 min — Say the three codes

- **422** is malformed input. A missing header, the wrong header name, or a bad JSON body. FastAPI rejects it before the route runs.
- **401** is the wrong token. The header is named `X-Token`, but the value is not `secret-token`. The dependency stops the route.
- **200** is the right header and the right token. POST and PUT also need a valid body: `name` (text) and `price` (number greater than 0).

## 20–35 min — CLI

```bash
chmod +x demo.sh
./demo.sh
```

Read the eight codes out loud. Then repeat two of them with `curl -i` so the room can see the body:

```bash
curl -i http://localhost:8000/api/items

curl -i http://localhost:8000/api/items -H "X-Token: nope"

curl -i http://localhost:8000/api/items -H "X-Token: secret-token"
```

On the 422, point at `loc`. It says `header` and `x-token`. On the 401, point at `detail`: `Invalid token`.

## 35–55 min — Same calls on the page

One preset at a time. Watch the pill and the curl line under it.

| Request | Code |
|---|---|
| GET + No header | 422 |
| GET + Wrong header | 422 |
| GET + Wrong token | 401 |
| GET + Correct token | 200 |
| POST + Correct token + Missing name | 422 |
| POST + Correct token + Price as text | 422 |
| POST + Correct token + Valid | 200 |
| PUT + Correct token + Valid, id 1 | 200 |
| DELETE + Correct token, id 1 | 200 |

A correct token and an id that is not in the list is **404**. That is not an auth failure. Say it once, then stay on 422, 401, and 200.

## Last 5 min

One student names the code a classmate just produced, and why. A missing or wrong header name is 422. A wrong token value is 401. `secret-token` plus a valid body is 200.
