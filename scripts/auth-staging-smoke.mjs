import assert from "node:assert/strict";
import process from "node:process";

const baseUrl = process.env.AUTH_STAGING_BASE_URL?.replace(/\/$/, "");
const email = process.env.AUTH_STAGING_EMAIL;
const password = process.env.AUTH_STAGING_PASSWORD;

if (!baseUrl || !email || !password) {
  throw new Error("Defina AUTH_STAGING_BASE_URL, AUTH_STAGING_EMAIL e AUTH_STAGING_PASSWORD fora do repositório.");
}
if (new URL(baseUrl).protocol !== "https:") throw new Error("O smoke test real exige uma URL HTTPS de staging.");

function cookieList(response) {
  if (typeof response.headers.getSetCookie === "function") return response.headers.getSetCookie();
  const value = response.headers.get("set-cookie");
  return value ? [value] : [];
}

function cookieHeader(response) {
  return cookieList(response).map((value) => value.split(";", 1)[0]).join("; ");
}

async function post(path, body, cookie = "") {
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    redirect: "manual",
    headers: { origin: baseUrl, "content-type": "application/json", ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body),
  });
}

const publicPage = await fetch(baseUrl, { redirect: "manual" });
assert.equal(publicPage.status, 200);
assert.doesNotMatch(publicPage.headers.get("cache-control") || "", /private|no-store/i);

const anonymousAccount = await fetch(`${baseUrl}/conta`, { redirect: "manual" });
assert.match(String(anonymousAccount.status), /^30[1278]$/);
assert.equal(new URL(anonymousAccount.headers.get("location"), baseUrl).pathname, "/entrar");

const login = await post("/api/auth/login", { email, password });
assert.equal(login.status, 200, "A conta de staging não conseguiu entrar.");
const cookies = cookieList(login);
assert.equal(cookies.length, 2);
for (const cookie of cookies) {
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Lax/i);
  assert.match(cookie, /Secure/i);
}
const sessionCookie = cookieHeader(login);

const session = await fetch(`${baseUrl}/api/auth/session`, { headers: { cookie: sessionCookie } });
assert.equal(session.status, 200);
assert.equal((await session.json()).authenticated, true);

const account = await fetch(`${baseUrl}/conta`, { redirect: "manual", headers: { cookie: sessionCookie } });
assert.equal(account.status, 200);
assert.match(account.headers.get("cache-control") || "", /private/);
assert.match(account.headers.get("cache-control") || "", /no-store/);

const logout = await post("/api/auth/logout", {}, sessionCookie);
assert.equal(logout.status, 200);
for (const cookie of cookieList(logout)) assert.match(cookie, /Max-Age=0/i);

console.log("Auth staging smoke: login, sessão, rota protegida, cookies, logout e cache passaram.");
