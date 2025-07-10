interface ModifiedThicknessData {
  originalAverage: {
    groundLevel: number;
    landfill: number;
    weatheredRock: number;
    softRock: number;
  };
  modified: {
    groundLevel: number;
    landfill: number;
    weatheredRock: number;
    softRock: number;
    cumulative: {
      landfill: number;
      weatheredRock: number;
      softRock: number;
    };
  };
}

interface ModifiedThicknessProps {
  modifiedThickness: ModifiedThicknessData;
}

export default function ModifiedThickness({
  modifiedThickness,
}: ModifiedThicknessProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">수정 층후 계산</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 주상도 평균층후 */}
        <div>
          <h4 className="text-lg font-semibold mb-3">주상도 평균층후</h4>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  구분
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  값
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 text-sm text-gray-900">지반고</td>
                <td className="px-4 py-2 text-sm text-center text-gray-900">
                  EL {modifiedThickness.originalAverage.groundLevel.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm text-gray-900">매립토</td>
                <td className="px-4 py-2 text-sm text-center text-gray-900">
                  {modifiedThickness.originalAverage.landfill.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm text-gray-900">풍화암</td>
                <td className="px-4 py-2 text-sm text-center text-gray-900">
                  {modifiedThickness.originalAverage.weatheredRock.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm text-gray-900">연암</td>
                <td className="px-4 py-2 text-sm text-center text-gray-900">
                  {modifiedThickness.originalAverage.softRock.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 수정 층후 */}
        <div>
          <h4 className="text-lg font-semibold mb-3">수정 층후</h4>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  구분
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  값
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  누계
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 text-sm text-gray-900">지반고</td>
                <td className="px-4 py-2 text-sm text-center text-gray-900">
                  EL {modifiedThickness.modified.groundLevel.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-sm text-center text-gray-900">
                  -
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm text-gray-900">매립토</td>
                <td className="px-4 py-2 text-sm text-center text-gray-900">
                  {modifiedThickness.modified.landfill.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-sm text-center font-semibold text-gray-900">
                  {modifiedThickness.modified.cumulative.landfill.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm text-gray-900">풍화암</td>
                <td className="px-4 py-2 text-sm text-center text-gray-900">
                  {modifiedThickness.modified.weatheredRock.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-sm text-center font-semibold text-gray-900">
                  {modifiedThickness.modified.cumulative.weatheredRock.toFixed(
                    2
                  )}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm text-gray-900">연암</td>
                <td className="px-4 py-2 text-sm text-center text-gray-900">
                  {modifiedThickness.modified.softRock.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-sm text-center font-semibold text-gray-900">
                  {modifiedThickness.modified.cumulative.softRock.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded">
        <p className="font-semibold mb-1">계산 방법:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            매립토 = (평균지반고 - 주상도평균층후 지반고) + 주상도평균층후
            매립토
          </li>
          <li>풍화암, 연암 = 주상도평균층후 값 사용</li>
          <li>누계 = 각 층의 두께를 순차적으로 합산</li>
        </ul>
      </div>
    </div>
  );
}
