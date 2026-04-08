-- =====================================================
-- Surrah Platform — Event Planning Module Schema
-- Run these in your Supabase SQL editor
-- =====================================================

-- 1. Event Proposals
CREATE TABLE IF NOT EXISTS event_proposals (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id          UUID        REFERENCES events(id) ON DELETE CASCADE,
  type              TEXT,
  theme             TEXT,
  venue             TEXT,
  target_market     TEXT,
  target_attendees  INTEGER,
  description       TEXT,
  mission           TEXT,
  objectives        JSONB       DEFAULT '[]',
  status            TEXT        DEFAULT 'draft'
                    CHECK (status IN ('draft','submitted','approved','rejected')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Departments
CREATE TABLE IF NOT EXISTS departments (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id         UUID        REFERENCES events(id) ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  head_name        TEXT,
  head_email       TEXT,
  head_phone       TEXT,
  job_description  TEXT,
  color            TEXT        DEFAULT '#7c4dda',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id         UUID        REFERENCES events(id) ON DELETE CASCADE,
  department_id    UUID        REFERENCES departments(id) ON DELETE SET NULL,
  name             TEXT        NOT NULL,
  role             TEXT,
  email            TEXT,
  phone            TEXT,
  responsibilities TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tasks (Kanban)
CREATE TABLE IF NOT EXISTS tasks (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id      UUID        REFERENCES events(id) ON DELETE CASCADE,
  department_id UUID        REFERENCES departments(id) ON DELETE SET NULL,
  title         TEXT        NOT NULL,
  description   TEXT,
  assigned_to   TEXT,
  due_date      DATE,
  priority      TEXT        DEFAULT 'medium'
                CHECK (priority IN ('high','medium','low')),
  status        TEXT        DEFAULT 'todo'
                CHECK (status IN ('todo','in_progress','review','done')),
  "order"       INTEGER     DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Timeline Items (Gantt)
CREATE TABLE IF NOT EXISTS timeline_items (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id      UUID        REFERENCES events(id) ON DELETE CASCADE,
  department_id UUID        REFERENCES departments(id) ON DELETE SET NULL,
  title         TEXT        NOT NULL,
  start_date    DATE,
  end_date      DATE,
  assigned_to   TEXT,
  type          TEXT        DEFAULT 'task'
                CHECK (type IN ('task','milestone','phase')),
  color         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Agenda Items
CREATE TABLE IF NOT EXISTS agenda_items (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id    UUID        REFERENCES events(id) ON DELETE CASCADE,
  day_number  INTEGER     DEFAULT 1,
  date        DATE,
  start_time  TIME,
  end_time    TIME,
  title       TEXT        NOT NULL,
  speaker     TEXT,
  location    TEXT,
  notes       TEXT,
  "order"     INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Budget Items V2 (replaces the simpler budget_items)
CREATE TABLE IF NOT EXISTS budget_items_v2 (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id        UUID        REFERENCES events(id) ON DELETE CASCADE,
  category        TEXT        NOT NULL,
  description     TEXT,
  estimated_cost  NUMERIC     DEFAULT 0,
  actual_cost     NUMERIC     DEFAULT 0,
  vendor          TEXT,
  payment_status  TEXT        DEFAULT 'pending'
                  CHECK (payment_status IN ('pending','paid','overdue')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Risks
CREATE TABLE IF NOT EXISTS risks (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id    UUID        REFERENCES events(id) ON DELETE CASCADE,
  description TEXT        NOT NULL,
  category    TEXT,
  likelihood  INTEGER     DEFAULT 1 CHECK (likelihood BETWEEN 1 AND 5),
  impact      INTEGER     DEFAULT 1 CHECK (impact BETWEEN 1 AND 5),
  mitigation  TEXT,
  owner       TEXT,
  status      TEXT        DEFAULT 'open'
              CHECK (status IN ('open','mitigated','closed')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Enable Row Level Security (RLS) — optional but recommended
-- =====================================================
ALTER TABLE event_proposals  ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items_v2   ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks             ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (adjust to your auth strategy)
CREATE POLICY "auth_all" ON event_proposals  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON departments       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON team_members      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON tasks             FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON timeline_items    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON agenda_items      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON budget_items_v2   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON risks             FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- Indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_event_proposals_event  ON event_proposals(event_id);
CREATE INDEX IF NOT EXISTS idx_departments_event      ON departments(event_id);
CREATE INDEX IF NOT EXISTS idx_team_members_event     ON team_members(event_id);
CREATE INDEX IF NOT EXISTS idx_team_members_dept      ON team_members(department_id);
CREATE INDEX IF NOT EXISTS idx_tasks_event            ON tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status           ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_timeline_event         ON timeline_items(event_id);
CREATE INDEX IF NOT EXISTS idx_agenda_event           ON agenda_items(event_id);
CREATE INDEX IF NOT EXISTS idx_budget_v2_event        ON budget_items_v2(event_id);
CREATE INDEX IF NOT EXISTS idx_risks_event            ON risks(event_id);
