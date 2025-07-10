'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/common/ProgressBar';
import DataReview from '@/components/data-review/DataReview';
import useEarthworkStore from '@/store/earthworkStore';

export default function DataReviewPage() {
  const router = useRouter();
  const {
    groundLevelData,
    geologicalData,
    calculationType,
    setCurrentStep,
    markStepComplete,
  } = useEarthworkStore();

  useEffect(() => {
    setCurrentStep(2);

    // 데이터가 없으면 업로드 페이지로 리다이렉트
    if (!groundLevelData || !geologicalData) {
      router.push('/upload');
    }
  }, [groundLevelData, geologicalData, router, setCurrentStep]);

  const handleContinue = () => {
    markStepComplete(2);
    router.push('/excavation');
  };

  const handleBack = () => {
    router.push('/upload');
  };

  if (!groundLevelData || !geologicalData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ProgressBar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">데이터 검토</h1>

        <div className="max-w-7xl mx-auto">
          <DataReview
            groundLevelData={groundLevelData}
            geologicalData={geologicalData}
            calculationType={calculationType}
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
