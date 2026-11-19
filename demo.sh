#!/usr/bin/env bash
# Print only the status code for the classroom matrix.
# Expect: 422, 422, 401, 200, 422, 200, 200, 200
set -euo pipefail
BASE="${BASE:-http://localhost:8000}"

code() {
  local label="$1"
  shift
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" "$@")
  printf "%s  %s\n" "$status" "$label"
}

code "GET no header" \
  "$BASE/api/items"

code "GET wrong header name" \
  -H "Authorization: Bearer secret-token" \
  "$BASE/api/items"

code "GET wrong token" \
  -H "X-Token: nope" \
  "$BASE/api/items"

code "GET correct token" \
  -H "X-Token: secret-token" \
  "$BASE/api/items"

code "POST correct token, missing name" \
  -X POST \
  -H "X-Token: secret-token" \
  -H "Content-Type: application/json" \
  -d '{"price": 2.0}' \
  "$BASE/api/items"

code "POST correct token, valid body" \
  -X POST \
  -H "X-Token: secret-token" \
  -H "Content-Type: application/json" \
  -d '{"name": "Orange", "price": 2.0}' \
  "$BASE/api/items"

code "PUT correct token" \
  -X PUT \
  -H "X-Token: secret-token" \
  -H "Content-Type: application/json" \
  -d '{"name": "Apple", "price": 1.5}' \
  "$BASE/api/items/1"

code "DELETE correct token" \
  -X DELETE \
  -H "X-Token: secret-token" \
  "$BASE/api/items/1"
