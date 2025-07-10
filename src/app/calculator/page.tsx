'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Calculator() {
  const router = useRouter();

  useEffect(() => {
    // 새로운 페이지 구조로 리다이렉트
    router.replace('/upload');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">리다이렉트 중...</p>
      </div>
    </div>
  );
}
