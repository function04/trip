-- ============================================
-- 여행 플래너 웹 앱 - Supabase 테이블 생성 SQL
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. 환율
CREATE TABLE exchange_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  currency TEXT NOT NULL CHECK (currency IN ('GBP', 'EUR')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'cash')),
  rate_to_krw NUMERIC(12, 4) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (currency, payment_method)
);

-- 2. 일정 (Day별)
CREATE TABLE schedule_days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_number INT NOT NULL UNIQUE CHECK (day_number BETWEEN 1 AND 12),
  date DATE,
  title TEXT,
  summary TEXT,
  google_maps_url TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 일정 상세
CREATE TABLE schedule_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_id UUID NOT NULL REFERENCES schedule_days(id) ON DELETE CASCADE,
  seq INT NOT NULL,
  time_start TEXT,
  time_end TEXT,
  title TEXT NOT NULL,
  description TEXT,
  google_maps_url TEXT,
  transport_type TEXT,
  transport_detail TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 지출 (가계부 + 여행전 통합)
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_type TEXT NOT NULL CHECK (expense_type IN ('trip', 'pre_trip')),
  day_number INT CHECK (day_number BETWEEN 1 AND 12),
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('GBP', 'EUR', 'KRW')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'cash')),
  category TEXT NOT NULL,
  paid_by TEXT NOT NULL CHECK (paid_by IN ('구도현', '김상윤', 'n빵')),
  city TEXT,
  time TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_expenses_type_day ON expenses(expense_type, day_number);
CREATE INDEX idx_expenses_paid_by ON expenses(paid_by);

-- 5. 숙소정보
CREATE TABLE accommodations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_number INT NOT NULL CHECK (day_number BETWEEN 1 AND 12),
  name TEXT NOT NULL,
  google_maps_url TEXT,
  check_in_time TEXT,
  check_out_time TEXT,
  reservation_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. 준비사항
CREATE TABLE checklist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  is_checked BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. 향후 업그레이드
CREATE TABLE upgrade_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  is_done BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. 하트비트 로그
CREATE TABLE heartbeat_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pinged_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RLS 설정 (개인용 앱 - 모두 허용)
-- ============================================
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON exchange_rates FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE schedule_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON schedule_days FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON schedule_items FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON expenses FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON accommodations FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON checklist_items FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE upgrade_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON upgrade_notes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE heartbeat_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON heartbeat_log FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 시드 데이터
-- ============================================

-- 환율 초기값 (나중에 수정)
INSERT INTO exchange_rates (currency, payment_method, rate_to_krw) VALUES
  ('GBP', 'cash', 1720.0000),
  ('GBP', 'card', 1700.0000),
  ('EUR', 'cash', 1480.0000),
  ('EUR', 'card', 1460.0000);

-- Day 1~12 생성
INSERT INTO schedule_days (day_number) VALUES
  (1), (2), (3), (4), (5), (6),
  (7), (8), (9), (10), (11), (12);
