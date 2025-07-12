import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ExcavationRow {
  id: string;
  sectionNumber: string;
  rockType: string;
  workType: '직' | '크';
  item: string;
  area: number;
  modifiedThickness: number;
  applicationRate: number;
  volume: number;
}

interface ExcavationSection {
  name: string;
  type: 'p' | 's';
  sectionText?: string;
  rows: ExcavationRow[];
  excavationLevel2?: number;
  subSections?: string[];
  // 각 구간별 입력 상태
  terrainType: '평면' | '사면' | '';
  sectionName: string;
  isInputComplete: boolean;
  area: number;
  originalGroundLevel: number;
  excavationLevel: number;
  sExcavationLevel1?: number;
  sExcavationLevel2?: number;
}

interface RockThickness {
  매립토: number;
  풍화암: number;
  연암: number;
}

interface ExcavationStore {
  // 구간 데이터
  sections: ExcavationSection[];

  // 암종 두께 (props로 받던 것)
  rockThickness: RockThickness | null;

  // Actions
  setSections: (sections: ExcavationSection[]) => void;
  setRockThickness: (thickness: RockThickness | null) => void;
  updateSection: (
    sectionName: string,
    updates: Partial<ExcavationSection>
  ) => void;
  updateRow: (
    sectionName: string,
    rowId: string,
    field: keyof ExcavationRow,
    value: string | number
  ) => void;
  addSection: () => void;
  deleteSection: (sectionName: string) => void;
  updateSectionText: (sectionName: string, text: string) => void;
  reset: () => void;
}

// createNewSection 함수는 현재 사용하지 않으므로 제거

const initialState = {
  sections: [],
  rockThickness: null,
};

const useExcavationStore = create<ExcavationStore>()(
  persist(
    (set) => ({
      ...initialState,

      // Setters
      setSections: (sections) => set({ sections }),
      setRockThickness: (thickness) => set({ rockThickness: thickness }),

      // Section 업데이트
      updateSection: (sectionName, updates) =>
        set((state) => ({
          sections: state.sections.map((section) =>
            section.name === sectionName ? { ...section, ...updates } : section
          ),
        })),

      // Row 업데이트
      updateRow: (sectionName, rowId, field, value) =>
        set((state) => ({
          sections: state.sections.map((section) => {
            if (section.name === sectionName) {
              return {
                ...section,
                rows: section.rows.map((row) => {
                  if (row.id === rowId) {
                    const updatedRow = {
                      ...row,
                      [field]:
                        field === 'area' ||
                        field === 'modifiedThickness' ||
                        field === 'applicationRate'
                          ? Number(value)
                          : value,
                    };

                    // 면적, 적용률, 수정층후가 변경되면 볼륨 재계산
                    if (
                      field === 'area' ||
                      field === 'applicationRate' ||
                      field === 'modifiedThickness'
                    ) {
                      updatedRow.volume = Math.round(
                        updatedRow.area *
                          updatedRow.modifiedThickness *
                          (updatedRow.applicationRate / 100)
                      );
                    }

                    return updatedRow;
                  }
                  return row;
                }),
              };
            }
            return section;
          }),
        })),

      // 구간 추가
      addSection: () =>
        set((state) => {
          // 기존 섹션들의 번호 중 가장 큰 번호를 찾음
          let maxNumber = 0;
          state.sections.forEach((section) => {
            const match = section.name.match(/[ps]-(\d+)/);
            if (match) {
              const num = parseInt(match[1]);
              if (num > maxNumber) maxNumber = num;
            }
          });

          const newSectionNumber = maxNumber === 0 ? 1 : maxNumber + 1;

          // 새 구간은 아직 지형이 선택되지 않은 상태로 생성
          const newSection: ExcavationSection = {
            name: `new-${newSectionNumber}`,
            type: 'p', // 기본값
            sectionText: '',
            terrainType: '', // 빈 상태로 시작
            sectionName: '',
            isInputComplete: false,
            area: 0,
            originalGroundLevel: 28.05,
            excavationLevel: 0.56,
            rows: [],
          };

          return { sections: [...state.sections, newSection] };
        }),

      // 구간 삭제
      deleteSection: (sectionName) =>
        set((state) => ({
          sections: state.sections.filter((s) => s.name !== sectionName),
        })),

      // 구간 텍스트 업데이트
      updateSectionText: (sectionName, text) =>
        set((state) => ({
          sections: state.sections.map((s) =>
            s.name === sectionName ? { ...s, sectionText: text } : s
          ),
        })),

      // 초기화
      reset: () => set(initialState),
    }),
    {
      name: 'excavation-storage',
    }
  )
);

export default useExcavationStore;
