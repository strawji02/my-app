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
          {/* 제목 및 단위 입력 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">1. 제목 및 단위 설정</h2>
            <ManholeHeader />
          </div>

          {/* 이미지 업로드 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">2. 이미지 추가 (도면 삽입)</h2>
            <ImageUploader />
          </div>

          {/* 제원 입력 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">3. 제원 입력</h2>
            <ManholeInputTable />
          </div>

          {/* 계산 결과 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">4. 테이블에 입력 및 개산된 내용으로 엑셀 산출식과 동일하게 계산 및 계산식 표시</h2>
            <ManholeCalculationTable />
          </div>
        </div>
      </div>
    </div>
  );
}