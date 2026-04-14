import { useState } from 'react';
import { isValidNickname, saveNickname } from '../utils/nickname';

interface NicknameModalProps {
  onConfirm: (nickname: string) => void;
}

export function NicknameModal({ onConfirm }: NicknameModalProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!isValidNickname(trimmed)) {
      setError('2~8자로 입력해주세요');
      return;
    }
    saveNickname(trimmed);
    onConfirm(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="nick-overlay">
      <div className="nick-modal pixel-panel">
        <div className="nick-title">단타왕의 이름은?</div>
        <div className="nick-desc">순위표에 올라가는 이름이에요</div>

        <input
          className="nick-input"
          type="text"
          maxLength={8}
          placeholder="2~8자 입력"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          autoFocus
        />

        {error && <div className="nick-error">{error}</div>}

        <div className="nick-count">{value.trim().length}/8</div>

        <button
          className="btn-retro btn-pixel nick-btn"
          disabled={!isValidNickname(value)}
          onClick={handleSubmit}
        >
          확인
        </button>
      </div>

      <style>{`
        .nick-overlay {
          position: absolute;
          inset: 0;
          z-index: 100;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: fadeSlideIn 0.2s ease-out;
        }
        .nick-modal {
          width: 100%;
          max-width: 300px;
          padding: 28px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .nick-title {
          font-size: 16px;
          color: var(--text);
        }
        .nick-desc {
          font-size: 11px;
          color: var(--muted);
        }
        .nick-input {
          width: 100%;
          padding: 10px 12px;
          font-family: var(--font-kr);
          font-size: 14px;
          color: var(--text);
          background: var(--bg);
          border: 2px solid var(--border);
          border-radius: 4px;
          outline: none;
          text-align: center;
        }
        .nick-input:focus {
          border-color: var(--accent);
        }
        .nick-input::placeholder {
          color: var(--muted);
          font-size: 12px;
        }
        .nick-error {
          font-size: 10px;
          color: var(--loss);
        }
        .nick-count {
          font-family: var(--font-en);
          font-size: 9px;
          color: var(--muted);
          text-align: right;
          margin-top: -8px;
        }
        .nick-btn {
          width: 100%;
          height: 44px;
          font-size: 14px;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}
