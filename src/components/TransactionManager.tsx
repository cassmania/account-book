import React, { useState, useEffect } from 'react';
import type { Transaction, TransactionType, CategoryStructure } from '../types';
import { Plus, Search, Trash2, Edit3, X, Check } from 'lucide-react';

interface TransactionManagerProps {
  transactions: Transaction[];
  categories: CategoryStructure;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  initialDate?: string | null;
}

export const TransactionManager: React.FC<TransactionManagerProps> = ({
  transactions,
  categories,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  initialDate
}) => {
  // 입력 폼 상태
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));

  // initialDate가 변경될 때 date 갱신
  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
    }
  }, [initialDate]);
  const [type, setType] = useState<TransactionType>('비용');
  const [category, setCategory] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('');
  const [detail, setDetail] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [memo, setMemo] = useState<string>('');

  // 수정 모드 상태
  const [editingId, setEditingId] = useState<string | null>(null);

  // 테이블 검색/필터 상태
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('전체');
  const [filterCategory, setFilterCategory] = useState<string>('전체');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // 대분류가 변경될 때 중분류 목록 리셋 및 자동 첫번째 선택
  const categoryOptions = Object.keys(categories[type] || {});
  useEffect(() => {
    if (categoryOptions.length > 0) {
      setCategory(categoryOptions[0]);
    } else {
      setCategory('');
    }
  }, [type, categories]);

  // 중분류가 변경될 때 소분류(세부 카테고리) 목록 리셋
  const subcategoryOptions = category ? categories[type][category] || [] : [];
  useEffect(() => {
    if (subcategoryOptions.length > 0) {
      setSubcategory(subcategoryOptions[0]);
    } else {
      setSubcategory('');
    }
  }, [category, type, categories]);

  // 폼 제출 핸들러 (추가 및 수정 완료)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !subcategory || !amount) {
      alert('분류와 금액을 반드시 입력해 주세요.');
      return;
    }

    const txAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(txAmount) || txAmount <= 0) {
      alert('올바른 금액을 입력해 주세요.');
      return;
    }

    if (editingId) {
      // 수정 모드
      onUpdateTransaction({
        id: editingId,
        date,
        type,
        category,
        subcategory,
        detail: detail || subcategory, // 소분류 공백 시 중분류 값 대체
        amount: txAmount,
        memo
      });
      setEditingId(null);
    } else {
      // 추가 모드
      onAddTransaction({
        date,
        type,
        category,
        subcategory,
        detail: detail || subcategory,
        amount: txAmount,
        memo
      });
    }

    // 폼 초기화 (날짜 제외)
    setDetail('');
    setAmount('');
    setMemo('');
  };

  // 수정 버튼 클릭 시 폼에 로드
  const handleEditClick = (tx: Transaction) => {
    setEditingId(tx.id);
    setDate(tx.date);
    setType(tx.type);
    
    // 비동기적인 카테고리 옵션 갱신 대응을 위해 카테고리/중분류 상태 즉시 주입
    setCategory(tx.category);
    setSubcategory(tx.subcategory);
    setDetail(tx.detail);
    setAmount(tx.amount.toString());
    setMemo(tx.memo);

    // 스크롤 상단 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setEditingId(null);
    setDetail('');
    setAmount('');
    setMemo('');
    setDate(new Date().toISOString().substring(0, 10));
  };

  // 금액 쉼표 포맷팅
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    if (rawVal === '') {
      setAmount('');
      return;
    }
    const formatted = new Intl.NumberFormat('ko-KR').format(parseInt(rawVal, 10));
    setAmount(formatted);
  };

  // 필터 및 정렬 적용된 거래 내역 산출
  const filteredTransactions = transactions
    .filter(tx => {
      // 유형 필터
      if (filterType !== '전체' && tx.type !== filterType) return false;
      // 대분류 필터
      if (filterCategory !== '전체' && tx.category !== filterCategory) return false;
      // 키워드 검색 (대분류, 중분류, 소분류, 메모, 상세명 통합 검색)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          tx.category.toLowerCase().includes(query) ||
          tx.subcategory.toLowerCase().includes(query) ||
          tx.detail.toLowerCase().includes(query) ||
          tx.memo.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

  // 모든 카테고리 목록 통합 (필터 드롭다운용)
  const allCategories = Array.from(
    new Set([
      ...Object.keys(categories['수익']),
      ...Object.keys(categories['비용']),
      ...Object.keys(categories['저축'])
    ])
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. 내역 등록/수정 카드 */}
      <div className="premium-card glass-panel">
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {editingId ? '📝 내역 수정하기' : '✨ 가계부 간편 기록'}
          {editingId && (
            <span style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--color-expense)', color: '#fff', borderRadius: '12px' }}>
              수정 중
            </span>
          )}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'end' }}>
          
          {/* 날짜 */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">날짜</label>
            <input 
              type="date" 
              className="form-input" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              required
            />
          </div>

          {/* 대분류 유형 */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">구분</label>
            <select 
              className="form-select" 
              value={type} 
              onChange={(e) => setType(e.target.value as TransactionType)}
            >
              <option value="비용">비용 (지출)</option>
              <option value="수익">수익 (수입)</option>
              <option value="저축">저축 (자산)</option>
            </select>
          </div>

          {/* 대분류 */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">대분류</label>
            <select 
              className="form-select" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {categoryOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* 중분류 */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">중분류</label>
            <select 
              className="form-select" 
              value={subcategory} 
              onChange={(e) => setSubcategory(e.target.value)}
              required
            >
              {subcategoryOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* 소분류 (세부 내역) */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">소분류 (상세 내역)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="예: 스타벅스, 패스트푸드" 
              value={detail} 
              onChange={(e) => setDetail(e.target.value)}
            />
          </div>

          {/* 금액 */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">금액 (원)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="0"
              value={amount} 
              onChange={handleAmountChange}
              required
              style={{ fontWeight: '600', textAlign: 'right' }}
            />
          </div>

          {/* 메모 */}
          <div className="form-group col-span-full-mobile" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
            <label className="form-label">메모 (선택)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="추가적인 설명 입력..." 
              value={memo} 
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          {/* 버튼 영역 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {editingId && (
              <button 
                type="button" 
                className="btn btn-ghost" 
                onClick={handleCancelEdit}
                style={{ flex: 1, padding: '10px' }}
              >
                <X size={16} /> 취소
              </button>
            )}
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ flex: 2, padding: '10px', background: 'var(--primary-color)' }}
            >
              {editingId ? <Check size={16} /> : <Plus size={16} />} 
              {editingId ? '수정 완료' : '기록하기'}
            </button>
          </div>

        </form>
      </div>

      {/* 2. 내역 리스트 필터 및 테이블 */}
      <div className="premium-card">
        
        {/* 상단 컨트롤 바 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>거래 명세 목록</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              총 <strong style={{ color: 'var(--primary-color)' }}>{filteredTransactions.length}</strong> 건의 내역이 조회되었습니다.
            </p>
          </div>
          
          {/* 검색 바 */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="내역, 메모 검색..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px', width: '200px', fontSize: '13px' }}
              />
            </div>

            {/* 구분 필터 */}
            <select 
              className="form-select" 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              style={{ fontSize: '13px', padding: '8px 12px' }}
            >
              <option value="전체">모든 구분</option>
              <option value="수익">수익만</option>
              <option value="비용">비용만</option>
              <option value="저축">저축만</option>
            </select>

            {/* 대분류 필터 */}
            <select 
              className="form-select" 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ fontSize: '13px', padding: '8px 12px' }}
            >
              <option value="전체">모든 대분류</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* 정렬 방식 */}
            <select 
              className="form-select" 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{ fontSize: '13px', padding: '8px 12px' }}
            >
              <option value="date-desc">최신순</option>
              <option value="date-asc">과거순</option>
              <option value="amount-desc">높은 금액순</option>
              <option value="amount-asc">낮은 금액순</option>
            </select>
          </div>
        </div>

        {/* 테이블 */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>
                <th style={{ padding: '12px' }}>날짜</th>
                <th style={{ padding: '12px' }}>구분</th>
                <th style={{ padding: '12px' }}>대분류 &gt; 중분류</th>
                <th style={{ padding: '12px' }}>소분류(내역)</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>금액</th>
                <th style={{ padding: '12px' }}>메모</th>
                <th style={{ padding: '12px', textAlign: 'center', width: '100px' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} style={{ 
                  borderBottom: '1px solid var(--border-color)', 
                  fontSize: '14px', 
                  transition: 'background-color 0.2s',
                  backgroundColor: editingId === tx.id ? 'rgba(74,69,63,0.03)' : 'transparent'
                }}>
                  <td style={{ padding: '14px 12px', color: 'var(--text-secondary)' }}>{tx.date}</td>
                  <td style={{ padding: '14px 12px' }}>
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
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{tx.category}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginLeft: '6px' }}>&gt; {tx.subcategory}</span>
                  </td>
                  <td style={{ padding: '14px 12px', fontWeight: '500' }}>{tx.detail}</td>
                  <td style={{ 
                    padding: '14px 12px', 
                    textAlign: 'right', 
                    fontWeight: '600',
                    color: 
                      tx.type === '수익' ? 'var(--color-income)' : 
                      tx.type === '비용' ? 'var(--color-expense)' : 'var(--color-savings)'
                  }}>
                    {tx.type === '비용' ? '-' : ''}{formatCurrency(tx.amount)}
                  </td>
                  <td style={{ padding: '14px 12px', color: 'var(--text-secondary)', fontSize: '13px' }}>{tx.memo || '-'}</td>
                  
                  {/* 수정 / 삭제 관리 버튼 */}
                  <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        className="btn btn-ghost" 
                        onClick={() => handleEditClick(tx)} 
                        style={{ padding: '6px', borderRadius: '6px' }}
                        title="수정"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        className="btn btn-ghost" 
                        onClick={() => {
                          if(confirm('이 기록을 삭제하시겠습니까?')) {
                            onDeleteTransaction(tx.id);
                          }
                        }}
                        style={{ padding: '6px', borderRadius: '6px', color: 'var(--color-expense)' }}
                        title="삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    조회된 입출금 기록 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
