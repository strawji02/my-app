import { useState, useEffect, useMemo } from 'react';
import {
  GroundLevelData,
  GeologicalData,
  CalculationType,
  ExcavationData,
} from '@/types/earthwork';
import ExcavationCalculator from '@/components/ExcavationCalculator';
import ExcavationAndLoading from '@/components/ExcavationAndLoading';
import useEarthworkStore from '@/store/earthworkStore';

interface DataDisplayProps {
  groundLevelData: GroundLevelData;
  geologicalData: GeologicalData;
  calculationType: CalculationType;
}

export default function DataDisplay({
  groundLevelData,
  geologicalData,
  calculationType,
}: DataDisplayProps) {
  const [excavationData, setExcavationData] = useState<ExcavationData[]>([]);
  const { setCalculationResults } = useEarthworkStore();

  // 굴착 계산 업데이트 핸들러
  const handleExcavationUpdate = (data: ExcavationData[]) => {
    setExcavationData(data);
  };

  // TYPE별 계산 컬럼 정의 - 새로운 형식에 맞게 수정
  const TYPE1_COLUMNS = ['매립층', '풍화토', '풍화암', '연암'];
  const TYPE2_COLUMNS = ['토사', '풍화암', '연암']; // 토사 = 매립층 + 풍화토

  // 지질주상도 계산
  const calculateGeological = () => {
    const results: Record<string, Record<string, number>> = {};
    const columns = calculationType === 'TYPE1' ? TYPE1_COLUMNS : TYPE2_COLUMNS;

    geologicalData.rawData.forEach((row) => {
      const rowKey = row['구분'] || 'Unknown';
      results[rowKey as string] = {};

      // 지반고 값 추가
      results[rowKey as string]['지반고'] =
        parseFloat(row['지반고'] as string) || 0;

      // 각 컬럼별 값 계산
      columns.forEach((col) => {
        let value = 0;

        if (calculationType === 'TYPE2' && col === '토사') {
          // TYPE2의 경우 토사 = 매립층 + 풍화토
          value =
            (parseFloat(row['매립층'] as string) || 0) +
            (parseFloat(row['풍화토'] as string) || 0);
        } else {
          value = parseFloat(row[col] as string) || 0;
        }

        results[rowKey as string][col] = value;
      });

      // 행 합계 계산
      const rowSum = Object.values(results[rowKey as string])
        .filter((_, index) => index > 0) // 지반고 제외
        .reduce((a, b) => a + b, 0);
      results[rowKey as string]['합계'] = rowSum;
    });

    return results;
  };

  // 각 열의 평균 계산
  const calculateColumnAverages = (
    results: Record<string, Record<string, number>>
  ) => {
    const columns = calculationType === 'TYPE1' ? TYPE1_COLUMNS : TYPE2_COLUMNS;
    const averages: Record<string, number> = {};
    const rowCount = Object.keys(results).length;

    // 지반고 평균
    const groundLevelSum = Object.values(results).reduce(
      (acc, row) => acc + (row['지반고'] || 0),
      0
    );
    averages['지반고'] = rowCount > 0 ? groundLevelSum / rowCount : 0;

    columns.forEach((col) => {
      const sum = Object.values(results).reduce(
        (acc, row) => acc + (row[col] || 0),
        0
      );
      averages[col] = rowCount > 0 ? sum / rowCount : 0;
    });

    // 합계의 평균도 계산
    const totalSum = Object.values(results).reduce(
      (acc, row) => acc + (row['합계'] || 0),
      0
    );
    averages['합계'] = rowCount > 0 ? totalSum / rowCount : 0;

    return averages;
  };

  // 수정 층후 계산
  const calculateModifiedThickness = (
    columnAverages: Record<string, number>
  ) => {
    const avgGroundLevel = groundLevelData.average; // 평균지반고
    const geoGroundLevel = columnAverages['지반고']; // 주상도 평균층후의 지반고

    // 매립토 계산
    let landfillSoil = 0;
    if (calculationType === 'TYPE1') {
      landfillSoil =
        (columnAverages['매립층'] || 0) + (columnAverages['풍화토'] || 0);
    } else {
      landfillSoil = columnAverages['토사'] || 0;
    }

    // 수정 층후 계산
    const modifiedLandfill = avgGroundLevel - geoGroundLevel + landfillSoil;
    const weatheredRock = columnAverages['풍화암'] || 0;
    const softRock = columnAverages['연암'] || 0;

    // 누계 계산
    const cumulative = {
      landfill: modifiedLandfill,
      weatheredRock: modifiedLandfill + weatheredRock,
      softRock: modifiedLandfill + weatheredRock + softRock,
    };

    return {
      originalAverage: {
        groundLevel: geoGroundLevel,
        landfill: landfillSoil,
        weatheredRock: weatheredRock,
        softRock: softRock,
      },
      modified: {
        groundLevel: avgGroundLevel,
        landfill: modifiedLandfill,
        weatheredRock: weatheredRock,
        softRock: softRock,
        cumulative: cumulative,
      },
    };
  };

  const geologicalResults = useMemo(
    () => calculateGeological(),
    [geologicalData.rawData, calculationType]
  );

  const columnAverages = useMemo(
    () => calculateColumnAverages(geologicalResults),
    [geologicalResults]
  );

  const modifiedThickness = useMemo(
    () => calculateModifiedThickness(columnAverages),
    [columnAverages, groundLevelData.average]
  );

  const activeColumns =
    calculationType === 'TYPE1' ? TYPE1_COLUMNS : TYPE2_COLUMNS;

  // 평균지반고 데이터를 2차원 배열로 변환
  const groundLevelGrid = groundLevelData.rawData.map((row) =>
    Object.values(row).map((value) => value as string | number)
  );

  // 계산 결과를 store에 저장 - 실제 데이터가 변경될 때만 실행
  useEffect(() => {
    // columnAverages가 비어있으면 실행하지 않음
    if (Object.keys(columnAverages).length === 0) return;

    // 평균층후 데이터를 store 형식에 맞게 변환
    const averageThickness = {
      매립토:
        calculationType === 'TYPE1'
          ? (columnAverages['매립층'] || 0) + (columnAverages['풍화토'] || 0)
          : columnAverages['토사'] || 0,
      풍화토: calculationType === 'TYPE1' ? columnAverages['풍화토'] || 0 : 0,
      풍화암: columnAverages['풍화암'] || 0,
      연암: columnAverages['연암'] || 0,
      경암: 0, // 경암은 현재 데이터에 없으므로 0으로 설정
    };

    setCalculationResults({
      averageThickness,
      modifiedThickness: modifiedThickness,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    groundLevelData.average,
    geologicalData.rawData.length,
    calculationType,
    setCalculationResults,
  ]);

  return (
    <div className="space-y-8">
      {/* 요약 정보 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">
          견적서 산출 결과
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-700">평균지반고</h3>
            <p className="text-3xl font-bold text-blue-600">
              {groundLevelData.average.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">
              총 {groundLevelData.values.length}개 데이터
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">계산 타입</h3>
            <p className="text-3xl font-bold text-green-600">
              {calculationType}
            </p>
            <p className="text-sm text-gray-600">
              {calculationType === 'TYPE1' ? '4개 암종 분류' : '3개 암종 분류'}
            </p>
          </div>
        </div>
      </div>

      {/* 지질주상도 계산 결과 */}
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

      {/* 수정 층후 계산 결과 */}
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
                    EL{' '}
                    {modifiedThickness.originalAverage.groundLevel.toFixed(2)}
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

      {/* 줄파기 - 토공량 계산 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">줄파기</h3>
        <ExcavationCalculator onCalculationUpdate={handleExcavationUpdate} />

        {/* 토공 관련 참고 정보 */}
        {excavationData.length > 0 && (
          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">토공 견적 참고</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-1">단위중량 적용</p>
                <ul className="space-y-1 text-gray-700">
                  <li>• 토사: 1.8 ~ 2.0 ton/m³</li>
                  <li>• 풍화암: 2.2 ~ 2.4 ton/m³</li>
                  <li>• 연암: 2.5 ~ 2.6 ton/m³</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">할증률</p>
                <ul className="space-y-1 text-gray-700">
                  <li>• 토사 굴착: 1.2 ~ 1.3</li>
                  <li>• 암반 굴착: 1.3 ~ 1.5</li>
                  <li>• 운반거리별 추가 할증 적용</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 터파기 및 상차 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">터파기 및 상차</h3>
        <ExcavationAndLoading
          rockThickness={{
            매립토: modifiedThickness.modified.landfill,
            풍화암: modifiedThickness.modified.weatheredRock,
            연암: modifiedThickness.modified.softRock,
          }}
        />
      </div>

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
