export default function CalculationGuide() {
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-bold text-sm mb-3">계산식 설명</h3>
      <div className="space-y-2 text-xs text-gray-600">
        <p>• 부피 = 면적 × 수정층후 × (적용율 ÷ 100)</p>
        <p>• 구분 1: 매립토-직 (수정층후 항상 5.0m)</p>
        <p>• 구분 2: 매립토-크 (나머지 매립토)</p>
        <p>• 구분 3: 풍화암-크</p>
        <p>• 구분 4: 연암-크 (마사토)</p>
        <p>• 구분 5: 연암-크 (일반, S구간만)</p>
      </div>
    </div>
  );
}
