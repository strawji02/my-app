'use client';

import { useEffect } from 'react';
import { useManholeStore } from '@/store/manholeStore';
import ManholeHeader from '@/components/manhole/ManholeHeader';
import ImageUploader from '@/components/manhole/ImageUploader';
import ManholeInputTable from '@/components/manhole/ManholeInputTable';
import ManholeCalculationTable from '@/components/manhole/ManholeCalculationTable';

export default function ManholePage() {
  const { calculateResults, inputData } = useManholeStore();

  // 입력값이 변경될 때마다 결과 재계산
  useEffect(() => {
    calculateResults();
  }, [inputData, calculateResults]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">맨홀 수량 계산</h1>
        
        <div className="space-y-8">
          {/* 공종, 규격, 단위 입력 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">1. 공종, 규격, 단위 설정</h2>
            <ManholeHeader />
          </div>

          {/* 이미지 업로드 및 제원 입력 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">2. 이미지 추가 (도면 삽입) 및 3. 제원 입력</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 이미지 업로드 - 좌측 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">도면 이미지</h3>
                <ImageUploader />
              </div>
              
              {/* 제원 입력 - 우측 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">제원 입력</h3>
                <ManholeInputTable />
              </div>
            </div>
          </div>

          {/* 계산 결과 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">3. 산출 근거</h2>
            <ManholeCalculationTable />
          </div>
        </div>
      </div>
    </div>
  );
}