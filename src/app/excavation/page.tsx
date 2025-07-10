'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/common/ProgressBar';
import ExcavationAndLoading from '@/components/ExcavationAndLoading';
import useEarthworkStore from '@/store/earthworkStore';

export default function ExcavationPage() {
  const router = useRouter();
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

        <div className="max-w-7xl mx-auto">
          <ExcavationAndLoading
            modifiedThickness={
              calculationResults?.modifiedThickness || undefined
            }
          />

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
