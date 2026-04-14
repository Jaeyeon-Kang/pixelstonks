import { useEffect, useState } from 'react';
import type { LeaderboardEntry } from '../types';
import { fetchDailyTop100 } from '../services/leaderboard';
import { getUserId } from '../utils/userId';
import { CHARACTERS } from '../config/characters';

interface RankingScreenProps {
  onBack: () => void;
}

const charEmoji: Record<string, string> = Object.fromEntries(
  CHARACTERS.map((c) => [c.id, c.emoji]),
);

export function RankingScreen({ onBack }: RankingScreenProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const myUserId = getUserId();

  useEffect(() => {
    fetchDailyTop100().then(({ entries: data, error: err }) => {
      setEntries(data);
      setError(err);
      setLoading(false);
    });
  }, []);

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="ranking">
      {/* 헤더 */}
      <div className="ranking-header">
        <button className="ranking-back btn-retro" onClick={onBack}>
          ◀
        </button>
        <div className="ranking-title-area">
          <div className="ranking-title">일간 랭킹</div>
          <div className="ranking-date">{dateStr}</div>
        </div>
        <div className="ranking-spacer" />
      </div>

      {/* 리스트 */}
      <div className="ranking-list">
        {loading && (
          <div className="ranking-status">
            <span className="ranking-loading">로딩 중...</span>
          </div>
        )}

        {error && (
          <div className="ranking-status">
            <span className="ranking-error">{error}</span>
            <span className="ranking-error-sub">Supabase 연결을 확인하세요</span>
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div className="ranking-status">
            <span className="ranking-empty">아직 기록이 없습니다</span>
            <span className="ranking-empty-sub">첫 번째 기록을 남겨보세요!</span>
          </div>
        )}

        {entries.map((entry) => {
          const isMe = entry.user_id === myUserId;
          const profitClass = entry.profit_rate >= 0 ? 'profit-positive' : 'profit-negative';
          const profitSign = entry.profit_rate >= 0 ? '+' : '';
          const rankMark = entry.rank === 1 ? '1st' : entry.rank === 2 ? '2nd' : entry.rank === 3 ? '3rd' : '';

          return (
            <div
              key={entry.id}
              className={`ranking-row ${isMe ? 'ranking-row-me' : ''}`}
            >
              <div className={`ranking-rank ${entry.rank! <= 3 ? 'ranking-top3' : ''}`}>
                {rankMark || `#${entry.rank}`}
              </div>
              <div className="ranking-nick">
                {entry.nickname}
                {isMe && <span className="ranking-me-badge">ME</span>}
              </div>
              <div className={`ranking-profit ${profitClass}`}>
                {profitSign}{entry.profit_rate.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .ranking {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 12px;
          gap: 8px;
        }
        .ranking-header {
          display: flex;
          align-items: center;
          padding: 8px 0;
          gap: 8px;
        }
        .ranking-back {
          width: 36px;
          height: 36px;
          font-size: 14px;
          color: var(--text);
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ranking-title-area {
          flex: 1;
          text-align: center;
        }
        .ranking-title {
          font-size: 16px;
          color: var(--accent);
        }
        .ranking-date {
          font-family: var(--font-en);
          font-size: 10px;
          color: var(--muted);
          margin-top: 4px;
        }
        .ranking-spacer {
          width: 36px;
        }

        .ranking-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-bottom: 20px;
          -webkit-overflow-scrolling: touch;
        }
        .ranking-list::-webkit-scrollbar {
          width: 3px;
        }
        .ranking-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .ranking-list::-webkit-scrollbar-thumb {
          background: var(--muted);
          border-radius: 2px;
        }

        .ranking-status {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .ranking-loading {
          font-size: 12px;
          color: var(--text);
          animation: blink 1s infinite;
        }
        .ranking-error {
          font-size: 12px;
          color: var(--loss);
        }
        .ranking-error-sub {
          font-size: 10px;
          color: var(--muted);
        }
        .ranking-empty {
          font-size: 12px;
          color: var(--text);
        }
        .ranking-empty-sub {
          font-size: 10px;
          color: var(--muted);
        }

        .ranking-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          background: var(--surface);
          border: 1px solid transparent;
          border-radius: 4px;
          transition: background 0.15s;
        }
        .ranking-row-me {
          border-color: var(--accent);
          background: rgba(255,207,64,0.06);
          box-shadow: 0 0 6px rgba(255,207,64,0.15);
        }
        .ranking-rank {
          font-family: var(--font-en);
          font-size: 10px;
          color: var(--text-sub);
          min-width: 32px;
          text-align: center;
        }
        .ranking-top3 {
          color: var(--accent);
        }
        .ranking-nick {
          font-size: 11px;
          color: var(--text);
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .ranking-me-badge {
          font-family: var(--font-en);
          font-size: 8px;
          color: var(--bg);
          background: var(--accent);
          padding: 1px 4px;
          border-radius: 2px;
          font-weight: bold;
          flex-shrink: 0;
        }
        .ranking-profit {
          font-family: var(--font-en);
          font-size: 11px;
          min-width: 60px;
          text-align: right;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
