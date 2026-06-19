import { useState, useEffect } from 'react';
import type { Transaction, CategoryStructure, BudgetConfig } from './types';
import { 
  DEFAULT_CATEGORIES, 
  DEFAULT_BUDGET_CONFIG, 
  INITIAL_TRANSACTIONS 
} from './constants';
import { Dashboard } from './components/Dashboard';
import { TransactionManager } from './components/TransactionManager';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { CategorySettings } from './components/CategorySettings';
import { ProfileSettings } from './components/ProfileSettings';

import { 
  LayoutDashboard, 
  Receipt, 
  Calendar as CalendarIcon, 
  BarChart3, 
  FolderTree, 
  User, 
  Moon, 
  Sun 
} from 'lucide-react';

function App() {
  // 1. 상태 선언 (로컬 스토리지 데이터 로드 및 초기값 적용)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('wednesday_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [categories, setCategories] = useState<CategoryStructure>(() => {
    const saved = localStorage.getItem('wednesday_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [config, setConfig] = useState<BudgetConfig>(() => {
    const saved = localStorage.getItem('wednesday_budget_config');
    return saved ? JSON.parse(saved) : DEFAULT_BUDGET_CONFIG;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('wednesday_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  // 퀵 입력에서 날짜를 인수로 받아 캘린더 이동 혹은 기록 탭 전환을 위해 퀵 등록용 날짜 상태 추가 가능
  const [targetDateForNewTx, setTargetDateForNewTx] = useState<string | null>(null);

  // 2. 로컬 스토리지 및 테마 속성 동기화
  useEffect(() => {
    localStorage.setItem('wednesday_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('wednesday_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('wednesday_budget_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('wednesday_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 3. 거래 내역 관리 기능 함수
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}`
    };
    setTransactions(prev => [tx, ...prev]);
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleImportTransactions = (importedTxs: Transaction[]) => {
    setTransactions(importedTxs);
  };

  const handleResetTransactions = (type: 'sample' | 'empty') => {
    setTransactions(type === 'sample' ? INITIAL_TRANSACTIONS : []);
    alert(type === 'sample' ? '거래 내역이 샘플 데이터로 복원되었습니다.' : '모든 거래 기록이 완전히 삭제되었습니다.');
  };

  const handleResetCategories = () => {
    setCategories(DEFAULT_CATEGORIES);
    alert('카테고리 분류 설정이 기본값으로 초기화되었습니다.');
  };

  const handleResetConfig = () => {
    setConfig(DEFAULT_BUDGET_CONFIG);
    alert('프로필 및 예산 목표 설정이 기본값으로 초기화되었습니다.');
  };

  // 캘린더에서 "이 날짜로 등록하기" 버튼 클릭 시 작동
  const handleQuickAddFromCalendar = (date: string) => {
    setTargetDateForNewTx(date);
    setActiveTab('transactions');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      
      {/* 왼쪽 네비게이션 사이드바 (Sidebar) */}
      <aside style={{ 
        width: '280px', 
        background: 'var(--sidebar-bg)', 
        borderRight: '1px solid var(--border-color)',
        padding: '28px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        flexShrink: 0
      }} className="sidebar-container">
        
        {/* 앱 로고 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '8px', 
            background: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--bg-color)',
            fontWeight: '800',
            fontSize: '18px'
          }}>丕</div>
          <span style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'var(--font-display)', letterSpacing: '0.5px' }}>
            丕刀卜己卜人丨廿卜
          </span>
        </div>

        {/* 미니 프로필 위젯 */}
        <div style={{ 
          background: 'var(--card-bg)', 
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '32px' }}>{config.avatarEmoji}</span>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{config.username}</h4>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>수익 예산: {new Intl.NumberFormat('ko-KR').format(config.monthlyBudget)}원</span>
          </div>
        </div>

        {/* 탭 버튼 세트 */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {[
            { id: 'dashboard', label: '대시보드', icon: <LayoutDashboard size={18} /> },
            { id: 'transactions', label: '수익/비용/저축 기록', icon: <Receipt size={18} /> },
            { id: 'calendar', label: '캘린더 뷰', icon: <CalendarIcon size={18} /> },
            { id: 'analytics', label: '재정 분석 리포트', icon: <BarChart3 size={18} /> },
            { id: 'categories', label: '분류 카테고리 설정', icon: <FolderTree size={18} /> },
            { id: 'profile', label: '프로필 및 환경설정', icon: <User size={18} /> }
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'transactions') setTargetDateForNewTx(null);
                }}
                className="btn btn-ghost"
                style={{
                  justifyContent: 'flex-start',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: isSelected ? '700' : '500',
                  background: isSelected ? 'var(--primary-color)' : 'transparent',
                  color: isSelected ? 'var(--bg-color)' : 'var(--text-primary)',
                  border: 'none',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* 하단 다크모드 간편 전환 */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>화면 테마</span>
          <button 
            className="btn btn-ghost" 
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            style={{ padding: '8px', borderRadius: '50%' }}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} style={{ color: 'var(--color-savings)' }} />}
          </button>
        </div>

      </aside>

      {/* 우측 메인 콘텐츠 레이아웃 (Main Content View) */}
      <main style={{ 
        flex: 1, 
        padding: '36px',
        overflowY: 'auto',
        maxHeight: '100vh'
      }}>
        {activeTab === 'dashboard' && (
          <Dashboard 
            transactions={transactions} 
            config={config} 
            onUpdateConfig={setConfig}
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}
        
        {activeTab === 'transactions' && (
          <TransactionManager 
            transactions={transactions}
            categories={categories}
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            initialDate={targetDateForNewTx}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView 
            transactions={transactions} 
            onQuickAdd={handleQuickAddFromCalendar}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView 
            transactions={transactions} 
          />
        )}

        {activeTab === 'categories' && (
          <CategorySettings 
            categories={categories} 
            onUpdateCategories={setCategories}
          />
        )}

         {activeTab === 'profile' && (
          <ProfileSettings 
            config={config}
            onUpdateConfig={setConfig}
            transactions={transactions}
            onImportTransactions={handleImportTransactions}
            onResetTransactions={handleResetTransactions}
            onResetCategories={handleResetCategories}
            onResetConfig={handleResetConfig}
            theme={theme}
            onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
          />
        )}
      </main>

    </div>
  );
}

export default App;
