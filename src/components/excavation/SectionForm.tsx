import { useEffect } from 'react';
import useExcavationStore from '@/store/excavationStore';
import SectionTable from './SectionTable';

interface SectionFormProps {
  section: {
    name: string;
    type: 'p' | 's';
    sectionText?: string;
    rows: Array<{
      id: string;
      sectionNumber: string;
      rockType: string;
      workType: '직' | '크';
      item: string;
      area: number;
      modifiedThickness: number;
      applicationRate: number;
      volume: number;
    }>;
    terrainType: '평면' | '사면' | '';
    sectionName: string;
    isInputComplete: boolean;
    area: number;
    originalGroundLevel: number;
    excavationLevel: number;
    sExcavationLevel1?: number;
    sExcavationLevel2?: number;
  };
  sectionIndex: number;
}

export default function SectionForm({
  section,
  sectionIndex,
}: SectionFormProps) {
  const { updateSection, deleteSection } = useExcavationStore();

  // 지형이 선택되면 rows를 생성
  useEffect(() => {
    if (section.terrainType && section.rows.length === 0) {
      const type = section.terrainType === '평면' ? 'p' : 's';
      const area = section.area || (type === 'p' ? 213.23 : 18.01);

      const rows = [
        {
          id: `${section.name}-1`,
          sectionNumber: '1',
          rockType: '매립토',
          workType: '직' as const,
          item: '일반',
          area: area,
          modifiedThickness: 5.0,
          applicationRate: 100,
          volume: Math.round(area * 5.0),
        },
        {
          id: `${section.name}-2`,
          sectionNumber: '2',
          rockType: '매립토',
          workType: '크' as const,
          item: '일반',
          area: area,
          modifiedThickness: 0,
          applicationRate: 100,
          volume: 0,
        },
        {
          id: `${section.name}-3`,
          sectionNumber: '3',
          rockType: '풍화암',
          workType: '크' as const,
          item: '일반',
          area: area,
          modifiedThickness: 0,
          applicationRate: 100,
          volume: 0,
        },
        {
          id: `${section.name}-4`,
          sectionNumber: '4',
          rockType: '연암',
          workType: '크' as const,
          item: '마사토',
          area: area,
          modifiedThickness: 0,
          applicationRate: 100,
          volume: 0,
        },
        ...(type === 's'
          ? [
              {
                id: `${section.name}-5`,
                sectionNumber: '5',
                rockType: '연암',
                workType: '크' as const,
                item: '일반',
                area: area,
                modifiedThickness: 0,
                applicationRate: 50,
                volume: 0,
              },
            ]
          : []),
      ];

      updateSection(section.name, {
        rows,
        type,
        name: section.name.replace('new-', `${type}-`),
      });
    }
  }, [
    section.terrainType,
    section.rows.length,
    section.name,
    section.area,
    updateSection,
  ]);

  // 굴착길이 계산
  const excavationDepth = section.originalGroundLevel + section.excavationLevel;
  const excavationDepth1 =
    section.originalGroundLevel + (section.sExcavationLevel1 || 0);
  const excavationDepth2 =
    section.originalGroundLevel + (section.sExcavationLevel2 || 0);

  return (
    <div className="border-2 border-gray-300 rounded-lg p-6 mb-6 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">구간 {sectionIndex + 1}</h3>
        <button
          onClick={() => deleteSection(section.name)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          구간 삭제
        </button>
      </div>

      {/* 4-1. 지형 선택 */}
      <div className="bg-white p-4 rounded-lg mb-4">
        <h4 className="font-bold text-sm mb-3">4-1. 지형 선택</h4>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name={`terrain-${section.name}`}
              value="평면"
              checked={section.terrainType === '평면'}
              onChange={(e) => {
                updateSection(section.name, {
                  terrainType: e.target.value as '평면',
                  isInputComplete: false,
                  rows: [], // 지형 변경시 rows 초기화
                });
              }}
              className="mr-2"
            />
            <span className="text-sm">평면</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name={`terrain-${section.name}`}
              value="사면"
              checked={section.terrainType === '사면'}
              onChange={(e) => {
                updateSection(section.name, {
                  terrainType: e.target.value as '사면',
                  isInputComplete: false,
                  rows: [], // 지형 변경시 rows 초기화
                });
              }}
              className="mr-2"
            />
            <span className="text-sm">사면</span>
          </label>
        </div>
      </div>

      {/* 구간명 입력 및 구간 입력 */}
      {section.terrainType && (
        <>
          <div className="bg-white p-4 rounded-lg mb-4">
            <h4 className="font-bold text-sm mb-2">4-2. 구간명 입력</h4>
            <input
              type="text"
              value={section.sectionName}
              onChange={(e) =>
                updateSection(section.name, {
                  sectionName: e.target.value,
                  sectionText: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="예: 1, A, 구간1 등"
            />
          </div>

          {/* P 구간 입력 */}
          {section.terrainType === '평면' && (
            <div className="bg-white p-4 rounded-lg mb-4">
              <h4 className="font-bold text-sm mb-2">4-3. P 구간 입력</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    면적 (m²)
                  </label>
                  <input
                    type="number"
                    value={section.area}
                    onChange={(e) =>
                      updateSection(section.name, {
                        area: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    원지반고
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">원지반고:</span>
                      <span className="text-sm">EL</span>
                      <input
                        type="number"
                        value={section.originalGroundLevel}
                        onChange={(e) =>
                          updateSection(section.name, {
                            originalGroundLevel: Number(e.target.value),
                          })
                        }
                        className="w-24 px-2 py-1 border border-gray-300 rounded"
                        step="0.01"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">터파기고:</span>
                      <span className="text-sm">-EL</span>
                      <input
                        type="number"
                        value={section.excavationLevel}
                        onChange={(e) =>
                          updateSection(section.name, {
                            excavationLevel: Number(e.target.value),
                          })
                        }
                        className="w-24 px-2 py-1 border border-gray-300 rounded"
                        step="0.01"
                      />
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      굴착길이: {excavationDepth.toFixed(2)}m
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* S 구간 입력 */}
          {section.terrainType === '사면' && (
            <div className="bg-white p-4 rounded-lg mb-4">
              <h4 className="font-bold text-sm mb-2">4-3. S 구간 입력</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    면적 (m²)
                  </label>
                  <input
                    type="number"
                    value={section.area}
                    onChange={(e) =>
                      updateSection(section.name, {
                        area: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    원지반고
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">원지반고:</span>
                      <span className="text-sm">EL</span>
                      <input
                        type="number"
                        value={section.originalGroundLevel}
                        onChange={(e) =>
                          updateSection(section.name, {
                            originalGroundLevel: Number(e.target.value),
                          })
                        }
                        className="w-24 px-2 py-1 border border-gray-300 rounded"
                        step="0.01"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">터파기고1:</span>
                      <span className="text-sm">-EL</span>
                      <input
                        type="number"
                        value={section.sExcavationLevel1}
                        onChange={(e) =>
                          updateSection(section.name, {
                            sExcavationLevel1: Number(e.target.value),
                          })
                        }
                        className="w-24 px-2 py-1 border border-gray-300 rounded"
                        step="0.01"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">터파기고2:</span>
                      <span className="text-sm">-EL</span>
                      <input
                        type="number"
                        value={section.sExcavationLevel2}
                        onChange={(e) =>
                          updateSection(section.name, {
                            sExcavationLevel2: Number(e.target.value),
                          })
                        }
                        className="w-24 px-2 py-1 border border-gray-300 rounded"
                        step="0.01"
                      />
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="font-medium text-blue-600">
                        굴착길이1: {excavationDepth1.toFixed(2)}m
                      </p>
                      <p className="font-medium text-blue-600">
                        굴착길이2: {excavationDepth2.toFixed(2)}m
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 입력 완료 버튼 */}
          <div className="mb-4">
            <button
              onClick={() =>
                updateSection(section.name, { isInputComplete: true })
              }
              className={`px-4 py-2 rounded ${
                section.isInputComplete
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {section.isInputComplete ? '✓ 입력 완료' : '입력 완료'}
            </button>
          </div>

          {/* 구간별 산출 테이블 */}
          {section.isInputComplete && section.rows.length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold text-sm mb-2">4.4. 구간별 산출</h4>
              <SectionTable section={section} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
