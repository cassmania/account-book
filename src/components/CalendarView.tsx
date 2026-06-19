import React, { useState } from 'react';
import type { Transaction } from '../types';
import { ChevronLeft, ChevronRight, X, Info } from 'lucide-react';

interface CalendarViewProps {
  transactions: Transaction[];
  onQuickAdd?: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ transactions, onQuickAdd }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 1)); // 기본 2026년 6월
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 이전달/다음달 이동
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // 달력 격자 생성에 필요한 기본 데이터 계산
  const firstDayIndex = new Date(year, month, 1).getDay(); // 해당 월 1일의 요일 인덱스 (0: 일요일, 6: 토요일)
  const totalDays = new Date(year, month + 1, 0).getDate(); // 해당 월의 총 일수
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  // 달력 캘린더 그리드 배열 생성
  const days: { day: number; currentMonth: boolean; dateStr: string }[] = [];

  // 이전 달 날짜들 채우기
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = prevMonthTotalDays - i;
    const prevMonthStr = month === 0 ? '12' : String(month).padStart(2, '0');
    const prevYearStr = month === 0 ? String(year - 1) : String(year);
    days.push({
      day,
      currentMonth: false,
      dateStr: `${prevYearStr}-${prevMonthStr}-${String(day).padStart(2, '0')}`
    });
  }

  // 이번 달 날짜들 채우기
  for (let i = 1; i <= totalDays; i++) {
    const monthStr = String(month + 1).padStart(2, '0');
    days.push({
      day: i,
      currentMonth: true,
      dateStr: `${year}-${monthStr}-${String(i).padStart(2, '0')}`
    });
  }

  // 다음 달 날짜들로 빈칸(42칸 기준) 채우기
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthStr = month === 11 ? '01' : String(month + 2).padStart(2, '0');
    const nextYearStr = month === 11 ? String(year + 1) : String(year);
    days.push({
      day: i,
      currentMonth: false,
      dateStr: `${nextYearStr}-${nextMonthStr}-${String(i).padStart(2, '0')}`
    });
  }

  // 특정 일자의 거래 요약 계산
  const getDaySummary = (dateStr: string) => {
    const dayTxs = transactions.filter(t => t.date === dateStr);
    const income = dayTxs.filter(t => t.type === '수익').reduce((sum, t) => sum + t.amount, 0);
    const expense = dayTxs.filter(t => t.type === '비용').reduce((sum, t) => sum + t.amount, 0);
    const savings = dayTxs.filter(t => t.type === '저축').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, savings, hasTxs: dayTxs.length > 0 };
  };

  const formatShortCurrency = (val: number) => {
    if (val === 0) return '';
    if (val >= 10000) {
      return `${Math.round(val / 10000)}만`;
    }
    return `${Math.round(val / 1000)}천`;
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  const selectedDateTxs = selectedDate 
    ? transactions.filter(t => t.date === selectedDate) 
    : [];

  return (
    <div className="fade-in responsive-grid" style={{ display: 'grid', gridTemplateColumns: selectedDate ? '2fr 1fr' : '1fr', gap: '24px', alignItems: 'start' }}>
      
      {/* 캘린더 메인 바디 */}
      <div className="premium-card">
        
        {/* 달력 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {year}년 {month + 1}월
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>매일매일의 수입과 지출 현황을 확인합니다.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-ghost" onClick={handlePrevMonth} style={{ padding: '8px' }}>
              <ChevronLeft size={18} />
            </button>
            <button className="btn btn-ghost" onClick={() => setCurrentDate(new Date())} style={{ fontSize: '12px', padding: '8px 12px' }}>
              오늘
            </button>
            <button className="btn btn-ghost" onClick={handleNextMonth} style={{ padding: '8px' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* 요일 행 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          textAlign: 'center', 
          fontWeight: '700', 
          fontSize: '13px', 
          color: 'var(--text-secondary)',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '10px',
          marginBottom: '8px'
        }}>
          <div style={{ color: 'var(--color-expense)' }}>일</div>
          <div>월</div>
          <div>화</div>
          <div>수</div>
          <div>목</div>
          <div>금</div>
          <div style={{ color: 'var(--accent-blue)' }}>토</div>
        </div>

        {/* 날짜 그리드 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gridAutoRows: 'minmax(90px, auto)',
          gap: '4px' 
        }}>
          {days.map((cell, idx) => {
            const summary = getDaySummary(cell.dateStr);
            const isSelected = selectedDate === cell.dateStr;
            const isToday = cell.dateStr === new Date().toISOString().substring(0, 10);
            
            // 요일 체크
            const dayOfWeek = idx % 7;
            let dateColor = 'var(--text-primary)';
            if (!cell.currentMonth) {
              dateColor = 'var(--text-muted)';
            } else if (dayOfWeek === 0) {
              dateColor = 'var(--color-expense)';
            } else if (dayOfWeek === 6) {
              dateColor = 'var(--accent-blue)';
            }

            return (
              <div 
                key={cell.dateStr + idx}
                onClick={() => handleDateClick(cell.dateStr)}
                style={{
                  background: isSelected 
                    ? 'var(--primary-light)' 
                    : cell.currentMonth 
                      ? 'var(--card-bg)' 
                      : 'rgba(236, 234, 228, 0.25)',
                  border: isToday 
                    ? '1.5px solid var(--primary-color)' 
                    : '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s',
                  transform: isSelected ? 'scale(0.98)' : 'none'
                }}
                className="calendar-cell"
              >
                {/* 일자 */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <span style={{ 
                    fontSize: '13px', 
                    fontWeight: isToday ? '700' : '500', 
                    background: isToday ? 'var(--primary-color)' : 'transparent',
                    color: isToday ? 'var(--bg-color)' : dateColor,
                    padding: isToday ? '2px 6px' : '0',
                    borderRadius: '4px'
                  }}>
                    {cell.day}
                  </span>
                  {summary.hasTxs && (
                    <span style={{ width: '4px', height: '4px', background: 'var(--text-muted)', borderRadius: '50%' }} />
                  )}
                </div>

                {/* 요약 금액 표시 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end', marginTop: '8px' }}>
                  {summary.income > 0 && (
                    <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--color-income)' }}>
                      +{formatShortCurrency(summary.income)}
                    </span>
                  )}
                  {summary.expense > 0 && (
                    <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--color-expense)' }}>
                      -{formatShortCurrency(summary.expense)}
                    </span>
                  )}
                  {summary.savings > 0 && (
                    <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--color-savings)' }}>
                      S:{formatShortCurrency(summary.savings)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 우측 사이드 상세 패널 */}
      {selectedDate && (
        <div className="premium-card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '700' }}>📅 {selectedDate} 상세</h4>
            <button className="btn btn-ghost" onClick={() => setSelectedDate(null)} style={{ padding: '4px', borderRadius: '50%' }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '350px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {selectedDateTxs.map(tx => (
              <div key={tx.id} style={{ 
                padding: '10px 12px', 
                background: 'var(--primary-light)', 
                borderRadius: '8px',
                borderLeft: `4px solid ${
                  tx.type === '수익' ? 'var(--color-income)' : 
                  tx.type === '비용' ? 'var(--color-expense)' : 'var(--color-savings)'
                }`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>{tx.subcategory}</span>
                  <span style={{ 
                    fontSize: '13px', 
                    fontWeight: '700',
                    color: 
                      tx.type === '수익' ? 'var(--color-income)' : 
                      tx.type === '비용' ? 'var(--color-expense)' : 'var(--color-savings)'
                  }}>
                    {tx.type === '비용' ? '-' : ''}{new Intl.NumberFormat('ko-KR').format(tx.amount)}원
                  </span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>{tx.detail}</div>
                {tx.memo && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{tx.memo}</div>}
              </div>
            ))}

            {selectedDateTxs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Info size={24} strokeWidth={1.5} />
                <span style={{ fontSize: '13px' }}>기록된 내역이 없습니다.</span>
              </div>
            )}
          </div>

          {onQuickAdd && (
            <button 
              className="btn btn-primary" 
              onClick={() => onQuickAdd(selectedDate)}
              style={{ width: '100%', padding: '10px' }}
            >
              이 날짜로 내역 기록하기
            </button>
          )}
        </div>
      )}

    </div>
  );
};
