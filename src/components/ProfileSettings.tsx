import React, { useState } from 'react';
import type { BudgetConfig, Transaction } from '../types';
import { User, Moon, Sun, Download, Upload, AlertTriangle } from 'lucide-react';

interface ProfileSettingsProps {
  config: BudgetConfig;
  onUpdateConfig: (config: BudgetConfig) => void;
  transactions: Transaction[];
  onImportTransactions: (txs: Transaction[]) => void;
  onResetTransactions: (type: 'sample' | 'empty') => void;
  onResetCategories: () => void;
  onResetConfig: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  config,
  onUpdateConfig,
  transactions,
  onImportTransactions,
  onResetTransactions,
  onResetCategories,
  onResetConfig,
  theme,
  onToggleTheme
}) => {
  const [username, setUsername] = useState(config.username);
  const [monthlyBudget, setMonthlyBudget] = useState(config.monthlyBudget.toString());
  const [targetSavings, setTargetSavings] = useState(config.targetSavings.toString());
  const [avatarEmoji, setAvatarEmoji] = useState(config.avatarEmoji);

  const emojiList = ['🦊', '🐰', '🐼', '🐱', '🐶', '🦁', '🐻', '🐨', '🐯', '🤖', '👑', '💼'];

  // 설정 저장
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetVal = parseFloat(monthlyBudget.replace(/,/g, '')) || 0;
    const savingsVal = parseFloat(targetSavings.replace(/,/g, '')) || 0;
    
    onUpdateConfig({
      username,
      monthlyBudget: budgetVal,
      targetSavings: savingsVal,
      avatarEmoji,
      baseAsset: config.baseAsset
    });
    
    alert('설정이 성공적으로 저장되었습니다!');
  };

  // 쉼표 숫자 변환기
  const formatNumberInput = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    if (!raw) return '';
    return new Intl.NumberFormat('ko-KR').format(parseInt(raw, 10));
  };

  // 데이터 내보내기 (JSON 다운로드)
  const handleExport = () => {
    const dataStr = JSON.stringify({ config, transactions }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wednesday_ledger_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 데이터 가져오기 (JSON 업로드)
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.transactions && Array.isArray(parsed.transactions)) {
          onImportTransactions(parsed.transactions);
          if (parsed.config) {
            onUpdateConfig(parsed.config);
            setUsername(parsed.config.username);
            setMonthlyBudget(parsed.config.monthlyBudget.toString());
            setTargetSavings(parsed.config.targetSavings.toString());
            setAvatarEmoji(parsed.config.avatarEmoji);
          }
          alert('데이터를 성공적으로 불러왔습니다!');
        } else {
          alert('올바르지 않은 가계부 백업 파일 형태입니다.');
        }
      } catch (err) {
        alert('파일을 분석하는 데 실패했습니다.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }} className="responsive-grid">
        
        {/* 1. 개인화 프로필 설정 */}
        <div className="premium-card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} /> 프로필 및 예산 설정
          </h3>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* 이모지 아바타 선택 */}
            <div className="form-group">
              <label className="form-label">프로필 아바타 (이모지)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px', background: 'var(--primary-light)', borderRadius: '10px' }}>
                {emojiList.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatarEmoji(emoji)}
                    style={{
                      fontSize: '24px',
                      background: avatarEmoji === emoji ? 'var(--card-bg)' : 'transparent',
                      border: avatarEmoji === emoji ? '1.5px solid var(--primary-color)' : 'none',
                      borderRadius: '8px',
                      padding: '4px',
                      cursor: 'pointer',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.1s'
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* 사용자명 */}
            <div className="form-group">
              <label className="form-label">사용자 이름</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* 월별 수입 예산 */}
            <div className="form-group">
              <label className="form-label">평균 월 수익 예산 (원)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(formatNumberInput(e.target.value))}
                  style={{ width: '100%', paddingRight: '40px' }}
                  required
                />
                <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>원</span>
              </div>
            </div>

            {/* 목표 저축액 */}
            <div className="form-group">
              <label className="form-label">월 목표 저축액 (원)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  value={targetSavings}
                  onChange={(e) => setTargetSavings(formatNumberInput(e.target.value))}
                  style={{ width: '100%', paddingRight: '40px' }}
                  required
                />
                <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>원</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px', width: '100%' }}>
              설정 저장하기
            </button>

          </form>
        </div>

        {/* 2. 테마 및 시스템 관리 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 다크/라이트 테마 설정 */}
          <div className="premium-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '700' }}>화면 테마 설정</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>라이트 모드와 다크 모드를 설정합니다.</p>
            </div>
            <button 
              className="btn" 
              onClick={onToggleTheme} 
              style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '120px' }}
            >
              {theme === 'light' ? (
                <>
                  <Moon size={16} /> <span>다크 모드</span>
                </>
              ) : (
                <>
                  <Sun size={16} style={{ color: 'var(--color-savings)' }} /> <span>라이트 모드</span>
                </>
              )}
            </button>
          </div>

          {/* 백업 및 복원 */}
          <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '700' }}>데이터 백업 및 복원</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>가계부 내역을 JSON 파일로 내보내거나 가져옵니다.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn" onClick={handleExport} style={{ flex: 1, padding: '10px' }}>
                <Download size={16} /> 내보내기
              </button>
              
              <label className="btn" style={{ flex: 1, padding: '10px', display: 'flex', gap: '8px', cursor: 'pointer' }}>
                <Upload size={16} /> 가져오기
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImport} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
          </div>

          {/* 개별 기능 초기화 */}
          <div className="premium-card" style={{ border: '1px solid rgba(214,113,96,0.4)', background: 'rgba(214,113,96,0.01)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-expense)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} /> 개별 영역 데이터 초기화
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              가계부의 특정 영역별 데이터를 개별적으로 선택하여 초기화할 수 있습니다.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* 1. 거래 내역 초기화 (대시보드/기록/캘린더/분석 연동) */}
              <div style={{ padding: '10px', background: 'var(--bg-color)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>📝 거래 내역 초기화 (대시보드·기록·캘린더)</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    type="button"
                    className="btn btn-ghost" 
                    onClick={() => {
                      if (confirm('모든 거래 기록을 지우고 丕刀卜己卜人丨廿卜 샘플 내역으로 복원하시겠습니까?')) {
                        onResetTransactions('sample');
                      }
                    }}
                    style={{ flex: 1, fontSize: '11px', padding: '6px' }}
                  >
                    샘플로 복원
                  </button>
                  <button 
                    type="button"
                    className="btn" 
                    onClick={() => {
                      if (confirm('모든 거래 기록을 완전히 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
                        onResetTransactions('empty');
                      }
                    }}
                    style={{ flex: 1, fontSize: '11px', padding: '6px', borderColor: 'var(--color-expense)', color: 'var(--color-expense)' }}
                  >
                    기록 전체 삭제
                  </button>
                </div>
              </div>

              {/* 2. 분류 카테고리 초기화 */}
              <div style={{ padding: '10px', background: 'var(--bg-color)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '700', display: 'block' }}>⚙️ 카테고리 설정 초기화</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>대/중/소분류를 기본값으로 리셋</span>
                </div>
                <button 
                  type="button"
                  className="btn btn-ghost" 
                  onClick={() => {
                    if (confirm('분류 카테고리 설정을 공통 기본 규격으로 초기화하시겠습니까?')) {
                      onResetCategories();
                    }
                  }}
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                >
                  기본값 리셋
                </button>
              </div>

              {/* 3. 프로필 및 예산 목표 초기화 */}
              <div style={{ padding: '10px', background: 'var(--bg-color)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '700', display: 'block' }}>🦊 프로필 및 예산 목표 초기화</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>이름, 예산, 저축목표 초기화</span>
                </div>
                <button 
                  type="button"
                  className="btn btn-ghost" 
                  onClick={() => {
                    if (confirm('사용자 프로필명과 예산 및 저축 목표 수치를 기본값으로 복구하시겠습니까?')) {
                      onResetConfig();
                    }
                  }}
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                >
                  기본값 리셋
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
