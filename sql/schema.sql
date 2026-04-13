-- ================================================
-- 픽셀단타왕 (Pixel Stonks) — 일간 리더보드 스키마
-- Supabase 대시보드 SQL Editor에서 실행
-- ================================================

-- 1. daily_scores 테이블
CREATE TABLE IF NOT EXISTS daily_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,                    -- 디바이스별 익명 ID
  nickname TEXT NOT NULL,                   -- 랜덤 생성 닉네임
  character_id TEXT NOT NULL,               -- 사용 캐릭터
  scenario_id INTEGER NOT NULL,             -- 시나리오 ID
  profit_rate NUMERIC(10, 2) NOT NULL,      -- 수익률 (%)
  played_at DATE NOT NULL DEFAULT CURRENT_DATE,  -- 플레이 날짜
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 인덱스: 일간 랭킹 조회 최적화
CREATE INDEX IF NOT EXISTS idx_daily_scores_ranking
  ON daily_scores (played_at DESC, profit_rate DESC);

CREATE INDEX IF NOT EXISTS idx_daily_scores_user
  ON daily_scores (user_id, played_at DESC);

-- 3. RLS (Row Level Security) 활성화
ALTER TABLE daily_scores ENABLE ROW LEVEL SECURITY;

-- 읽기: 누구나 가능
CREATE POLICY "daily_scores_select"
  ON daily_scores FOR SELECT
  USING (true);

-- 쓰기: anon 키로 INSERT만 허용
CREATE POLICY "daily_scores_insert"
  ON daily_scores FOR INSERT
  WITH CHECK (true);

-- UPDATE/DELETE 차단 (정책 없음 = 거부)

-- 4. 일간 Top 100 조회 함수 (RPC)
CREATE OR REPLACE FUNCTION get_daily_top100(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  rank BIGINT,
  nickname TEXT,
  character_id TEXT,
  scenario_id INTEGER,
  profit_rate NUMERIC,
  user_id TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY ds.profit_rate DESC) AS rank,
    ds.nickname,
    ds.character_id,
    ds.scenario_id,
    ds.profit_rate,
    ds.user_id
  FROM daily_scores ds
  WHERE ds.played_at = target_date
  ORDER BY ds.profit_rate DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 유저 일간 최고 기록 조회 함수
CREATE OR REPLACE FUNCTION get_user_daily_best(
  p_user_id TEXT,
  target_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  rank BIGINT,
  profit_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked AS (
    SELECT
      ROW_NUMBER() OVER (ORDER BY ds.profit_rate DESC) AS rn,
      ds.profit_rate,
      ds.user_id
    FROM daily_scores ds
    WHERE ds.played_at = target_date
  )
  SELECT rn AS rank, ranked.profit_rate
  FROM ranked
  WHERE ranked.user_id = p_user_id
  ORDER BY ranked.profit_rate DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 오래된 데이터 자동 정리 (선택사항: 30일 이상)
-- pg_cron 확장 활성화 후:
-- SELECT cron.schedule('cleanup-old-scores', '0 4 * * *',
--   $$DELETE FROM daily_scores WHERE played_at < CURRENT_DATE - INTERVAL '30 days'$$
-- );
