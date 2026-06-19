import React, { useState } from 'react';
import type { CategoryStructure } from '../types';
import { Plus, Trash2, ChevronRight, Settings2, X } from 'lucide-react';

interface CategorySettingsProps {
  categories: CategoryStructure;
  onUpdateCategories: (cats: CategoryStructure) => void;
}

export const CategorySettings: React.FC<CategorySettingsProps> = ({ categories, onUpdateCategories }) => {
  const [selectedType, setSelectedType] = useState<'수익' | '비용' | '저축'>('비용');
  
  // 새 중분류 추가용 상태
  const [newSubcat, setNewSubcat] = useState('');
  // 새 소분류 추가용 상태
  const [selectedSubcat, setSelectedSubcat] = useState<string | null>(null);
  const [newDetail, setNewDetail] = useState('');

  // 중분류 추가
  const handleAddSubcat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcat.trim()) return;
    
    // 이미 존재하는지 확인
    if (categories[selectedType][newSubcat.trim()]) {
      alert('이미 존재하는 중분류명입니다.');
      return;
    }

    const updated = { ...categories };
    updated[selectedType] = {
      ...updated[selectedType],
      [newSubcat.trim()]: []
    };

    onUpdateCategories(updated);
    setNewSubcat('');
  };

  // 중분류 삭제
  const handleRemoveSubcat = (subcat: string) => {
    if (!confirm(`'${subcat}' 분류와 하위 소분류를 모두 삭제하시겠습니까?`)) return;

    const updated = { ...categories };
    const typeGroup = { ...updated[selectedType] };
    delete typeGroup[subcat];
    updated[selectedType] = typeGroup;

    if (selectedSubcat === subcat) {
      setSelectedSubcat(null);
    }

    onUpdateCategories(updated);
  };

  // 소분류 추가
  const handleAddDetail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubcat || !newDetail.trim()) return;

    const currentDetails = categories[selectedType][selectedSubcat] || [];
    if (currentDetails.includes(newDetail.trim())) {
      alert('이미 존재하는 소분류명입니다.');
      return;
    }

    const updated = { ...categories };
    updated[selectedType][selectedSubcat] = [...currentDetails, newDetail.trim()];

    onUpdateCategories(updated);
    setNewDetail('');
  };

  // 소분류 삭제
  const handleRemoveDetail = (subcat: string, detail: string) => {
    const updated = { ...categories };
    updated[selectedType][subcat] = (updated[selectedType][subcat] || []).filter(d => d !== detail);

    onUpdateCategories(updated);
  };

  const subcategories = Object.keys(categories[selectedType] || {});

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 소개 헤더 */}
      <div className="premium-card glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ padding: '10px', background: 'var(--primary-light)', borderRadius: '12px' }}>
          <Settings2 size={24} style={{ color: 'var(--text-secondary)' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-display)' }}>⚙️ 1분 완결 카테고리 관리</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>한 번만 카테고리를 설정해 두면 입력 폼, 내역 테이블, 분석 차트까지 실시간 자동 반영됩니다.</p>
        </div>
      </div>

      {/* 구분별 탭 셀렉터 */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {(['비용', '수익', '저축'] as const).map(t => (
          <button
            key={t}
            onClick={() => {
              setSelectedType(t);
              setSelectedSubcat(null);
            }}
            className={`btn ${selectedType === t ? 'btn-primary' : 'btn-ghost'}`}
            style={{ 
              flex: 1, 
              padding: '12px', 
              fontSize: '15px',
              borderColor: selectedType === t ? 'var(--primary-color)' : 'var(--border-color)',
              background: selectedType === t 
                ? t === '수익' ? 'var(--color-income)' 
                : t === '비용' ? 'var(--color-expense)' 
                : 'var(--color-savings)'
                : 'var(--card-bg)',
              color: selectedType === t ? '#fff' : 'var(--text-primary)',
              boxShadow: selectedType === t ? '0 4px 15px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            {t} 카테고리
          </button>
        ))}
      </div>

      {/* 관리 영역 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="responsive-grid">
        
        {/* 1. 중분류 관리 */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '700' }}>📁 {selectedType} 중분류 목록</h4>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>선택하여 하위 소분류를 추가할 수 있습니다.</span>
          </div>

          {/* 추가 폼 */}
          <form onSubmit={handleAddSubcat} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="새 중분류 이름 입력 (예: 식비, 월세)"
              value={newSubcat}
              onChange={(e) => setNewSubcat(e.target.value)}
              style={{ flex: 1, fontSize: '13px' }}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px' }}>
              <Plus size={16} /> 추가
            </button>
          </form>

          {/* 목록 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '350px' }}>
            {subcategories.map(subcat => (
              <div 
                key={subcat}
                onClick={() => setSelectedSubcat(subcat)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  background: selectedSubcat === subcat ? 'var(--primary-light)' : 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                  <span>{subcat}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({(categories[selectedType][subcat] || []).length})</span>
                </div>
                
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button 
                    type="button" 
                    className="btn btn-ghost" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSubcat(subcat);
                    }}
                    style={{ padding: '4px', color: 'var(--color-expense)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            ))}

            {subcategories.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
                등록된 중분류가 없습니다. 새 중분류를 추가해 보세요.
              </div>
            )}
          </div>
        </div>

        {/* 2. 소분류 관리 */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedSubcat ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '700' }}>🏷️ [{selectedSubcat}] 하위 소분류</h4>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>입력 폼 소분류 자동 자동완성</span>
              </div>

              {/* 추가 폼 */}
              <form onSubmit={handleAddDetail} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="새 소분류 이름 입력 (예: 스타벅스, 쿠팡)"
                  value={newDetail}
                  onChange={(e) => setNewDetail(e.target.value)}
                  style={{ flex: 1, fontSize: '13px' }}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px' }}>
                  <Plus size={16} /> 추가
                </button>
              </form>

              {/* 목록 */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', overflowY: 'auto', maxHeight: '350px', alignContent: 'flex-start' }}>
                {(categories[selectedType][selectedSubcat] || []).map(detail => (
                  <span
                    key={detail}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: 'var(--primary-light)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  >
                    {detail}
                    <button
                      type="button"
                      onClick={() => handleRemoveDetail(selectedSubcat, detail)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center' }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}

                {(categories[selectedType][selectedSubcat] || []).length === 0 && (
                  <div style={{ width: '100%', textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    소분류가 비어 있습니다. 상세 항목을 등록해 보시길 권장합니다.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '40px' }}>
              <span>← 왼쪽 목록에서 중분류를 선택하시면<br />세부 소분류를 구성하실 수 있습니다.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
