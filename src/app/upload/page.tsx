'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CSVUploader from '@/components/CSVUploader';
import ProgressBar from '@/components/common/ProgressBar';
import useEarthworkStore from '@/store/earthworkStore';
import { CSVRow, CalculationType } from '@/types/earthwork';

export default function UploadPage() {
  const router = useRouter();
  const {
    groundLevelData,
    geologicalData,
    calculationType,
    setGroundLevelData,
    setGeologicalData,
    setCalculationType,
    markStepComplete,
    setCurrentStep,
    hasStoredData,
    resetAll,
  } = useEarthworkStore();

  const [showExistingDataPrompt, setShowExistingDataPrompt] = useState(false);

  useEffect(() => {
    setCurrentStep(1);
    // localStorage에 데이터가 있는지 확인
    if (hasStoredData()) {
      setShowExistingDataPrompt(true);
    }
  }, []);

  const handleGroundLevelUpload = (data: CSVRow[]) => {
    // 평균지반고 데이터 처리
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

  const handleContinue = () => {
    if (groundLevelData && geologicalData) {
      markStepComplete(1);
      router.push('/data-review');
    }
  };

  const handleUseExistingData = () => {
    setShowExistingDataPrompt(false);
    markStepComplete(1);
    router.push('/data-review');
  };

  const handleUploadNewData = () => {
    resetAll();
    setShowExistingDataPrompt(false);
  };

  const isReadyToContinue = groundLevelData && geologicalData;

  return (
    <div className="min-h-screen bg-gray-100">
      <ProgressBar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">데이터 업로드</h1>

        {/* 기존 데이터 사용 여부 프롬프트 */}
        {showExistingDataPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                저장된 데이터가 있습니다
              </h2>
              <p className="text-gray-600 mb-6">
                이전에 업로드한 데이터가 있습니다. 기존 데이터를
                사용하시겠습니까?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleUseExistingData}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  기존 데이터 사용
                </button>
                <button
                  onClick={handleUploadNewData}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  새로 업로드
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-6">
          {/* 평균지반고 데이터 업로드 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              1. 평균지반고 데이터 업로드
              {groundLevelData && (
                <span className="ml-2 text-green-600">✓</span>
              )}
            </h2>
            <CSVUploader onUpload={handleGroundLevelUpload} hasHeader={false} />
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
              {geologicalData && <span className="ml-2 text-green-600">✓</span>}
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

          {/* 다음 단계 버튼 */}
          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={!isReadyToContinue}
              className={`px-8 py-3 rounded-md font-medium transition-colors ${
                isReadyToContinue
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              다음 단계로
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
