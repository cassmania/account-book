// 가계부 애플리케이션 공통 타입 정의 (Type Definitions)

export type TransactionType = '수익' | '비용' | '저축';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: string;      // 대분류 (예: 식비, 근로소득)
  subcategory: string;   // 중분류 (예: 외식비, 월급)
  detail: string;        // 소분류 (예: 패스트푸드, 주식회사)
  amount: number;        // 금액 (원)
  memo: string;          // 메모
}

export interface CategoryStructure {
  [type: string]: {
    [category: string]: string[];
  };
}

export interface BudgetConfig {
  username: string;
  monthlyBudget: number;  // 월별 수익 예산
  targetSavings: number;  // 목표 저축액
  avatarEmoji: string;    // 프로필 이모지
  baseAsset: number;      // 기본 저축 자산 (누적 저축액 계산용)
}
