const BODIES = {
  valid: '{\n  "name": "Orange",\n  "price": 2.0\n}',
  "missing-name": '{\n  "price": 2.0\n}',
  "bad-price": '{\n  "name": "Orange",\n  "price": "nope"\n}',
};

const AUTH = {
  none: {
    hint: "No X-Token header. FastAPI treats a missing required header as 422.",
    headers: {},
  },
  "wrong-header": {
    hint: "Authorization is the wrong name. The route still wants X-Token, so this is 422.",
    headers: { Authorization: "Bearer secret-token" },
  },
  "wrong-token": {
    hint: "The header name is right. The value is not secret-token, so the dependency returns 401.",
    headers: { "X-Token": "nope" },
  },
  correct: {
    hint: "X-Token: secret-token. A valid body on POST or PUT returns 200.",
    headers: { "X-Token": "secret-token" },
  },
};

const state = {
  verb: "GET",
  auth: "correct",
  body: "valid",
};

const verbs = document.getElementById("verbs");
const authRow = document.getElementById("auth");
const bodies = document.getElementById("bodies");
const bodyBlock = document.getElementById("body-block");
const bodyBox = document.getElementById("body");
const idInput = document.getElementById("item-id");
const idHint = document.getElementById("id-hint");
const authHint = document.getElementById("auth-hint");
const pill = document.getElementById("pill");
const why = document.getElementById("why");
const responseBox = document.getElementById("response");
const curlBox = document.getElementById("curl");

bodyBox.value = BODIES.valid;

function select(row, attr, value) {
  for (const button of row.querySelectorAll("button")) {
    const on = button.dataset[attr] === value;
    button.classList.toggle("on", on);
    button.setAttribute("aria-pressed", on ? "true" : "false");
  }
}

function usesBody() {
  return state.verb === "POST" || state.verb === "PUT";
}

function path() {
  const id = idInput.value.trim();
  if (state.verb === "GET" && id === "") return "/api/items";
  if (state.verb === "POST") return "/api/items";
  return `/api/items/${id === "" ? "" : id}`;
}

function requestHeaders() {
  const headers = { ...AUTH[state.auth].headers };
  if (usesBody()) headers["Content-Type"] = "application/json";
  return headers;
}

function shellQuote(value) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

function curlLine() {
  const headers = requestHeaders();
  const lines = [`curl -i -X ${state.verb} http://localhost:8000${path()}`];
  for (const [name, value] of Object.entries(headers)) {
    lines.push(`  -H ${shellQuote(`${name}: ${value}`)}`);
  }
  if (usesBody()) lines.push(`  -d ${shellQuote(bodyBox.value)}`);
  return lines.join(" \\\n");
}

function refresh() {
  select(verbs, "verb", state.verb);
  select(authRow, "auth", state.auth);
  select(bodies, "body", state.body);
  bodyBlock.hidden = !usesBody();
  authHint.textContent = AUTH[state.auth].hint;
  if (state.verb === "GET") {
    idHint.textContent = "Leave blank to list every item. A number reads that one item.";
  } else if (state.verb === "POST") {
    idHint.textContent = "POST creates an item. The id field is ignored.";
  } else {
    idHint.textContent = "PUT and DELETE use this id. 1 and 2 are seeded.";
  }
  curlBox.textContent = curlLine();
}

function whyText(status) {
  if (status === 200) return "The header name and the token were right, and the body was valid.";
  if (status === 401) return "X-Token was present. The value was not secret-token, so the route never ran.";
  if (status === 422) return "The request was malformed. Read loc: a missing header, the wrong header name, or a bad body.";
  if (status === 404) return "The token was accepted. That id is not in the list.";
  return "Read the body. The status is the first thing to name out loud.";
}

verbs.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  state.verb = button.dataset.verb;
  refresh();
});

authRow.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  state.auth = button.dataset.auth;
  refresh();
});

bodies.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  state.body = button.dataset.body;
  bodyBox.value = BODIES[state.body];
  refresh();
});

idInput.addEventListener("input", refresh);
bodyBox.addEventListener("input", refresh);

document.getElementById("send").addEventListener("click", async () => {
  const headers = requestHeaders();
  const options = { method: state.verb, headers };
  if (usesBody()) options.body = bodyBox.value;
  pill.className = "pill";
  pill.textContent = "…";
  why.textContent = "";
  try {
    const res = await fetch(path(), options);
    const text = await res.text();
    let shown = text;
    try {
      shown = JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      shown = text || "(empty body)";
    }
    pill.textContent = String(res.status);
    pill.classList.add(`s${res.status}`);
    why.textContent = whyText(res.status);
    responseBox.textContent = shown;
  } catch (err) {
    pill.textContent = "—";
    why.textContent = "The browser could not reach the API.";
    responseBox.textContent = String(err);
  }
});

refresh();
