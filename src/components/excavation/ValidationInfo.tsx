import { useMemo } from 'react';
import useExcavationStore from '@/store/excavationStore';

export default function ValidationInfo() {
  const {
    rockThickness,
    originalGroundLevel,
    excavationLevel,
    sExcavationLevel1,
    terrainType,
    sections,
  } = useExcavationStore();

  const validationData = useMemo(() => {
    if (!rockThickness) return null;

    const totalThickness =
      rockThickness.매립토 + rockThickness.풍화암 + rockThickness.연암;
    const excavationDepth =
      terrainType === '평면'
        ? originalGroundLevel + excavationLevel
        : originalGroundLevel + sExcavationLevel1;

    // 각 암종별 수정층후 합계 계산
    const rockSums = {
      매립토: 0,
      풍화암: 0,
      연암: 0,
    };

    sections.forEach((section) => {
      section.rows.forEach((row) => {
        if (row.rockType in rockSums) {
          rockSums[row.rockType as keyof typeof rockSums] +=
            row.modifiedThickness;
        }
      });
    });

    const totalModifiedThickness =
      rockSums.매립토 + rockSums.풍화암 + rockSums.연암;

    return {
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
      isValid:
        Math.abs(totalModifiedThickness - excavationDepth) < 0.01 &&
        Math.abs(rockSums.매립토 - rockThickness.매립토) < 0.01 &&
        Math.abs(rockSums.풍화암 - rockThickness.풍화암) < 0.01 &&
        Math.abs(rockSums.연암 - rockThickness.연암) < 0.01,
    };
  }, [
    rockThickness,
    originalGroundLevel,
    excavationLevel,
    sExcavationLevel1,
    terrainType,
    sections,
  ]);

  if (!validationData) return null;

  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
      <h3 className="font-bold text-sm mb-3">수정층후 검증</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-medium mb-2">원본 층후</h4>
          <div className="space-y-1">
            <p>매립토: {validationData.originalThickness.매립토.toFixed(3)}m</p>
            <p>풍화암: {validationData.originalThickness.풍화암.toFixed(3)}m</p>
            <p>연암: {validationData.originalThickness.연암.toFixed(3)}m</p>
            <p className="font-bold">
              합계: {validationData.originalThickness.total.toFixed(3)}m
            </p>
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-2">수정층후 합계</h4>
          <div className="space-y-1">
            <p>매립토: {validationData.modifiedThickness.매립토.toFixed(3)}m</p>
            <p>풍화암: {validationData.modifiedThickness.풍화암.toFixed(3)}m</p>
            <p>연암: {validationData.modifiedThickness.연암.toFixed(3)}m</p>
            <p className="font-bold">
              합계: {validationData.modifiedThickness.total.toFixed(3)}m
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3 text-sm">
        <p>굴착길이: {validationData.excavationDepth.toFixed(3)}m</p>
        <p
          className={`font-bold ${
            validationData.isValid ? 'text-green-600' : 'text-red-600'
          }`}
        >
          검증 결과: {validationData.isValid ? '✓ 일치' : '✗ 불일치'}
        </p>
      </div>
    </div>
  );
}
