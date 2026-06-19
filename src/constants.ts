import type { CategoryStructure, Transaction, BudgetConfig } from './types';

// 기본 분류 데이터 (수입/비용/저축별 대/중/소분류 체계)
export const DEFAULT_CATEGORIES: CategoryStructure = {
  수익: {
    근로소득: ['급여', '상여금', '주말수당'],
    금융소득: ['이자수익', '배당금', '주식수익'],
    기타소득: ['용돈', '환급금', '당근거래', '당첨금']
  },
  비용: {
    식비: ['외식비', '식자재', '카페/디저트', '배달음식'],
    주거통신: ['월세', '관리비', '통신비', '공과금'],
    교통차량: ['지하철/버스', '택시비', '주유비', '차량정비'],
    생활쇼핑: ['의류/패션', '생필품', '뷰티/미용', '인테리어'],
    문화여가: ['영화/공연', '도서/교육', '여행/숙박', '운동/헬스'],
    경조사비: ['경조사', '선물비', '친목회비', '데이트비']
  },
  저축: {
    예적금: ['정기예금', '자유적금', '청약저축'],
    투자자산: ['국내주식', '해외주식', '가상자산', '펀드'],
    개인연금: ['연금저축', '퇴직연금']
  }
};

export const DEFAULT_BUDGET_CONFIG: BudgetConfig = {
  username: '丕刀卜己卜人丨廿卜',
  monthlyBudget: 4500000,   // 월 평균 수익/예산
  targetSavings: 1500000,   // 월 저축 목표
  avatarEmoji: '🦊',
  baseAsset: 15000000       // 기본 저축 자산
};

// 2개월치 풍성한 샘플 데이터 (차트 시각화용)
export const INITIAL_TRANSACTIONS: Transaction[] = [
  // 2026년 6월 데이터 (현재 월)
  {
    id: 'tx-260601',
    date: '2026-06-01',
    type: '수익',
    category: '근로소득',
    subcategory: '급여',
    detail: '주식회사 丕刀卜己卜人丨廿卜',
    amount: 4250000,
    memo: '6월 정기 급여'
  },
  {
    id: 'tx-260602',
    date: '2026-06-02',
    type: '저축',
    category: '예적금',
    subcategory: '청약저축',
    detail: '청약저축 납입',
    amount: 200000,
    memo: '내집마련 청약'
  },
  {
    id: 'tx-260603',
    date: '2026-06-03',
    type: '비용',
    category: '식비',
    subcategory: '식자재',
    detail: '이마트',
    amount: 85400,
    memo: '일주일 장보기'
  },
  {
    id: 'tx-260605',
    date: '2026-06-05',
    type: '비용',
    category: '주거통신',
    subcategory: '관리비',
    detail: '아파트 관리비',
    amount: 184200,
    memo: '5월 사용분 고지서'
  },
  {
    id: 'tx-260607',
    date: '2026-06-07',
    type: '비용',
    category: '식비',
    subcategory: '외식비',
    detail: '아웃백 스테이크',
    amount: 112000,
    memo: '가족 외식 식사'
  },
  {
    id: 'tx-260608',
    date: '2026-06-08',
    type: '비용',
    category: '생활쇼핑',
    subcategory: '의류/패션',
    detail: '린넨 셔츠 구매',
    amount: 54000,
    memo: '여름 셔츠 구매'
  },
  {
    id: 'tx-260610',
    date: '2026-06-10',
    type: '저축',
    category: '투자자산',
    subcategory: '국내주식',
    detail: '삼성전자 우',
    amount: 500000,
    memo: '매월 정기 분할 매수'
  },
  {
    id: 'tx-260612',
    date: '2026-06-12',
    type: '비용',
    category: '문화여가',
    subcategory: '영화/공연',
    detail: 'CGV 영화관',
    amount: 32000,
    memo: '팝콘 및 영화 티켓'
  },
  {
    id: 'tx-260615',
    date: '2026-06-15',
    type: '수익',
    category: '금융소득',
    subcategory: '배당금',
    detail: '미국 배당금',
    amount: 143200,
    memo: '코카콜라 배당금 입금'
  },
  {
    id: 'tx-260616',
    date: '2026-06-16',
    type: '비용',
    category: '식비',
    subcategory: '카페/디저트',
    detail: '스타벅스',
    amount: 9800,
    memo: '친구 디저트 미팅'
  },
  {
    id: 'tx-260617',
    date: '2026-06-17',
    type: '비용',
    category: '교통차량',
    subcategory: '지하철/버스',
    detail: '티머니 후불',
    amount: 65400,
    memo: '대중교통 교통비 정산'
  },
  {
    id: 'tx-260618',
    date: '2026-06-18',
    type: '비용',
    category: '식비',
    subcategory: '배달음식',
    detail: 'BHC 치킨',
    amount: 26000,
    memo: '야식 뿌링클 치킨'
  },

  // 2026년 5월 데이터
  {
    id: 'tx-260501',
    date: '2026-05-01',
    type: '수익',
    category: '근로소득',
    subcategory: '급여',
    detail: '주식회사 丕刀卜己卜人丨廿卜',
    amount: 4250000,
    memo: '5월 정기 급여'
  },
  {
    id: 'tx-260505',
    date: '2026-05-05',
    type: '비용',
    category: '경조사비',
    subcategory: '선물비',
    detail: '어버이날 용돈 및 선물',
    amount: 300000,
    memo: '어버이날 카네이션 선물'
  },
  {
    id: 'tx-260510',
    date: '2026-05-10',
    type: '저축',
    category: '투자자산',
    subcategory: '국내주식',
    detail: '삼성전자 우',
    amount: 500000,
    memo: '5월 주식 매수'
  },
  {
    id: 'tx-260511',
    date: '2026-05-11',
    type: '저축',
    category: '예적금',
    subcategory: '자유적금',
    detail: '카카오 26주적금',
    amount: 300000,
    memo: '자유 적립식 적금 납입'
  },
  {
    id: 'tx-260512',
    date: '2026-05-12',
    type: '비용',
    category: '식비',
    subcategory: '식자재',
    detail: '홈플러스 마트',
    amount: 142000,
    memo: '주말 식자재 대량 구매'
  },
  {
    id: 'tx-260515',
    date: '2026-05-15',
    type: '수익',
    category: '기타소득',
    subcategory: '당근거래',
    detail: '중고 아이패드 판매',
    amount: 350000,
    memo: '안쓰는 아이패드 당근마켓'
  },
  {
    id: 'tx-260520',
    date: '2026-05-20',
    type: '비용',
    category: '주거통신',
    subcategory: '월세',
    detail: '오피스텔 임대료',
    amount: 600000,
    memo: '5월 정기 월세 송금'
  },
  {
    id: 'tx-260522',
    date: '2026-05-22',
    type: '비용',
    category: '생활쇼핑',
    subcategory: '뷰티/미용',
    detail: '올리브영 세일',
    amount: 45000,
    memo: '선크림 및 생필품 화장품'
  },
  {
    id: 'tx-260525',
    date: '2026-05-25',
    type: '비용',
    category: '교통차량',
    subcategory: '택시비',
    detail: '카카오택시',
    amount: 18500,
    memo: '늦잠 출근 택시 이용'
  },
  {
    id: 'tx-260528',
    date: '2026-05-28',
    type: '비용',
    category: '문화여가',
    subcategory: '여행/숙박',
    detail: '에어비앤비 예약',
    amount: 250000,
    memo: '6월 주말 강릉 여행 예약'
  }
];
