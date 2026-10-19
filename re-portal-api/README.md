# Real Estate portal API

`aec-re-portal.html` is a static page. All deal data comes from the authenticated portal API; nothing real is stored in this repo.

Endpoints (Bearer token from `/login`): `GET /re/deals`, `POST /re/deals`, `PUT /re/deals/:id`, `DELETE /re/deals/:id` (admin only).

Deploy: 1) `wrangler d1 execute <DB> --file=schema.sql`  2) paste `worker-routes.js` into aec-portal-api and call `reDeals` after auth  3) make sure CORS allows PUT/DELETE and the `Authorization` header  4) create employee logins.

Layout preview with clearly-labelled sample data: open `aec-re-portal.html?preview=1` (saves nothing).
