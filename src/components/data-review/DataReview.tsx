import { useEffect, useMemo } from 'react';
import {
  GroundLevelData,
  GeologicalData,
  CalculationType,
} from '@/types/earthwork';
import useEarthworkStore from '@/store/earthworkStore';
import SummaryInfo from './SummaryInfo';
import GeologicalResults from './GeologicalResults';
import ModifiedThickness from './ModifiedThickness';
import RawDataDisplay from './RawDataDisplay';

interface DataReviewProps {
  groundLevelData: GroundLevelData;
  geologicalData: GeologicalData;
  calculationType: CalculationType;
}

export default function DataReview({
  groundLevelData,
  geologicalData,
  calculationType,
}: DataReviewProps) {
  const { setCalculationResults } = useEarthworkStore();

  // TYPE별 계산 컬럼 정의
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

  // 계산 결과를 store에 저장
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
  }, [
    columnAverages,
    modifiedThickness,
    calculationType,
    setCalculationResults,
  ]);

  return (
    <div className="space-y-8">
      {/* 요약 정보 */}
      <SummaryInfo
        groundLevelData={groundLevelData}
        calculationType={calculationType}
      />

      {/* 지질주상도 계산 결과 */}
      <GeologicalResults
        geologicalResults={geologicalResults}
        columnAverages={columnAverages}
        activeColumns={activeColumns}
        calculationType={calculationType}
      />

      {/* 수정 층후 계산 결과 */}
      <ModifiedThickness modifiedThickness={modifiedThickness} />

      {/* 원본 데이터 표시 */}
      <RawDataDisplay
        groundLevelData={groundLevelData}
        geologicalData={geologicalData}
      />
    </div>
  );
}
