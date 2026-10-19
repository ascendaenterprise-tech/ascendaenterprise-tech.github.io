// Add these routes to the existing aec-portal-api Worker (after its auth check resolves `user`).
// `user.role` should be 'admin' for Izaiah and 'staff' for employees. Staff can read/add/edit; only admin can delete.
// Never log or return other users' credentials. Deal data lives only in D1, never in the public repo.
async function reDeals(request, env, user, url) {
  const m = url.pathname.match(/^\/re\/deals(?:\/([^/]+))?$/);
  if (!m) return null;
  const id = m[1], json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json' } });
  const F = ['address','city','type','status','owner','contract_date','close_date','purchase_price','rehab_cost','holding_cost','closing_cost','other_cost','arv','sale_price','notes'];
  if (request.method === 'GET' && !id) {
    const { results } = await env.DB.prepare('SELECT * FROM re_deals ORDER BY COALESCE(close_date, contract_date) DESC').all();
    return json({ deals: results });
  }
  if (request.method === 'POST' && !id) {
    const b = await request.json();
    if (!b.address || !['pending','active','closed'].includes(b.status)) return json({ error: 'address and valid status required' }, 400);
    const nid = crypto.randomUUID();
    await env.DB.prepare(`INSERT INTO re_deals (id,${F.join(',')},created_by) VALUES (?,${F.map(()=>'?').join(',')},?)`)
      .bind(nid, ...F.map(k => b[k] ?? null), user.email).run();
    return json({ deal: { id: nid, ...Object.fromEntries(F.map(k => [k, b[k] ?? null])) } }, 201);
  }
  if (request.method === 'PUT' && id) {
    const b = await request.json();
    await env.DB.prepare(`UPDATE re_deals SET ${F.map(k => k + '=?').join(',')}, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(...F.map(k => b[k] ?? null), id).run();
    return json({ deal: { id, ...Object.fromEntries(F.map(k => [k, b[k] ?? null])) } });
  }
  if (request.method === 'DELETE' && id) {
    if (user.role !== 'admin') return json({ error: 'Only an admin can delete deals' }, 403);
    await env.DB.prepare('DELETE FROM re_deals WHERE id=?').bind(id).run();
    return json({ ok: true });
  }
  return json({ error: 'Not found' }, 404);
}
// In the main fetch handler: const r = await reDeals(request, env, user, url); if (r) return r;
