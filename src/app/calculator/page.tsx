'use client';

import { useState } from 'react';
import CSVUploader from '@/components/CSVUploader';
import DataDisplay from '@/components/DataDisplay';
import {
  GroundLevelData,
  GeologicalData,
  CSVRow,
  CalculationType,
} from '@/types/earthwork';

export default function Calculator() {
  const [groundLevelData, setGroundLevelData] =
    useState<GroundLevelData | null>(null);
  const [geologicalData, setGeologicalData] = useState<GeologicalData | null>(
    null
  );
  const [calculationType, setCalculationType] =
    useState<CalculationType>('TYPE1');
  const [showResults, setShowResults] = useState(false);

  const handleGroundLevelUpload = (data: CSVRow[]) => {
    // 평균지반고 데이터 처리 - 헤더 없는 순수 숫자 데이터
    const values: number[] = [];
    data.forEach((row) => {
      Object.values(row).forEach((value) => {
        const num = parseFloat(value as string);
        if (!isNaN(num)) {
          values.push(num);
        }
      });
    });

    const average =
      values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    setGroundLevelData({ rawData: data, values, average });
  };

  const handleGeologicalUpload = (data: CSVRow[]) => {
    setGeologicalData({ rawData: data });
  };

  const handleCalculate = () => {
    if (groundLevelData && geologicalData) {
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setGroundLevelData(null);
    setGeologicalData(null);
    setShowResults(false);
    setCalculationType('TYPE1');
  };

  const isReadyToCalculate = groundLevelData && geologicalData;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          토공 및 흙막이 견적서 산출
        </h1>

        {!showResults ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* 평균지반고 데이터 업로드 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                1. 평균지반고 데이터 업로드
                {groundLevelData && (
                  <span className="ml-2 text-green-600">✓</span>
                )}
              </h2>
              <CSVUploader
                onUpload={handleGroundLevelUpload}
                hasHeader={false}
              />
              {groundLevelData && (
                <div className="mt-3 text-sm text-gray-600">
                  {groundLevelData.values.length}개의 데이터 업로드 완료 (평균:{' '}
                  {groundLevelData.average.toFixed(2)})
                </div>
              )}
            </div>

            {/* 지질주상도 데이터 업로드 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                2. 지질주상도 데이터 업로드
                {geologicalData && (
                  <span className="ml-2 text-green-600">✓</span>
                )}
              </h2>
              <CSVUploader onUpload={handleGeologicalUpload} hasHeader={true} />
              {geologicalData && (
                <div className="mt-3 text-sm text-gray-600">
                  {geologicalData.rawData.length}개의 행 데이터 업로드 완료
                </div>
              )}
            </div>

            {/* 계산 타입 선택 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">3. 계산 타입 선택</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="calcType"
                    value="TYPE1"
                    checked={calculationType === 'TYPE1'}
                    onChange={(e) =>
                      setCalculationType(e.target.value as CalculationType)
                    }
                    className="mr-2"
                  />
                  <span className="font-medium">TYPE 1</span>
                  <span className="ml-2 text-gray-600 text-sm">
                    (4개 암: 매립층, 풍화토, 풍화암, 연암)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="calcType"
                    value="TYPE2"
                    checked={calculationType === 'TYPE2'}
                    onChange={(e) =>
                      setCalculationType(e.target.value as CalculationType)
                    }
                    className="mr-2"
                  />
                  <span className="font-medium">TYPE 2</span>
                  <span className="ml-2 text-gray-600 text-sm">
                    (3개 암: 토사[매립층+풍화토], 풍화암, 연암)
                  </span>
                </label>
              </div>
            </div>

            {/* 계산 버튼 */}
            <div className="text-center">
              <button
                onClick={handleCalculate}
                disabled={!isReadyToCalculate}
                className={`px-8 py-3 rounded-md font-medium transition-colors ${
                  isReadyToCalculate
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                견적서 산출하기
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <DataDisplay
              groundLevelData={groundLevelData!}
              geologicalData={geologicalData!}
              calculationType={calculationType}
            />

            <div className="mt-8 text-center">
              <button
                onClick={handleReset}
                className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
              >
                새로운 데이터로 다시 계산
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
