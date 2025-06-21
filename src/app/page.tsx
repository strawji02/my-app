import Link from 'next/link';

export default function Home() {
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

          <Link
            href="/calculator"
            className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            견적서 산출 시작
          </Link>

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
