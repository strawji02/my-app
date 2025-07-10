import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  GroundLevelData,
  GeologicalData,
  CalculationType,
} from '@/types/earthwork';

interface ModifiedThickness {
  modified: {
    landfill: number;
    weatheredRock: number;
    softRock: number;
    cumulative: {
      landfill: number;
      weatheredRock: number;
      softRock: number;
    };
  };
}

interface EarthworkStore {
  // 단계별 진행 상태
  currentStep: 1 | 2 | 3 | 4;
  completedSteps: number[];

  // CSV 데이터
  groundLevelData: GroundLevelData | null;
  geologicalData: GeologicalData | null;
  calculationType: CalculationType;

  // 계산 결과
  calculationResults: {
    averageThickness: {
      매립토: number;
      풍화토: number;
      풍화암: number;
      연암: number;
      경암: number;
    };
    modifiedThickness: ModifiedThickness | null;
  } | null;

  // Actions
  setGroundLevelData: (data: GroundLevelData | null) => void;
  setGeologicalData: (data: GeologicalData | null) => void;
  setCalculationType: (type: CalculationType) => void;
  setCurrentStep: (step: 1 | 2 | 3 | 4) => void;
  markStepComplete: (step: number) => void;
  setCalculationResults: (
    results: EarthworkStore['calculationResults']
  ) => void;
  resetAll: () => void;
  hasStoredData: () => boolean;
}

const useEarthworkStore = create<EarthworkStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      currentStep: 1,
      completedSteps: [],
      groundLevelData: null,
      geologicalData: null,
      calculationType: 'TYPE1',
      calculationResults: null,

      // Actions
      setGroundLevelData: (data) => set({ groundLevelData: data }),
      setGeologicalData: (data) => set({ geologicalData: data }),
      setCalculationType: (type) => set({ calculationType: type }),
      setCurrentStep: (step) => set({ currentStep: step }),
      markStepComplete: (step) =>
        set((state) => ({
          completedSteps: [...new Set([...state.completedSteps, step])],
        })),
      setCalculationResults: (results) => set({ calculationResults: results }),
      resetAll: () =>
        set({
          currentStep: 1,
          completedSteps: [],
          groundLevelData: null,
          geologicalData: null,
          calculationType: 'TYPE1',
          calculationResults: null,
        }),
      hasStoredData: () => {
        const state = get();
        return !!(state.groundLevelData && state.geologicalData);
      },
    }),
    {
      name: 'earthwork-storage', // localStorage key
    }
  )
);

export default useEarthworkStore;
