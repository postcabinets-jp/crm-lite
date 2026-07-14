-- ============================================================
-- CRM Lite — Initial Schema
-- ============================================================

-- organizations
CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  industry    TEXT,
  website     TEXT,
  plan        TEXT NOT NULL DEFAULT 'free',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_organizations_user ON organizations(user_id);

-- contacts
CREATE TABLE contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  company     TEXT,
  position    TEXT,
  status      TEXT NOT NULL DEFAULT 'lead',
  tags        TEXT[] NOT NULL DEFAULT '{}',
  notes       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT contacts_status_check CHECK (
    status IN ('lead', 'prospect', 'customer', 'churned')
  )
);

CREATE INDEX idx_contacts_org ON contacts(org_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_company ON contacts(company);

-- companies
CREATE TABLE companies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  domain          TEXT,
  industry        TEXT,
  employee_count  INT CHECK (employee_count >= 0),
  website_url     TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_companies_org ON companies(org_id);

-- pipelines
CREATE TABLE pipelines (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  stages      JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pipelines_org ON pipelines(org_id);

-- deals
CREATE TABLE deals (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id               UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id           UUID REFERENCES contacts(id) ON DELETE SET NULL,
  title                TEXT NOT NULL,
  value                NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency             CHAR(3) NOT NULL DEFAULT 'JPY',
  stage                TEXT NOT NULL DEFAULT 'lead',
  probability          SMALLINT NOT NULL DEFAULT 0,
  expected_close_date  DATE,
  notes                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT deals_stage_check CHECK (
    stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')
  ),
  CONSTRAINT deals_probability_check CHECK (probability BETWEEN 0 AND 100)
);

CREATE INDEX idx_deals_org ON deals(org_id);
CREATE INDEX idx_deals_contact ON deals(contact_id);
CREATE INDEX idx_deals_stage ON deals(stage);

-- activities
CREATE TABLE activities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  deal_id      UUID REFERENCES deals(id) ON DELETE CASCADE,
  contact_id   UUID REFERENCES contacts(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed    BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT activities_type_check CHECK (
    type IN ('call', 'email', 'meeting', 'note', 'task')
  )
);

CREATE INDEX idx_activities_org ON activities(org_id);
CREATE INDEX idx_activities_deal ON activities(deal_id);
CREATE INDEX idx_activities_contact ON activities(contact_id);
CREATE INDEX idx_activities_due ON activities(scheduled_at) WHERE completed = false;

-- tags
CREATE TABLE tags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#6B7280',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, name)
);

CREATE INDEX idx_tags_org ON tags(org_id);

-- ============================================================
-- updated_at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER pipelines_updated_at BEFORE UPDATE ON pipelines
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE organizations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines      ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags           ENABLE ROW LEVEL SECURITY;

-- Helper: current user's organization id
CREATE OR REPLACE FUNCTION current_org_id() RETURNS UUID
  LANGUAGE sql STABLE
  AS $$
    SELECT id FROM organizations WHERE user_id = auth.uid() LIMIT 1;
  $$;

-- organizations: only owner can read/write
CREATE POLICY "organizations_owner"
  ON organizations FOR ALL
  USING (user_id = auth.uid());

-- All child tables: org_id must match the user's org
CREATE POLICY "contacts_org_policy"
  ON contacts FOR ALL
  USING (org_id = current_org_id());

CREATE POLICY "companies_org_policy"
  ON companies FOR ALL
  USING (org_id = current_org_id());

CREATE POLICY "pipelines_org_policy"
  ON pipelines FOR ALL
  USING (org_id = current_org_id());

CREATE POLICY "deals_org_policy"
  ON deals FOR ALL
  USING (org_id = current_org_id());

CREATE POLICY "activities_org_policy"
  ON activities FOR ALL
  USING (org_id = current_org_id());

CREATE POLICY "tags_org_policy"
  ON tags FOR ALL
  USING (org_id = current_org_id());
