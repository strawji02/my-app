'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useEarthworkStore from '@/store/earthworkStore';

export default function Home() {
  const router = useRouter();
  const { hasStoredData, completedSteps, resetAll } = useEarthworkStore();
  const hasData = hasStoredData();

  const handleStartNew = () => {
    resetAll();
    router.push('/upload');
  };

  const handleContinue = () => {
    // 마지막으로 완료한 단계로 이동
    const lastCompletedStep = Math.max(...completedSteps, 0);
    switch (lastCompletedStep) {
      case 0:
        router.push('/upload');
        break;
      case 1:
        router.push('/data-review');
        break;
      case 2:
        router.push('/excavation');
        break;
      case 3:
        router.push('/result');
        break;
      default:
        router.push('/upload');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          토공 및 흙막이 견적서 산출 시스템
        </h1>

        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">시작하기</h2>
          <p className="text-gray-600 mb-6">
            CSV 파일을 업로드하여 평균지반고와 지질주상도 데이터를 분석하고
            견적서를 산출합니다.
          </p>

          {hasData ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium mb-2">
                  저장된 진행 상황이 있습니다
                </p>
                <p className="text-blue-600 text-sm">
                  완료된 단계: {completedSteps.length}개
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleContinue}
                  className="flex-1 bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  이어서 진행하기
                </button>
                <button
                  onClick={handleStartNew}
                  className="flex-1 bg-gray-600 text-white text-center py-3 px-4 rounded-md hover:bg-gray-700 transition-colors"
                >
                  새로 시작하기
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/upload"
              className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              견적서 산출 시작
            </Link>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-3">진행 단계</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-xs">
                  1
                </span>
                데이터 업로드 (CSV 파일)
              </div>
              <div className="flex items-center">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-xs">
                  2
                </span>
                데이터 검토 및 수정
              </div>
              <div className="flex items-center">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-xs">
                  3
                </span>
                터파기 및 상차 계산
              </div>
              <div className="flex items-center">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-xs">
                  4
                </span>
                최종 견적서 확인
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-3">샘플 파일 다운로드</h3>
            <div className="space-y-2">
              <a
                href="/sample_ground_level.csv"
                download
                className="block text-blue-600 hover:text-blue-800 underline"
              >
                📄 평균지반고 샘플 CSV
              </a>
              <a
                href="/sample_geological.csv"
                download
                className="block text-blue-600 hover:text-blue-800 underline"
              >
                📄 지질주상도 샘플 CSV
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
