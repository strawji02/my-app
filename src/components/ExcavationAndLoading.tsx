'use client';

import { useEffect } from 'react';
import useExcavationStore from '@/store/excavationStore';
import TerrainSelector from './excavation/TerrainSelector';
import SectionNameInput from './excavation/SectionNameInput';
import PlaneSectionInput from './excavation/PlaneSectionInput';
import SlopeSectionInput from './excavation/SlopeSectionInput';
import SectionTable from './excavation/SectionTable';
import ValidationInfo from './excavation/ValidationInfo';
import CalculationGuide from './excavation/CalculationGuide';
import SummaryTable from './excavation/SummaryTable';

interface ExcavationAndLoadingProps {
  rockThickness: {
    매립토: number;
    풍화암: number;
    연암: number;
  };
}

export default function ExcavationAndLoading({
  rockThickness,
}: ExcavationAndLoadingProps) {
  const {
    terrainType,
    sections,
    isInputComplete,
    setIsInputComplete,
    setRockThickness,
    addSection,
  } = useExcavationStore();

  // rockThickness props를 store에 저장
  useEffect(() => {
    setRockThickness(rockThickness);
  }, [rockThickness, setRockThickness]);

  // 필터링된 섹션들 (현재 선택된 지형에 맞는 섹션만 표시)
  const filteredSections = sections.filter((section) => {
    if (terrainType === '평면') {
      return section.type === 'p';
    } else if (terrainType === '사면') {
      return section.type === 's';
    }
    return false;
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-6">4. 터파기 및 상차</h2>

      {/* 지형 선택 */}
      <TerrainSelector />

      {/* 구간명 입력 */}
      {terrainType && (
        <div className="mt-4">
          <SectionNameInput />
        </div>
      )}

      {/* P구간 또는 S구간 입력 */}
      {terrainType === '평면' && <PlaneSectionInput />}
      {terrainType === '사면' && <SlopeSectionInput />}

      {/* 입력 완료 버튼 */}
      {terrainType && (
        <div className="mt-4">
          <button
            onClick={() => setIsInputComplete(true)}
            className={`px-4 py-2 rounded ${
              isInputComplete
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isInputComplete ? '✓ 입력 완료' : '입력 완료'}
          </button>
        </div>
      )}

      {/* 구간별 산출 */}
      {isInputComplete && (
        <div className="mt-6">
          <h3 className="font-bold text-lg mb-4">4.4. 구간별 산출</h3>

          {/* 각 구간 테이블 */}
          {filteredSections.map((section) => (
            <SectionTable key={section.name} section={section} />
          ))}

          {/* 구간 추가 버튼 */}
          <button
            onClick={addSection}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + 구간 추가
          </button>

          {/* 합계표 추가 */}
          <SummaryTable />

          {/* 전체 합계 */}
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h4 className="font-bold">전체 합계</h4>
            <p className="text-lg font-bold text-blue-600 mt-2">
              {filteredSections
                .reduce(
                  (total, section) =>
                    total +
                    section.rows.reduce((acc, row) => acc + row.volume, 0),
                  0
                )
                .toLocaleString()}{' '}
              m³
            </p>
          </div>

          {/* 수정층후 검증 */}
          <ValidationInfo />

          {/* 계산식 설명 */}
          <CalculationGuide />
        </div>
      )}
    </div>
  );
}
