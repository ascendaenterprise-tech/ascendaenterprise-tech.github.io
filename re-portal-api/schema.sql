-- Cloudflare D1 schema for the AEC Real Estate portal (run once: wrangler d1 execute <DB> --file=schema.sql)
CREATE TABLE IF NOT EXISTS re_deals (
  id TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  city TEXT, type TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending','active','closed')),
  owner TEXT,
  contract_date TEXT, close_date TEXT,
  purchase_price REAL, rehab_cost REAL, holding_cost REAL, closing_cost REAL, other_cost REAL,
  arv REAL, sale_price REAL,
  notes TEXT,
  created_by TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_re_deals_status ON re_deals(status);
