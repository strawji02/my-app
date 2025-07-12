import { useMemo } from 'react';
import useExcavationStore from '@/store/excavationStore';

export default function ValidationInfo() {
  const { rockThickness, sections } = useExcavationStore();

  const validationData = useMemo(() => {
    if (!rockThickness) return null;

    const totalThickness =
      rockThickness.매립토 + rockThickness.풍화암 + rockThickness.연암;

    // 각 구간별 검증 데이터
    const sectionValidations = sections
      .filter((section) => section.isInputComplete && section.rows.length > 0)
      .map((section) => {
        const excavationDepth =
          section.terrainType === '평면'
            ? section.originalGroundLevel + section.excavationLevel
            : section.originalGroundLevel + (section.sExcavationLevel1 || 0);

        // 각 암종별 수정층후 합계 계산
        const rockSums = {
          매립토: 0,
          풍화암: 0,
          연암: 0,
        };

        section.rows.forEach((row) => {
          if (row.rockType in rockSums) {
            rockSums[row.rockType as keyof typeof rockSums] +=
              row.modifiedThickness;
          }
        });

        const totalModifiedThickness =
          rockSums.매립토 + rockSums.풍화암 + rockSums.연암;

        return {
          name: section.name,
          type: section.type,
          sectionText: section.sectionText || section.sectionName,
          originalThickness: {
            매립토: rockThickness.매립토,
            풍화암: rockThickness.풍화암,
            연암: rockThickness.연암,
            total: totalThickness,
          },
          modifiedThickness: {
            매립토: rockSums.매립토,
            풍화암: rockSums.풍화암,
            연암: rockSums.연암,
            total: totalModifiedThickness,
          },
          excavationDepth,
          isValid: Math.abs(totalModifiedThickness - excavationDepth) < 0.01,
        };
      });

    // 전체 합계 계산
    const totalRockSums = {
      매립토: 0,
      풍화암: 0,
      연암: 0,
    };

    sections.forEach((section) => {
      if (section.isInputComplete) {
        section.rows.forEach((row) => {
          if (row.rockType in totalRockSums) {
            totalRockSums[row.rockType as keyof typeof totalRockSums] +=
              row.modifiedThickness;
          }
        });
      }
    });

    return {
      originalThickness: {
        매립토: rockThickness.매립토,
        풍화암: rockThickness.풍화암,
        연암: rockThickness.연암,
        total: totalThickness,
      },
      totalModifiedThickness: {
        매립토: totalRockSums.매립토,
        풍화암: totalRockSums.풍화암,
        연암: totalRockSums.연암,
        total: totalRockSums.매립토 + totalRockSums.풍화암 + totalRockSums.연암,
      },
      sectionValidations,
    };
  }, [rockThickness, sections]);

  if (!validationData || validationData.sectionValidations.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
      <h3 className="font-bold text-sm mb-3">수정층후 검증</h3>

      {/* 구간별 검증 */}
      <div className="mb-4">
        <h4 className="font-medium text-sm mb-2">구간별 검증 결과</h4>
        <div className="space-y-2">
          {validationData.sectionValidations.map((section) => (
            <div
              key={section.name}
              className="bg-white p-3 rounded border border-gray-200"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">
                  {section.type.toUpperCase()}-{section.sectionText}
                </span>
                <span
                  className={`text-sm font-bold ${
                    section.isValid ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {section.isValid ? '✓ 일치' : '✗ 불일치'}
                </span>
              </div>
              <div className="text-xs grid grid-cols-2 gap-2">
                <div>
                  <p>굴착길이: {section.excavationDepth.toFixed(3)}m</p>
                  <p>
                    수정층후 합계: {section.modifiedThickness.total.toFixed(3)}m
                  </p>
                </div>
                <div>
                  <p>매립토: {section.modifiedThickness.매립토.toFixed(3)}m</p>
                  <p>풍화암: {section.modifiedThickness.풍화암.toFixed(3)}m</p>
                  <p>연암: {section.modifiedThickness.연암.toFixed(3)}m</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 전체 합계 */}
      <div className="border-t pt-3">
        <h4 className="font-medium text-sm mb-2">전체 수정층후 합계</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium mb-2">원본 층후</h5>
            <div className="space-y-1">
              <p>
                매립토: {validationData.originalThickness.매립토.toFixed(3)}m
              </p>
              <p>
                풍화암: {validationData.originalThickness.풍화암.toFixed(3)}m
              </p>
              <p>연암: {validationData.originalThickness.연암.toFixed(3)}m</p>
              <p className="font-bold">
                합계: {validationData.originalThickness.total.toFixed(3)}m
              </p>
            </div>
          </div>
          <div>
            <h5 className="font-medium mb-2">전체 구간 합계</h5>
            <div className="space-y-1">
              <p>
                매립토:{' '}
                {validationData.totalModifiedThickness.매립토.toFixed(3)}m (
                {sections.filter((s) => s.isInputComplete).length}개 구간)
              </p>
              <p>
                풍화암:{' '}
                {validationData.totalModifiedThickness.풍화암.toFixed(3)}m
              </p>
              <p>
                연암: {validationData.totalModifiedThickness.연암.toFixed(3)}m
              </p>
              <p className="font-bold">
                합계: {validationData.totalModifiedThickness.total.toFixed(3)}m
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
