'use client';

import { useEffect } from 'react';
import useExcavationStore from '@/store/excavationStore';
import SectionForm from './excavation/SectionForm';
import SummaryTable from './excavation/SummaryTable';
import ValidationInfo from './excavation/ValidationInfo';
import CalculationGuide from './excavation/CalculationGuide';

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
  const { sections, setRockThickness, addSection } = useExcavationStore();

  // rockThickness props를 store에 저장
  useEffect(() => {
    setRockThickness(rockThickness);
  }, [rockThickness, setRockThickness]);

  // 첫 번째 구간이 없으면 자동으로 추가
  useEffect(() => {
    if (sections.length === 0) {
      addSection();
    }
  }, [sections.length, addSection]);

  // 모든 구간이 입력 완료되었는지 확인
  const allSectionsComplete = sections.every(
    (section) => section.isInputComplete && section.rows.length > 0
  );

  // 전체 부피 합계 계산
  const totalVolume = sections.reduce(
    (total, section) =>
      total + section.rows.reduce((acc, row) => acc + row.volume, 0),
    0
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-6">4. 터파기 및 상차</h2>

      {/* 각 구간 폼 */}
      {sections.map((section, index) => (
        <SectionForm
          key={section.name}
          section={section}
          sectionIndex={index}
        />
      ))}

      {/* 구간 추가 버튼 */}
      <div className="text-center mb-6">
        <button
          onClick={addSection}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
        >
          + 새 구간 추가
        </button>
      </div>

      {/* 전체 결과 섹션 - 모든 구간이 완료되었을 때만 표시 */}
      {allSectionsComplete && sections.length > 0 && (
        <div className="border-t-2 border-gray-300 pt-6 mt-6">
          <h3 className="font-bold text-lg mb-4">전체 산출 결과</h3>

          {/* 합계표 */}
          <SummaryTable />

          {/* 전체 합계 */}
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h4 className="font-bold">전체 부피 합계</h4>
            <p className="text-lg font-bold text-blue-600 mt-2">
              {totalVolume.toLocaleString()} m³
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
