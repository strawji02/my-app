export interface ManholeHeader {
  title: string;
  specification: string;
  unit: string;
}

export interface ManholeInputData {
  // 사용자 입력 변수 (단위: mm)
  d0: number;
  d1: number;
  d2: number;
  d3: number;
  d4: number;
  D: number;
  t1: number;
  t2: number;
  t3: number;
  t5: number;
  t6: number;
  t7: number;
  H: number;
  
  // 자동 계산 변수 (단위: mm)
  WIDE_A?: number;
  WIDE_B?: number;
  t4?: number;
  D1?: number;
  D2?: number;
  H1?: number;
}

export interface ManholeImage {
  src: string;
  width: number;
  height: number;
}

export interface ManholeWorkItem {
  공종: string;
  규격: string;
  단위: string;
  수량: number;
}

export interface ManholeCalculationResult {
  터파기: ManholeWorkItem;
  잔토처리: ManholeWorkItem;
  되메우기: ManholeWorkItem;
  사토처리: ManholeWorkItem;
  기초콘크리트타설: ManholeWorkItem;
  바닥슬래브타설: ManholeWorkItem;
  벽체타설: ManholeWorkItem;
  상부슬래브타설: ManholeWorkItem;
  거푸집: ManholeWorkItem;
  철근: ManholeWorkItem;
  맨홀뚜껑: ManholeWorkItem;
  접속관연결: ManholeWorkItem;
  방수: ManholeWorkItem;
  기초잡석: ManholeWorkItem;
}

export interface ManholeState {
  header: ManholeHeader;
  image: ManholeImage | null;
  inputData: ManholeInputData;
  calculationResult: ManholeCalculationResult | null;
}