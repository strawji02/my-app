import { useEffect, useState } from 'react';
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

  // 임시 입력값 상태
  const [tempSectionName, setTempSectionName] = useState(section.sectionName || '');
  const [tempArea, setTempArea] = useState(section.area || 0);
  const [tempOriginalGroundLevel, setTempOriginalGroundLevel] = useState(
    section.originalGroundLevel || 0
  );
  const [tempExcavationLevel, setTempExcavationLevel] = useState(
    section.excavationLevel || 0
  );
  const [tempSExcavationLevel1, setTempSExcavationLevel1] = useState(
    section.sExcavationLevel1 || 0
  );
  const [tempSExcavationLevel2, setTempSExcavationLevel2] = useState(
    section.sExcavationLevel2 || 0
  );

  // section이 변경될 때 임시 상태 업데이트
  useEffect(() => {
    setTempSectionName(section.sectionName || '');
    setTempArea(section.area || 0);
    setTempOriginalGroundLevel(section.originalGroundLevel || 0);
    setTempExcavationLevel(section.excavationLevel || 0);
    setTempSExcavationLevel1(section.sExcavationLevel1 || 0);
    setTempSExcavationLevel2(section.sExcavationLevel2 || 0);
  }, [
    section.sectionName,
    section.area,
    section.originalGroundLevel,
    section.excavationLevel,
    section.sExcavationLevel1,
    section.sExcavationLevel2,
  ]);

  // 지형이 선택되면 rows를 생성
  useEffect(() => {
    if (section.terrainType && section.rows.length === 0) {
      const type = section.terrainType === '평면' ? 'p' : 's';
      // 고정값 제거 - 사용자가 입력한 면적값 사용
      const area = section.area || 0;

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

  // 굴착길이 계산 (임시 값 사용)
  const excavationDepth = tempOriginalGroundLevel + tempExcavationLevel;
  const excavationDepth1 = tempOriginalGroundLevel + tempSExcavationLevel1;
  const excavationDepth2 = tempOriginalGroundLevel + tempSExcavationLevel2;

  // 입력 완료 핸들러
  const handleInputComplete = () => {
    console.log('입력 완료 버튼 클릭됨');
    console.log('현재 임시 값들:', {
      tempSectionName,
      tempArea,
      tempOriginalGroundLevel,
      tempExcavationLevel,
      tempSExcavationLevel1,
      tempSExcavationLevel2,
    });
    
    // rows의 면적값도 업데이트
    const updatedRows = section.rows.map(row => ({
      ...row,
      area: tempArea,
      volume: Math.round(tempArea * row.modifiedThickness * (row.applicationRate / 100)),
    }));
    
    // 모든 임시 값을 store에 저장
    updateSection(section.name, {
      sectionName: tempSectionName,
      sectionText: tempSectionName,
      area: tempArea,
      originalGroundLevel: tempOriginalGroundLevel,
      excavationLevel: tempExcavationLevel,
      sExcavationLevel1: tempSExcavationLevel1,
      sExcavationLevel2: tempSExcavationLevel2,
      isInputComplete: true,
      rows: updatedRows,
    });
  };

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
              value={tempSectionName}
              onChange={(e) => setTempSectionName(e.target.value)}
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
                    value={tempArea}
                    onChange={(e) => setTempArea(Number(e.target.value))}
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
                        value={tempOriginalGroundLevel}
                        onChange={(e) =>
                          setTempOriginalGroundLevel(Number(e.target.value))
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
                        value={tempExcavationLevel}
                        onChange={(e) =>
                          setTempExcavationLevel(Number(e.target.value))
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
                    value={tempArea}
                    onChange={(e) => setTempArea(Number(e.target.value))}
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
                        value={tempOriginalGroundLevel}
                        onChange={(e) =>
                          setTempOriginalGroundLevel(Number(e.target.value))
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
                        value={tempSExcavationLevel1}
                        onChange={(e) =>
                          setTempSExcavationLevel1(Number(e.target.value))
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
                        value={tempSExcavationLevel2}
                        onChange={(e) =>
                          setTempSExcavationLevel2(Number(e.target.value))
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
          <div className="mb-4 text-center">
            <button
              type="button"
              onClick={handleInputComplete}
              disabled={!tempSectionName}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 transform active:scale-95 ${
                section.isInputComplete
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                  : tempSectionName
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {section.isInputComplete ? '✓ 입력 완료됨' : '입력 완료'}
            </button>
            {!tempSectionName && (
              <p className="text-sm text-red-500 mt-2">
                구간명을 입력해주세요
              </p>
            )}
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
