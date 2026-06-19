import React, { useState } from 'react';
import type { Transaction } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Lightbulb } from 'lucide-react';

interface AnalyticsViewProps {
  transactions: Transaction[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ transactions }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-06');

  // 등록된 월 목록 추출
  const availableMonths = Array.from(new Set(transactions.map(t => t.date.substring(0, 7)))).sort().reverse();

  // 선택된 월의 내역 필터링
  const monthlyTxs = transactions.filter(t => t.date.startsWith(selectedMonth));
  const previousMonthStr = (() => {
    const parts = selectedMonth.split('-');
    const y = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    const prevM = m === 1 ? 12 : m - 1;
    const prevY = m === 1 ? y - 1 : y;
    return `${prevY}-${String(prevM).padStart(2, '0')}`;
  })();

  const prevMonthlyTxs = transactions.filter(t => t.date.startsWith(previousMonthStr));

  // 수입, 지출, 저축 요약액
  const incomeTotal = monthlyTxs.filter(t => t.type === '수익').reduce((s, t) => s + t.amount, 0);
  const expenseTotal = monthlyTxs.filter(t => t.type === '비용').reduce((s, t) => s + t.amount, 0);
  const savingsTotal = monthlyTxs.filter(t => t.type === '저축').reduce((s, t) => s + t.amount, 0);

  const prevExpenseTotal = prevMonthlyTxs.filter(t => t.type === '비용').reduce((s, t) => s + t.amount, 0);

  // 대분류 카테고리별 지출 통계
  const expenseByCategory: { [cat: string]: number } = {};
  monthlyTxs.filter(t => t.type === '비용').forEach(t => {
    expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
  });

  // Recharts 도넛 차트용 데이터 가공
  const chartData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

  // 파스텔 디자인 테마용 8가지 컬러 색상 코드
  const COLORS = ['#d67160', '#cc9c43', '#5b8db8', '#509e89', '#9b8db8', '#a8a29a', '#cfa375', '#a8c686'];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);
  };

  // 분석 리포트 생성
  const generateReport = () => {
    if (monthlyTxs.length === 0) {
      return {
        summary: '선택한 월의 데이터가 부족하여 분석할 수 없습니다. 내역을 입력해 주세요.',
        tips: []
      };
    }

    const tips: string[] = [];
    let summaryText = '';

    // 1. 최고 지출 카테고리
    if (chartData.length > 0) {
      const topExpense = chartData[0];
      const percent = Math.round((topExpense.value / (expenseTotal || 1)) * 100);
      summaryText = `이번 달 가장 많은 소비 항목은 **${topExpense.name}**이며, 전체 지출의 **${percent}%**(${formatCurrency(topExpense.value)})를 차지했습니다. `;
      
      if (topExpense.name === '식비') {
        tips.push('식비가 높은 편입니다. 외식보다 집밥 밀키트를 이용해 식비를 최대 15% 절약해 보세요.');
      } else if (topExpense.name === '생활쇼핑') {
        tips.push('쇼핑 지출이 감지되었습니다. 구매 전 "장바구니 24시간 두기" 규칙을 활용하여 충동구매를 예방해 보세요.');
      } else if (topExpense.name === '문화여가') {
        tips.push('여가/여가 활동도 좋지만 가끔은 무료 문화시설이나 도서관을 이용해 보시는 것을 제안합니다.');
      }
    }

    // 2. 전달 비교
    if (prevMonthlyTxs.length > 0) {
      const diff = expenseTotal - prevExpenseTotal;
      if (diff > 0) {
        summaryText += `지난달(${previousMonthStr}) 대비 지출액이 **${formatCurrency(diff)} 더 많이 지출**되었습니다.`;
        tips.push('최근 지출이 급증했습니다. 비고정 소비 내역 중 줄일 수 있는 대항목(예: 배달음식, 택시비)이 있는지 검토가 요구됩니다.');
      } else if (diff < 0) {
        summaryText += `지난달(${previousMonthStr}) 대비 지출을 **${formatCurrency(Math.abs(diff))} 아꼈습니다**. 훌륭한 성과입니다! 🎉`;
        tips.push('지출 통제력이 매우 우수합니다. 아낀 비용은 고정 저축이나 배당주 매수로 이관해 보세요.');
      } else {
        summaryText += `지난달과 동일한 수준의 소비 지출 흐름을 유지하고 있습니다.`;
      }
    }

    // 3. 저축 성향 분석
    const savingsRate = incomeTotal > 0 ? (savingsTotal / incomeTotal) * 100 : 0;
    if (savingsRate >= 40) {
      tips.push('황금 저축률 달성! 현재 수입의 40% 이상을 안정적으로 저축하고 있습니다. 건강한 재정 구조입니다.');
    } else if (savingsRate < 20 && incomeTotal > 0) {
      tips.push('저축률이 수입의 20% 미만으로 비교적 저조합니다. 자동이체를 활용한 선저축 후지출 방식을 강구해 보십시오.');
    }

    return {
      summary: summaryText,
      tips
    };
  };

  const report = generateReport();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 월 선택 필터 및 총괄 요약 카드 */}
      <div className="premium-card glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-display)' }}>📊 카테고리 소비 정밀 분석</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>선택한 달의 수입 대비 지출 및 카테고리별 비중을 분석합니다.</p>
        </div>
        <select 
          className="form-select" 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{ width: '150px' }}
        >
          {availableMonths.map(m => (
            <option key={m} value={m}>{m.split('-')[0]}년 {m.split('-')[1]}월</option>
          ))}
        </select>
      </div>

      {/* 분석 차트 및 통계 세부 영역 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }} className="responsive-grid">
        
        {/* 지출 비중 도넛 차트 */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '340px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '700', alignSelf: 'flex-start', marginBottom: '20px' }}>지출 항목별 점유율</h4>
          
          {chartData.length > 0 ? (
            <div style={{ width: '100%', height: '240px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), ' 지출']} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '40px' }}>
              이번 달에 등록된 지출(비용) 내역이 없습니다.
            </div>
          )}
        </div>

        {/* 지출 항목 비율 상세 리스트 */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '700' }}>카테고리별 지출 금액 리스트</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', maxHeight: '300px' }}>
            {chartData.map((item, idx) => {
              const pct = Math.round((item.value / (expenseTotal || 1)) * 100);
              const color = COLORS[idx % COLORS.length];
              return (
                <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', background: color, borderRadius: '50%' }} />
                      <span>{item.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({pct}%)</span>
                    </div>
                    <span>{formatCurrency(item.value)}</span>
                  </div>
                  {/* 진행도 게이지 */}
                  <div style={{ width: '100%', height: '6px', background: 'var(--primary-light)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}

            {chartData.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '40px' }}>
                지출 통계 내역이 존재하지 않습니다.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 스마트 소비 진단 리포트 (Wednesday AI) */}
      <div className="premium-card" style={{ borderLeft: '5px solid var(--primary-color)' }}>
        <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lightbulb size={18} style={{ color: 'var(--color-savings)' }} />
          스마트 재정 분석 리포트 ({selectedMonth.split('-')[1]}월 기준)
        </h4>
        
        <p 
          style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '16px' }}
          dangerouslySetInnerHTML={{ __html: report.summary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
        />

        {report.tips.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>💡 맞춤형 저축 팁(Savings Tip):</span>
            {report.tips.map((tip, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: 'var(--primary-light)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-income)', fontWeight: 'bold' }}>✓</span>
                <span style={{ color: 'var(--text-secondary)' }}>{tip}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
