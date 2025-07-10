'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/common/ProgressBar';
import ExcavationAndLoading from '@/components/ExcavationAndLoading';
import ExcavationCalculator from '@/components/ExcavationCalculator';
import { ExcavationData } from '@/types/earthwork';
import useEarthworkStore from '@/store/earthworkStore';

export default function ExcavationPage() {
  const router = useRouter();
  const [excavationData, setExcavationData] = useState<ExcavationData[]>([]);

  const {
    groundLevelData,
    geologicalData,
    calculationResults,
    setCurrentStep,
    markStepComplete,
    completedSteps,
  } = useEarthworkStore();

  useEffect(() => {
    setCurrentStep(3);

    // 이전 단계가 완료되지 않았으면 리다이렉트
    if (!completedSteps.includes(2) || !groundLevelData || !geologicalData) {
      router.push('/upload');
    }
  }, [completedSteps, groundLevelData, geologicalData, router, setCurrentStep]);

  const handleContinue = () => {
    markStepComplete(3);
    router.push('/result');
  };

  const handleBack = () => {
    router.push('/data-review');
  };

  const handleExcavationUpdate = (data: ExcavationData[]) => {
    setExcavationData(data);
  };

  if (!groundLevelData || !geologicalData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ProgressBar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          터파기 및 상차 계산
        </h1>

        <div className="max-w-7xl mx-auto space-y-8">
          {/* 줄파기 - 토공량 계산 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">줄파기</h3>
            <ExcavationCalculator
              onCalculationUpdate={handleExcavationUpdate}
            />

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
            <ExcavationAndLoading
              rockThickness={
                calculationResults?.modifiedThickness
                  ? {
                      매립토:
                        calculationResults.modifiedThickness.modified.landfill,
                      풍화암:
                        calculationResults.modifiedThickness.modified
                          .weatheredRock,
                      연암: calculationResults.modifiedThickness.modified
                        .softRock,
                    }
                  : {
                      매립토: 21.475,
                      풍화암: 0.75,
                      연암: 7.8,
                    }
              }
            />
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={handleBack}
              className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
            >
              이전 단계
            </button>
            <button
              onClick={handleContinue}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              다음 단계로
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
