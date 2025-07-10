interface GeologicalResultsProps {
  geologicalResults: Record<string, Record<string, number>>;
  columnAverages: Record<string, number>;
  activeColumns: string[];
  calculationType: 'TYPE1' | 'TYPE2';
}

export default function GeologicalResults({
  geologicalResults,
  columnAverages,
  activeColumns,
  calculationType,
}: GeologicalResultsProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">지질주상도 계산 결과</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                구분
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                지반고
              </th>
              {activeColumns.map((col) => (
                <th
                  key={col}
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-yellow-50">
                합계
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(geologicalResults).map(([rowKey, values]) => (
              <tr key={rowKey} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {rowKey}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                  {values['지반고']?.toFixed(2) || '0.00'}
                </td>
                {activeColumns.map((col) => (
                  <td
                    key={col}
                    className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900"
                  >
                    {values[col]?.toFixed(2) || '0.00'}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900 bg-yellow-50">
                  {values['합계']?.toFixed(2) || '0.00'}
                </td>
              </tr>
            ))}
            {/* 평균층후 행 추가 */}
            <tr className="bg-blue-50 font-bold">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                평균층후
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-blue-700">
                {columnAverages['지반고']?.toFixed(2) || '0.00'}
              </td>
              {activeColumns.map((col) => (
                <td
                  key={col}
                  className="px-6 py-4 whitespace-nowrap text-sm text-center text-blue-700"
                >
                  {columnAverages[col]?.toFixed(2) || '0.00'}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-blue-700 bg-yellow-100">
                {columnAverages['합계']?.toFixed(2) || '0.00'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {calculationType === 'TYPE2' && (
        <div className="mt-3 text-sm text-gray-600 bg-yellow-50 p-3 rounded">
          ※ TYPE 2에서 토사 = 매립층 + 풍화토
        </div>
      )}
    </div>
  );
}
