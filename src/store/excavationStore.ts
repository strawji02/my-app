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
}

interface RockThickness {
  매립토: number;
  풍화암: number;
  연암: number;
}

interface ExcavationStore {
  // 지형 및 입력 상태
  terrainType: '평면' | '사면' | '';
  sectionName: string;
  isInputComplete: boolean;

  // 면적
  area: number;
  sArea: number;

  // 고도 정보
  originalGroundLevel: number;
  excavationLevel: number;
  sExcavationLevel1: number;
  sExcavationLevel2: number;

  // 구간 데이터
  sections: ExcavationSection[];

  // 암종 두께 (props로 받던 것)
  rockThickness: RockThickness | null;

  // Actions
  setTerrainType: (type: '평면' | '사면' | '') => void;
  setSectionName: (name: string) => void;
  setIsInputComplete: (complete: boolean) => void;
  setArea: (area: number) => void;
  setSArea: (area: number) => void;
  setOriginalGroundLevel: (level: number) => void;
  setExcavationLevel: (level: number) => void;
  setSExcavationLevel1: (level: number) => void;
  setSExcavationLevel2: (level: number) => void;
  setSections: (sections: ExcavationSection[]) => void;
  setRockThickness: (thickness: RockThickness | null) => void;
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

const initialState = {
  terrainType: '' as '평면' | '사면' | '',
  sectionName: '1',
  isInputComplete: false,
  area: 213.23,
  sArea: 18.01,
  originalGroundLevel: 28.05,
  excavationLevel: 0.56,
  sExcavationLevel1: 0.56,
  sExcavationLevel2: 1.76,
  sections: [
    {
      name: 'p-1',
      type: 'p' as const,
      sectionText: '1',
      rows: [
        {
          id: 'p-1-1',
          sectionNumber: '1',
          rockType: '매립토',
          workType: '직' as const,
          item: '일반',
          area: 213.23,
          modifiedThickness: 5.0,
          applicationRate: 100,
          volume: 1066,
        },
        {
          id: 'p-1-2',
          sectionNumber: '2',
          rockType: '매립토',
          workType: '크' as const,
          item: '일반',
          area: 213.23,
          modifiedThickness: 16.475,
          applicationRate: 100,
          volume: 3513,
        },
        {
          id: 'p-1-3',
          sectionNumber: '3',
          rockType: '풍화암',
          workType: '크' as const,
          item: '일반',
          area: 213.23,
          modifiedThickness: 0.75,
          applicationRate: 100,
          volume: 160,
        },
        {
          id: 'p-1-4',
          sectionNumber: '4',
          rockType: '연암',
          workType: '크' as const,
          item: '마사토',
          area: 213.23,
          modifiedThickness: 6.385,
          applicationRate: 100,
          volume: 1361,
        },
      ],
    },
    {
      name: 's-1',
      type: 's' as const,
      sectionText: '1',
      subSections: ['1-2'],
      rows: [
        {
          id: 's-1-1',
          sectionNumber: '1',
          rockType: '매립토',
          workType: '직' as const,
          item: '일반',
          area: 18.01,
          modifiedThickness: 3.0,
          applicationRate: 100,
          volume: 54,
        },
        {
          id: 's-1-2',
          sectionNumber: '2',
          rockType: '매립토',
          workType: '크' as const,
          item: '일반',
          area: 18.01,
          modifiedThickness: 18.48,
          applicationRate: 100,
          volume: 333,
        },
        {
          id: 's-1-3',
          sectionNumber: '3',
          rockType: '풍화암',
          workType: '크' as const,
          item: '일반',
          area: 18.01,
          modifiedThickness: 0.75,
          applicationRate: 100,
          volume: 14,
        },
        {
          id: 's-1-4',
          sectionNumber: '4',
          rockType: '연암',
          workType: '크' as const,
          item: '마사토',
          area: 18.01,
          modifiedThickness: 7.59,
          applicationRate: 100,
          volume: 137,
        },
        {
          id: 's-1-5',
          sectionNumber: '5',
          rockType: '연암',
          workType: '크' as const,
          item: '일반',
          area: 18.01,
          modifiedThickness: 1.21,
          applicationRate: 50,
          volume: 11,
        },
      ],
    },
  ],
  rockThickness: null,
};

const useExcavationStore = create<ExcavationStore>()(
  persist(
    (set) => ({
      ...initialState,

      // Setters
      setTerrainType: (type) => set({ terrainType: type }),
      setSectionName: (name) => set({ sectionName: name }),
      setIsInputComplete: (complete) => set({ isInputComplete: complete }),
      setArea: (area) => set({ area }),
      setSArea: (area) => set({ sArea: area }),
      setOriginalGroundLevel: (level) => set({ originalGroundLevel: level }),
      setExcavationLevel: (level) => set({ excavationLevel: level }),
      setSExcavationLevel1: (level) => set({ sExcavationLevel1: level }),
      setSExcavationLevel2: (level) => set({ sExcavationLevel2: level }),
      setSections: (sections) => set({ sections }),
      setRockThickness: (thickness) => set({ rockThickness: thickness }),

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
          const currentType = state.terrainType === '평면' ? 'p' : 's';
          const existingSections = state.sections.filter(
            (s) => s.type === currentType
          );

          // 기존 섹션들의 번호 중 가장 큰 번호를 찾음
          let maxNumber = 0;
          existingSections.forEach((section) => {
            // section.name이 'p-2', 's-3' 같은 형식일 때 숫자 추출
            const match = section.name.match(/[ps]-(\d+)/);
            if (match) {
              const num = parseInt(match[1]);
              if (num > maxNumber) maxNumber = num;
            }
          });

          const newSectionNumber = maxNumber === 0 ? 1 : maxNumber + 1;

          const newSection: ExcavationSection = {
            name: `${currentType}-${newSectionNumber}`,
            type: currentType,
            sectionText: `${newSectionNumber}`,
            rows: [
              {
                id: `${currentType}-${newSectionNumber}-1`,
                sectionNumber: '1',
                rockType: '매립토',
                workType: '직',
                item: '일반',
                area: currentType === 'p' ? state.area : state.sArea,
                modifiedThickness: 5.0,
                applicationRate: 100,
                volume: 0,
              },
              {
                id: `${currentType}-${newSectionNumber}-2`,
                sectionNumber: '2',
                rockType: '매립토',
                workType: '크',
                item: '일반',
                area: currentType === 'p' ? state.area : state.sArea,
                modifiedThickness: 0,
                applicationRate: 100,
                volume: 0,
              },
              {
                id: `${currentType}-${newSectionNumber}-3`,
                sectionNumber: '3',
                rockType: '풍화암',
                workType: '크',
                item: '일반',
                area: currentType === 'p' ? state.area : state.sArea,
                modifiedThickness: 0,
                applicationRate: 100,
                volume: 0,
              },
              {
                id: `${currentType}-${newSectionNumber}-4`,
                sectionNumber: '4',
                rockType: '연암',
                workType: '크',
                item: '마사토',
                area: currentType === 'p' ? state.area : state.sArea,
                modifiedThickness: 0,
                applicationRate: 100,
                volume: 0,
              },
              ...(currentType === 's'
                ? [
                    {
                      id: `${currentType}-${newSectionNumber}-5`,
                      sectionNumber: '5',
                      rockType: '연암',
                      workType: '크' as const,
                      item: '일반',
                      area: state.sArea,
                      modifiedThickness: 0,
                      applicationRate: 50,
                      volume: 0,
                    },
                  ]
                : []),
            ],
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
