import React, { useState } from 'react';
import type { Transaction, BudgetConfig } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Percent,
  Edit2,
  Check,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid
} from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  config: BudgetConfig;
  onUpdateConfig: (config: BudgetConfig) => void;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  transactions, 
  config,
  onUpdateConfig,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction
}) => {
  const currentMonthStr = '2026-06';
  
  // 상태 관리 (인라인 수정 모드 및 에디터 값)
  const [editingField, setEditingField] = useState<'baseAsset' | 'monthlyBudget' | 'targetSavings' | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // 내역 관리 모달 상태
  const [modalType, setModalType] = useState<'수익' | '비용' | '저축' | null>(null);
  const [newModalTxAmount, setNewModalTxAmount] = useState('');
  const [newModalTxDetail, setNewModalTxDetail] = useState('');
  const [newModalTxCategory, setNewModalTxCategory] = useState('');
  const [newModalTxSubcategory, setNewModalTxSubcategory] = useState('');

  // 1. 누적 저축액 계산
  const baseAsset = config.baseAsset ?? 15000000;
  const totalSavedFromTx = transactions
    .filter(t => t.type === '저축')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSavings = baseAsset + totalSavedFromTx;

  // 2. 당월 통계
  const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonthStr));
  
  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === '수익')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = currentMonthTransactions
    .filter(t => t.type === '비용')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlySavings = currentMonthTransactions
    .filter(t => t.type === '저축')
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsRate = monthlyIncome > 0 
    ? Math.round((monthlySavings / monthlyIncome) * 100) 
    : 0;

  const budgetUsageRate = config.monthlyBudget > 0
    ? Math.round((monthlyExpense / config.monthlyBudget) * 100)
    : 0;

  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const months = Array.from(new Set(transactions.map(t => t.date.substring(0, 7)))).sort();
  const chartData = months.map(m => {
    const monthTxs = transactions.filter(t => t.date.startsWith(m));
    const income = monthTxs.filter(t => t.type === '수익').reduce((s, t) => s + t.amount, 0);
    const expense = monthTxs.filter(t => t.type === '비용').reduce((s, t) => s + t.amount, 0);
    const savings = monthTxs.filter(t => t.type === '저축').reduce((s, t) => s + t.amount, 0);
    return {
      name: `${m.split('-')[1]}월`,
      수익: income,
      비용: expense,
      저축: savings
    };
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);
  };

  // 인라인 편집 활성화
  const startEditing = (field: 'baseAsset' | 'monthlyBudget' | 'targetSavings', val: number) => {
    setEditingField(field);
    setEditValue(new Intl.NumberFormat('ko-KR').format(val));
  };

  // 인라인 편집 저장
  const saveEdit = () => {
    const numericVal = parseFloat(editValue.replace(/,/g, ''));
    if (isNaN(numericVal) || numericVal < 0) {
      alert('올바른 숫자를 입력해 주세요.');
      return;
    }

    const updatedConfig = { ...config };
    if (editingField === 'baseAsset') updatedConfig.baseAsset = numericVal;
    if (editingField === 'monthlyBudget') updatedConfig.monthlyBudget = numericVal;
    if (editingField === 'targetSavings') updatedConfig.targetSavings = numericVal;

    onUpdateConfig(updatedConfig);
    setEditingField(null);
  };

  const handleEditValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    if (rawVal === '') {
      setEditValue('');
      return;
    }
    const formatted = new Intl.NumberFormat('ko-KR').format(parseInt(rawVal, 10));
    setEditValue(formatted);
  };

  // 모달 제어
  const openModal = (type: '수익' | '비용' | '저축') => {
    setModalType(type);
    setNewModalTxAmount('');
    setNewModalTxDetail('');
    
    // 모달 기본 카테고리값 매핑
    if (type === '수익') {
      setNewModalTxCategory('근로소득');
      setNewModalTxSubcategory('급여');
    } else if (type === '비용') {
      setNewModalTxCategory('식비');
      setNewModalTxSubcategory('식자재');
    } else {
      setNewModalTxCategory('예적금');
      setNewModalTxSubcategory('자유적금');
    }
  };

  // 모달을 통한 빠른 추가 등록
  const handleModalAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModalTxAmount || !newModalTxDetail) return;
    const numericVal = parseFloat(newModalTxAmount.replace(/,/g, ''));
    if (isNaN(numericVal) || numericVal <= 0) return;

    onAddTransaction({
      date: '2026-06-19', // 오늘 기준 샘플
      type: modalType!,
      category: newModalTxCategory,
      subcategory: newModalTxSubcategory,
      detail: newModalTxDetail,
      amount: numericVal,
      memo: '대시보드 퀵 등록'
    });

    setNewModalTxAmount('');
    setNewModalTxDetail('');
  };

  // 모달 내역 금액 변경
  const handleModalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    if (rawVal === '') {
      setNewModalTxAmount('');
      return;
    }
    const formatted = new Intl.NumberFormat('ko-KR').format(parseInt(rawVal, 10));
    setNewModalTxAmount(formatted);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 프로필 및 예산 목표 에디터 헤더 */}
      <div className="premium-card glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '40px' }}>{config.avatarEmoji}</span>
          <div>
            <h2 style={{ fontSize: '20px', color: 'var(--text-primary)' }}>반갑습니다, {config.username}님!</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>숫자 금액 옆의 수정(아이콘) 버튼을 누르면 대시보드에서 직접 수정할 수 있습니다.</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* 평균 수익 예산 */}
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              평균 수익/예산
            </span>
            {editingField === 'monthlyBudget' ? (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editValue} 
                  onChange={handleEditValueChange} 
                  style={{ width: '120px', height: '32px', textAlign: 'right', fontSize: '14px', padding: '4px 8px' }}
                />
                <button className="btn btn-primary" onClick={saveEdit} style={{ padding: '4px 8px', height: '32px' }}><Check size={14} /></button>
                <button className="btn btn-ghost" onClick={() => setEditingField(null)} style={{ padding: '4px 8px', height: '32px' }}><X size={14} /></button>
              </div>
            ) : (
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                {formatCurrency(config.monthlyBudget)}
                <button className="btn btn-ghost" onClick={() => startEditing('monthlyBudget', config.monthlyBudget)} style={{ padding: '4px', border: 'none', background: 'transparent' }}>
                  <Edit2 size={13} style={{ color: 'var(--text-muted)' }} />
                </button>
              </h3>
            )}
          </div>

          {/* 목표 저축액 */}
          <div style={{ textAlign: 'right', borderLeft: '1px solid var(--border-color)', paddingLeft: '24px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              목표 저축액
            </span>
            {editingField === 'targetSavings' ? (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editValue} 
                  onChange={handleEditValueChange} 
                  style={{ width: '120px', height: '32px', textAlign: 'right', fontSize: '14px', padding: '4px 8px' }}
                />
                <button className="btn btn-primary" onClick={saveEdit} style={{ padding: '4px 8px', height: '32px' }}><Check size={14} /></button>
                <button className="btn btn-ghost" onClick={() => setEditingField(null)} style={{ padding: '4px 8px', height: '32px' }}><X size={14} /></button>
              </div>
            ) : (
              <h3 style={{ fontSize: '18px', color: 'var(--color-savings)', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                {formatCurrency(config.targetSavings)}
                <button className="btn btn-ghost" onClick={() => startEditing('targetSavings', config.targetSavings)} style={{ padding: '4px', border: 'none', background: 'transparent' }}>
                  <Edit2 size={13} style={{ color: 'var(--text-muted)' }} />
                </button>
              </h3>
            )}
          </div>
        </div>
      </div>

      {/* 요약 카드 그리드 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '20px' 
      }}>
        
        {/* 누적 저축액 카드 (기본 자산 수정 가능) */}
        <div className="premium-card" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>누적 저축액</span>
            <div style={{ padding: '6px', background: 'rgba(204,156,67,0.1)', color: 'var(--color-savings)', borderRadius: '8px' }}>
              <PiggyBank size={18} />
            </div>
          </div>
          
          {editingField === 'baseAsset' ? (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', margin: '6px 0' }}>
              <input 
                type="text" 
                className="form-input" 
                value={editValue} 
                onChange={handleEditValueChange} 
                style={{ width: '100%', textAlign: 'right', fontWeight: '600', fontSize: '16px' }}
              />
              <button className="btn btn-primary" onClick={saveEdit} style={{ padding: '8px' }}><Check size={14} /></button>
              <button className="btn btn-ghost" onClick={() => setEditingField(null)} style={{ padding: '8px' }}><X size={14} /></button>
            </div>
          ) : (
            <h2 style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--font-display)', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {formatCurrency(totalSavings)}
              <button className="btn btn-ghost" onClick={() => startEditing('baseAsset', baseAsset)} style={{ padding: '4px', border: 'none', background: 'transparent' }}>
                <Edit2 size={14} style={{ color: 'var(--text-muted)' }} />
              </button>
            </h2>
          )}
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            기본자산({formatCurrency(baseAsset)}) + 저축내역 합계
          </span>
        </div>

        {/* 이번달 수익 카드 */}
        <div className="premium-card" style={{ cursor: 'pointer' }} onClick={() => openModal('수익')} title="클릭하여 이번달 수익 내역 수정">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>이번달 수익</span>
            <div style={{ padding: '6px', background: 'rgba(80,158,137,0.1)', color: 'var(--color-income)', borderRadius: '8px' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--color-income)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {formatCurrency(monthlyIncome)}
            <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px' }}>내역 관리</span>
          </h2>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>6월 총 수입 합계</span>
        </div>

        {/* 이번달 지출 카드 */}
        <div className="premium-card" style={{ cursor: 'pointer' }} onClick={() => openModal('비용')} title="클릭하여 이번달 지출 내역 수정">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>이번달 지출</span>
            <div style={{ padding: '6px', background: 'rgba(214,113,96,0.1)', color: 'var(--color-expense)', borderRadius: '8px' }}>
              <TrendingDown size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--color-expense)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {formatCurrency(monthlyExpense)}
            <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px' }}>내역 관리</span>
          </h2>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>6월 총 지출 합계</span>
        </div>

        {/* 당월 저축률 카드 (저축내역 수정) */}
        <div className="premium-card" style={{ cursor: 'pointer' }} onClick={() => openModal('저축')} title="클릭하여 저축 내역 수정">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>이번달 저축</span>
            <div style={{ padding: '6px', background: 'rgba(91,141,184,0.1)', color: 'var(--accent-blue)', borderRadius: '8px' }}>
              <Percent size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--accent-blue)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {formatCurrency(monthlySavings)}
            <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px' }}>내역 관리</span>
          </h2>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>저축률: {savingsRate}%</span>
        </div>

      </div>

      {/* 분석 및 차트 영역 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '24px',
        alignItems: 'stretch'
      }} className="responsive-grid">
        
        {/* 차트 */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>연간 재정 추이 비교</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>최근 월별 수익, 비용, 저축 추이를 보여줍니다.</p>
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickFormatter={(tick) => `${tick / 10000}만`} />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value)), '']}
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                <Bar dataKey="수익" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="비용" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="저축" fill="var(--color-savings)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 진행 바 위젯 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="premium-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>예산 사용 현황 (소비)</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '8px 0' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800' }}>{budgetUsageRate}%</h2>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {formatCurrency(monthlyExpense)} / {formatCurrency(config.monthlyBudget)}
              </span>
            </div>
            <div style={{ width: '100%', height: '10px', background: 'var(--primary-light)', borderRadius: '5px', overflow: 'hidden', margin: '8px 0' }}>
              <div style={{ 
                width: `${Math.min(budgetUsageRate, 100)}%`, 
                height: '100%', 
                background: budgetUsageRate > 90 ? 'var(--color-expense)' : 'var(--color-income)',
                borderRadius: '5px',
                transition: 'width 0.5s ease-in-out'
              }} />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {budgetUsageRate > 100 
                ? '⚠️ 설정된 월 수익 예산을 초과하여 소비했습니다!' 
                : '✅ 아직 월 예산 범위 내에서 안정적으로 지출 중입니다.'}
            </p>
          </div>

          <div className="premium-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>목표 저축액 달성률</span>
            {(() => {
              const savingsGoalRate = config.targetSavings > 0
                ? Math.round((monthlySavings / config.targetSavings) * 100)
                : 0;
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '8px 0' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-savings)' }}>{savingsGoalRate}%</h2>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {formatCurrency(monthlySavings)} / {formatCurrency(config.targetSavings)}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: 'var(--primary-light)', borderRadius: '5px', overflow: 'hidden', margin: '8px 0' }}>
                    <div style={{ 
                      width: `${Math.min(savingsGoalRate, 100)}%`, 
                      height: '100%', 
                      background: 'var(--color-savings)',
                      borderRadius: '5px',
                      transition: 'width 0.5s ease-in-out'
                    }} />
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {savingsGoalRate >= 100 
                      ? '🎉 이번 달 저축 목표 금액을 조기 달성했습니다!' 
                      : `💪 목표 달성까지 ${formatCurrency(Math.max(config.targetSavings - monthlySavings, 0))} 남았습니다.`}
                  </p>
                </>
              );
            })()}
          </div>
        </div>

      </div>

      {/* 최근 거래 리스트 */}
      <div className="premium-card">
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>최근 기록 내역</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                <th style={{ padding: '12px 8px' }}>날짜</th>
                <th style={{ padding: '12px 8px' }}>구분</th>
                <th style={{ padding: '12px 8px' }}>분류</th>
                <th style={{ padding: '12px 8px' }}>내역</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>금액</th>
                <th style={{ padding: '12px 8px' }}>메모</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}>
                  <td style={{ padding: '14px 8px', color: 'var(--text-secondary)' }}>{tx.date}</td>
                  <td style={{ padding: '14px 8px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '11px', 
                      fontWeight: '700',
                      background: 
                        tx.type === '수익' ? 'rgba(80,158,137,0.12)' : 
                        tx.type === '비용' ? 'rgba(214,113,96,0.12)' : 'rgba(204,156,67,0.12)',
                      color: 
                        tx.type === '수익' ? 'var(--color-income)' : 
                        tx.type === '비용' ? 'var(--color-expense)' : 'var(--color-savings)'
                    }}>
                      {tx.type}
                    </span>
                  </td>
                  <td style={{ padding: '14px 8px' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{tx.category}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginLeft: '6px' }}>&gt; {tx.subcategory}</span>
                  </td>
                  <td style={{ padding: '14px 8px', fontWeight: '500' }}>{tx.detail}</td>
                  <td style={{ 
                    padding: '14px 8px', 
                    textAlign: 'right', 
                    fontWeight: '600',
                    color: 
                      tx.type === '수익' ? 'var(--color-income)' : 
                      tx.type === '비용' ? 'var(--color-expense)' : 'var(--color-savings)'
                  }}>
                    {tx.type === '비용' ? '-' : ''}{formatCurrency(tx.amount)}
                  </td>
                  <td style={{ padding: '14px 8px', color: 'var(--text-secondary)', fontSize: '13px' }}>{tx.memo || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 내역 수정 모달 (Overlay Modal) */}
      {modalType && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="premium-card fade-in" style={{
            width: '100%',
            maxWidth: '600px',
            maxHeight: '85vh',
            overflowY: 'auto',
            background: 'var(--card-bg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* 모달 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>
                ✍️ 6월 {modalType} 내역 직접 편집/수정
              </h3>
              <button className="btn btn-ghost" onClick={() => setModalType(null)} style={{ padding: '6px', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            {/* 빠른 조정 내역 등록 폼 */}
            <form onSubmit={handleModalAddTx} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '14px',
              background: 'var(--primary-light)',
              borderRadius: '12px'
            }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>💡 빠른 조정 거래 추가</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">금액 (원)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="0" 
                    value={newModalTxAmount}
                    onChange={handleModalAmountChange}
                    style={{ fontSize: '13px' }}
                    required 
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">세부 거래명</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="예: 조정 내역" 
                    value={newModalTxDetail}
                    onChange={(e) => setNewModalTxDetail(e.target.value)}
                    style={{ fontSize: '13px' }}
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }}>
                  <Plus size={16} /> 추가
                </button>
              </div>
            </form>

            {/* 거래 목록 및 각각 금액 수정 기능 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>당월 {modalType} 내역 전체 리스트</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
                {currentMonthTransactions.filter(t => t.type === modalType).map(tx => (
                  <div key={tx.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{tx.detail}</div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tx.date} | {tx.category}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {/* 개별 거래 금액 실시간 편집 */}
                      <input 
                        type="number" 
                        className="form-input" 
                        value={tx.amount}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          onUpdateTransaction({ ...tx, amount: val });
                        }}
                        style={{ width: '100px', padding: '4px 8px', fontSize: '12px', textAlign: 'right' }}
                      />
                      <span style={{ fontSize: '12px' }}>원</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          if (confirm('삭제하시겠습니까?')) onDeleteTransaction(tx.id);
                        }}
                        style={{ border: 'none', background: 'transparent', color: 'var(--color-expense)', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {currentMonthTransactions.filter(t => t.type === modalType).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    등록된 {modalType} 내역이 없습니다.
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
              <button className="btn btn-primary" onClick={() => setModalType(null)}>확인 완료</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
