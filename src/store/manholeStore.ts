import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ManholeState, ManholeInputData, ManholeCalculationResult } from '@/types/manhole';

interface ManholeStore extends ManholeState {
  // Header actions
  setTitle: (title: string) => void;
  setSpecification: (specification: string) => void;
  setUnit: (unit: string) => void;
  
  // Image actions
  setImage: (image: { src: string; width: number; height: number } | null) => void;
  updateImageSize: (width: number, height: number) => void;
  
  // Input data actions
  updateInputData: (data: Partial<ManholeInputData>) => void;
  calculateDerivedValues: () => void;
  
  // Calculation actions
  calculateResults: () => void;
  
  // Reset
  reset: () => void;
}

const initialState: ManholeState = {
  header: {
    title: '우수1호 맨홀',
    specification: '(D900mm)',
    unit: '개소당'
  },
  image: null,
  inputData: {
    d0: 0,
    d1: 0,
    d2: 0,
    d3: 0,
    d4: 0,
    D: 0,
    t1: 0,
    t2: 0,
    t3: 0,
    t5: 0,
    t6: 0,
    t7: 0,
    H: 0,
  },
  calculationResult: null
};

export const useManholeStore = create<ManholeStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Header actions
      setTitle: (title) => set((state) => ({
        header: { ...state.header, title }
      })),
      
      setSpecification: (specification) => set((state) => ({
        header: { ...state.header, specification }
      })),
      
      setUnit: (unit) => set((state) => ({
        header: { ...state.header, unit }
      })),
      
      // Image actions
      setImage: (image) => set({ image }),
      
      updateImageSize: (width, height) => set((state) => ({
        image: state.image ? { ...state.image, width, height } : null
      })),
      
      // Input data actions
      updateInputData: (data) => {
        set((state) => ({
          inputData: { ...state.inputData, ...data }
        }));
        // 입력값이 변경되면 자동으로 파생값 계산
        get().calculateDerivedValues();
      },
      
      calculateDerivedValues: () => {
        const { inputData } = get();
        const { d0, d1, d2, d3, D, t1, t2, t3, t5, t6, t7, H } = inputData;
        
        // 계산식 적용 (이미지에 표시된 공식들)
        const WIDE_A = d0 + (t2 + t1) * 2;
        const WIDE_B = H * 0.3 * 2 + D;
        const t4 = H - (d1 + d2 + d3);
        const D1 = D + t3 * 2;
        const D2 = D + t5 * 2;
        const H1 = H + t6 + t7 + t2 + t1;
        
        set((state) => ({
          inputData: {
            ...state.inputData,
            WIDE_A,
            WIDE_B,
            t4,
            D1,
            D2,
            H1
          }
        }));
      },
      
      // 14개 공종 수량 계산
      calculateResults: () => {
        const { inputData } = get();
        
        // mm를 m로 변환하는 함수
        const toMeter = (mm: number) => mm / 1000;
        
        // 각 값들을 미터로 변환
        const wideA = toMeter(inputData.WIDE_A || 0);
        const wideB = toMeter(inputData.WIDE_B || 0);
        const h1 = toMeter(inputData.H1 || 0);
        const d = toMeter(inputData.D);
        const h = toMeter(inputData.H);
        const t1 = toMeter(inputData.t1);
        const t2 = toMeter(inputData.t2);
        const t3 = toMeter(inputData.t3);
        const t4 = toMeter(inputData.t4 || 0);
        const t5 = toMeter(inputData.t5);
        const t6 = toMeter(inputData.t6);
        const t7 = toMeter(inputData.t7);
        
        // 예시 계산식 (실제 공식은 요구사항에 따라 조정 필요)
        const result: ManholeCalculationResult = {
          터파기: {
            공종: '터파기',
            규격: `${wideA.toFixed(2)}×${wideB.toFixed(2)}×${h1.toFixed(2)}`,
            단위: 'm³',
            수량: Number((wideA * wideB * h1).toFixed(3))
          },
          잔토처리: {
            공종: '잔토처리',
            규격: '-',
            단위: 'm³',
            수량: Number((wideA * wideB * h1 * 0.1).toFixed(3)) // 예시: 터파기의 10%
          },
          되메우기: {
            공종: '되메우기',
            규격: '-',
            단위: 'm³',
            수량: Number((wideA * wideB * h1 * 0.8).toFixed(3)) // 예시: 터파기의 80%
          },
          사토처리: {
            공종: '사토처리',
            규격: '-',
            단위: 'm³',
            수량: Number((wideA * wideB * h1 * 0.2).toFixed(3)) // 예시: 터파기의 20%
          },
          기초콘크리트타설: {
            공종: '기초콘크리트타설',
            규격: 'FCK=180',
            단위: 'm³',
            수량: Number((wideA * wideB * t6).toFixed(3))
          },
          바닥슬래브타설: {
            공종: '바닥슬래브타설',
            규격: 'FCK=210',
            단위: 'm³',
            수량: Number((Math.PI * Math.pow(d/2 + t5, 2) * t5).toFixed(3))
          },
          벽체타설: {
            공종: '벽체타설',
            규격: 'FCK=210',
            단위: 'm³',
            수량: Number((Math.PI * (d + t3) * t3 * h).toFixed(3))
          },
          상부슬래브타설: {
            공종: '상부슬래브타설',
            규격: 'FCK=210',
            단위: 'm³',
            수량: Number((Math.PI * Math.pow(d/2 + t1, 2) * t1).toFixed(3))
          },
          거푸집: {
            공종: '거푸집',
            규격: '합판',
            단위: 'm²',
            수량: Number((Math.PI * d * h * 2).toFixed(3)) // 내외부 벽체
          },
          철근: {
            공종: '철근',
            규격: 'HD13~25',
            단위: 'ton',
            수량: Number(((wideA * wideB * h1 * 0.1) * 7.85).toFixed(3)) // 예시 계산
          },
          맨홀뚜껑: {
            공종: '맨홀뚜껑',
            규격: 'KS규격',
            단위: '개소',
            수량: 1
          },
          접속관연결: {
            공종: '접속관연결',
            규격: 'D300mm',
            단위: '개소',
            수량: 2 // 예시: 유입구 + 유출구
          },
          방수: {
            공종: '방수',
            규격: '도막방수',
            단위: 'm²',
            수량: Number((Math.PI * d * h).toFixed(3)) // 내부 벽체
          },
          기초잡석: {
            공종: '기초잡석',
            규격: 'T=200',
            단위: 'm³',
            수량: Number((wideA * wideB * 0.2).toFixed(3))
          }
        };
        
        set({ calculationResult: result });
      },
      
      // Reset
      reset: () => set(initialState)
    }),
    {
      name: 'manhole-storage'
    }
  )
);