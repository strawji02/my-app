import { GroundLevelData, GeologicalData } from '@/types/earthwork';

interface RawDataDisplayProps {
  groundLevelData: GroundLevelData;
  geologicalData: GeologicalData;
}

export default function RawDataDisplay({
  groundLevelData,
  geologicalData,
}: RawDataDisplayProps) {
  // 평균지반고 데이터를 2차원 배열로 변환
  const groundLevelGrid = groundLevelData.rawData.map((row) =>
    Object.values(row).map((value) => value as string | number)
  );

  return (
    <div className="space-y-8">
      {/* 평균지반고 원본 데이터 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">평균지반고 원본 데이터</h3>
        <div className="mb-2 text-sm text-gray-600">
          행렬 크기: {groundLevelGrid.length} ×{' '}
          {groundLevelGrid[0]?.length || 0}
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full border-collapse">
            <tbody>
              {groundLevelGrid.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((value, colIndex) => (
                    <td
                      key={colIndex}
                      className="border border-gray-300 px-3 py-2 text-sm text-center text-gray-900 hover:bg-gray-50"
                    >
                      {typeof value === 'number' ? value.toFixed(2) : value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 지질주상도 원본 데이터 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">지질주상도 원본 데이터</h3>
        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {Object.keys(geologicalData.rawData[0] || {}).map((header) => (
                  <th
                    key={header}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {geologicalData.rawData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {Object.values(row).map((value, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-4 py-2 whitespace-nowrap text-sm text-gray-900"
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
