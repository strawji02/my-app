'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/common/ProgressBar';
import useEarthworkStore from '@/store/earthworkStore';

export default function ResultPage() {
  const router = useRouter();
  const {
    groundLevelData,
    geologicalData,
    calculationType,
    calculationResults,
    setCurrentStep,
    completedSteps,
    resetAll,
  } = useEarthworkStore();

  useEffect(() => {
    setCurrentStep(4);

    // 이전 단계가 완료되지 않았으면 리다이렉트
    if (!completedSteps.includes(3) || !groundLevelData || !geologicalData) {
      router.push('/upload');
    }
  }, [completedSteps, groundLevelData, geologicalData, router, setCurrentStep]);

  const handleBack = () => {
    router.push('/excavation');
  };

  const handleNewCalculation = () => {
    resetAll();
    router.push('/upload');
  };

  if (!groundLevelData || !geologicalData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ProgressBar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">최종 견적서</h1>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">계산 결과 요약</h2>

            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-medium text-gray-700 mb-2">기본 정보</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">평균지반고:</span>
                    <span className="ml-2 font-medium">
                      {groundLevelData.average.toFixed(2)}m
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">계산 타입:</span>
                    <span className="ml-2 font-medium">{calculationType}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">데이터 개수:</span>
                    <span className="ml-2 font-medium">
                      {groundLevelData.values.length}개
                    </span>
                  </div>
                </div>
              </div>

              {calculationResults?.modifiedThickness && (
                <div className="border-b pb-4">
                  <h3 className="font-medium text-gray-700 mb-2">
                    수정층후 계산 결과
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">매립토:</span>
                      <span className="ml-2 font-medium">
                        {calculationResults.modifiedThickness.modified.landfill.toFixed(
                          3
                        )}
                        m
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">풍화암:</span>
                      <span className="ml-2 font-medium">
                        {calculationResults.modifiedThickness.modified.weatheredRock.toFixed(
                          3
                        )}
                        m
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">연암:</span>
                      <span className="ml-2 font-medium">
                        {calculationResults.modifiedThickness.modified.softRock.toFixed(
                          3
                        )}
                        m
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <div className="flex gap-4">
                  <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                    PDF 다운로드
                  </button>
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                    엑셀 내보내기
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={handleBack}
              className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
            >
              이전 단계
            </button>
            <button
              onClick={handleNewCalculation}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              새로운 계산 시작
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
