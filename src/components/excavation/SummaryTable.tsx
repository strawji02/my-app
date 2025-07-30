import { useMemo } from 'react';
import useExcavationStore from '@/store/excavationStore';

export default function SummaryTable() {
  const { sections } = useExcavationStore();

  // P 구간과 S 구간을 분리
  const pSections = useMemo(() => {
    return sections.filter(
      (section) => section.type === 'p' && section.isInputComplete
    );
  }, [sections]);

  const sSections = useMemo(() => {
    return sections.filter(
      (section) => section.type === 's' && section.isInputComplete
    );
  }, [sections]);

  // 암종-작업타입-항목별 합계 계산
  const calculateSummary = (filteredSections: typeof sections) => {
    const summary: Record<
      string,
      {
        area: number;
        volume: number;
        count: number;
      }
    > = {};

    // 전체 면적 합계
    const uniqueAreas = new Map<string, number>();

    filteredSections.forEach((section) => {
      // 각 구간의 면적 (중복 제거)
      if (section.rows.length > 0) {
        uniqueAreas.set(section.name, section.area);
      }

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
      });
    });

    const totalArea = Array.from(uniqueAreas.values()).reduce(
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

        // 항목 순서: 발파공법별 정렬
        return a.item.localeCompare(b.item);
      });

    return {
      totalArea,
      summary: sortedSummary,
    };
  };

  const pSummaryData = useMemo(() => calculateSummary(pSections), [pSections]);
  const sSummaryData = useMemo(() => calculateSummary(sSections), [sSections]);

  // 전체 부피 합계
  const pTotalVolume = useMemo(() => {
    return pSummaryData.summary.reduce((sum, item) => sum + item.volume, 0);
  }, [pSummaryData.summary]);

  const sTotalVolume = useMemo(() => {
    return sSummaryData.summary.reduce((sum, item) => sum + item.volume, 0);
  }, [sSummaryData.summary]);

  const hasData = pSections.length > 0 || sSections.length > 0;

  if (!hasData) return null;

  return (
    <div className="mt-8 border-2 border-gray-400 rounded-lg p-4 bg-gray-50">
      <h4 className="font-bold text-lg mb-4">합계표</h4>

      {/* P 구간 합계 */}
      {pSections.length > 0 && (
        <div className="mb-6">
          <h5 className="font-semibold text-md mb-3">P (평면) 구간</h5>

          {/* 면적 합계 */}
          <div className="mb-3 p-3 bg-blue-100 rounded">
            <p className="font-semibold">
              P 구간 총 면적:{' '}
              <span className="text-blue-700">
                {pSummaryData.totalArea.toFixed(2)} m²
              </span>
            </p>
          </div>

          {/* 항목별 합계 테이블 */}
          <table className="w-full border-collapse text-sm mb-3">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 px-3 py-2">암종</th>
                <th className="border border-gray-400 px-3 py-2">작업</th>
                <th className="border border-gray-400 px-3 py-2">발파공법</th>
                <th className="border border-gray-400 px-3 py-2">면적(m²)</th>
                <th className="border border-gray-400 px-3 py-2">부피(m³)</th>
              </tr>
            </thead>
            <tbody>
              {pSummaryData.summary.map((item, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="border border-gray-400 px-3 py-2">
                    {item.rockType}
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-center">
                    {item.workType}
                  </td>
                  <td className="border border-gray-400 px-3 py-2">
                    {item.item}
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-right">
                    {item.area.toFixed(2)}
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-right font-semibold">
                    {item.volume.toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr className="bg-yellow-200 font-bold">
                <td
                  colSpan={4}
                  className="border border-gray-400 px-3 py-2 text-right"
                >
                  P 구간 합계
                </td>
                <td className="border border-gray-400 px-3 py-2 text-right text-blue-700">
                  {pTotalVolume.toLocaleString()} m³
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* S 구간 합계 */}
      {sSections.length > 0 && (
        <div className="mb-6">
          <h5 className="font-semibold text-md mb-3">S (사면) 구간</h5>

          {/* 면적 합계 */}
          <div className="mb-3 p-3 bg-green-100 rounded">
            <p className="font-semibold">
              S 구간 총 면적:{' '}
              <span className="text-green-700">
                {sSummaryData.totalArea.toFixed(2)} m²
              </span>
            </p>
          </div>

          {/* 항목별 합계 테이블 */}
          <table className="w-full border-collapse text-sm mb-3">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 px-3 py-2">암종</th>
                <th className="border border-gray-400 px-3 py-2">작업</th>
                <th className="border border-gray-400 px-3 py-2">발파공법</th>
                <th className="border border-gray-400 px-3 py-2">면적(m²)</th>
                <th className="border border-gray-400 px-3 py-2">부피(m³)</th>
              </tr>
            </thead>
            <tbody>
              {sSummaryData.summary.map((item, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="border border-gray-400 px-3 py-2">
                    {item.rockType}
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-center">
                    {item.workType}
                  </td>
                  <td className="border border-gray-400 px-3 py-2">
                    {item.item}
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-right">
                    {item.area.toFixed(2)}
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-right font-semibold">
                    {item.volume.toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr className="bg-yellow-200 font-bold">
                <td
                  colSpan={4}
                  className="border border-gray-400 px-3 py-2 text-right"
                >
                  S 구간 합계
                </td>
                <td className="border border-gray-400 px-3 py-2 text-right text-green-700">
                  {sTotalVolume.toLocaleString()} m³
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 전체 총 합계 */}
      <div className="p-4 bg-yellow-100 rounded mt-4">
        <p className="text-lg font-bold text-center">
          전체 총 합계:{' '}
          <span className="text-xl text-red-700">
            {(pTotalVolume + sTotalVolume).toLocaleString()} m³
          </span>
        </p>
      </div>

      {/* 설명 */}
      <div className="mt-3 text-xs text-gray-600">
        <p>※ 면적은 각 구간의 면적을 합산한 값입니다.</p>
        <p>※ 부피는 각 조합의 모든 구간 부피를 합산한 값입니다.</p>
      </div>
    </div>
  );
}
