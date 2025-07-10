import { useMemo } from 'react';
import useExcavationStore from '@/store/excavationStore';

export default function SummaryTable() {
  const { sections, terrainType } = useExcavationStore();

  // 현재 지형에 맞는 섹션만 필터링
  const filteredSections = useMemo(() => {
    return sections.filter((section) => {
      if (terrainType === '평면') {
        return section.type === 'p';
      } else if (terrainType === '사면') {
        return section.type === 's';
      }
      return false;
    });
  }, [sections, terrainType]);

  // 암종-작업타입-항목별 합계 계산
  const summaryData = useMemo(() => {
    const summary: Record<
      string,
      {
        area: number;
        volume: number;
        count: number;
      }
    > = {};

    // 전체 면적 합계
    let totalArea = 0;
    const areaSet = new Set<string>();

    filteredSections.forEach((section) => {
      section.rows.forEach((row) => {
        // 조합 키 생성 (암종-작업타입-항목)
        const key = `${row.rockType}-${row.workType}-${row.item}`;

        if (!summary[key]) {
          summary[key] = {
            area: 0,
            volume: 0,
            count: 0,
          };
        }

        summary[key].area += row.area;
        summary[key].volume += row.volume;
        summary[key].count += 1;

        // 구간별 면적을 Set에 추가 (중복 제거)
        areaSet.add(`${section.name}-${row.area}`);
      });
    });

    // 실제 면적 합계 계산 (구간별로 한 번만)
    const uniqueAreas = new Map<string, number>();
    filteredSections.forEach((section) => {
      // 각 구간의 첫 번째 row의 면적을 사용 (모든 row가 같은 면적을 가짐)
      if (section.rows.length > 0) {
        uniqueAreas.set(section.name, section.rows[0].area);
      }
    });

    totalArea = Array.from(uniqueAreas.values()).reduce(
      (sum, area) => sum + area,
      0
    );

    // 정렬을 위해 배열로 변환
    const sortedSummary = Object.entries(summary)
      .map(([key, value]) => {
        const [rockType, workType, item] = key.split('-');
        return {
          rockType,
          workType,
          item,
          ...value,
        };
      })
      .sort((a, b) => {
        // 암종 순서: 매립토 > 풍화암 > 연암
        const rockOrder = ['매립토', '풍화암', '연암'];
        const rockCompare =
          rockOrder.indexOf(a.rockType) - rockOrder.indexOf(b.rockType);
        if (rockCompare !== 0) return rockCompare;

        // 작업타입 순서: 직 > 크
        const workCompare = a.workType.localeCompare(b.workType);
        if (workCompare !== 0) return workCompare;

        // 항목 순서: 일반 > 마사토
        return a.item.localeCompare(b.item);
      });

    return {
      totalArea,
      summary: sortedSummary,
    };
  }, [filteredSections]);

  // 전체 부피 합계
  const totalVolume = useMemo(() => {
    return summaryData.summary.reduce((sum, item) => sum + item.volume, 0);
  }, [summaryData.summary]);

  if (filteredSections.length === 0) return null;

  return (
    <div className="mt-8 border-2 border-gray-400 rounded-lg p-4 bg-gray-50">
      <h4 className="font-bold text-lg mb-4">합계표</h4>

      {/* 면적 합계 */}
      <div className="mb-4 p-3 bg-blue-100 rounded">
        <p className="font-semibold">
          {terrainType === '평면' ? 'P' : 'S'} 구간 총 면적:{' '}
          <span className="text-blue-700">
            {summaryData.totalArea.toFixed(2)} m²
          </span>
        </p>
      </div>

      {/* 항목별 합계 테이블 */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-400 px-3 py-2">암종</th>
            <th className="border border-gray-400 px-3 py-2">작업</th>
            <th className="border border-gray-400 px-3 py-2">항목</th>
            <th className="border border-gray-400 px-3 py-2">면적(m²)</th>
            <th className="border border-gray-400 px-3 py-2">부피(m³)</th>
          </tr>
        </thead>
        <tbody>
          {summaryData.summary.map((item, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="border border-gray-400 px-3 py-2">
                {item.rockType}
              </td>
              <td className="border border-gray-400 px-3 py-2 text-center">
                {item.workType}
              </td>
              <td className="border border-gray-400 px-3 py-2">{item.item}</td>
              <td className="border border-gray-400 px-3 py-2 text-right">
                {item.area.toFixed(2)}
              </td>
              <td className="border border-gray-400 px-3 py-2 text-right font-semibold">
                {item.volume.toLocaleString()}
              </td>
            </tr>
          ))}
          {/* 총 합계 행 */}
          <tr className="bg-yellow-200 font-bold">
            <td
              colSpan={4}
              className="border border-gray-400 px-3 py-2 text-right"
            >
              총 합계
            </td>
            <td className="border border-gray-400 px-3 py-2 text-right text-blue-700">
              {totalVolume.toLocaleString()} m³
            </td>
          </tr>
        </tbody>
      </table>

      {/* 설명 */}
      <div className="mt-3 text-xs text-gray-600">
        <p>※ 면적은 동일한 암종-작업-항목 조합의 모든 구간 면적 합계입니다.</p>
        <p>※ 부피는 각 조합의 모든 구간 부피를 합산한 값입니다.</p>
      </div>
    </div>
  );
}
