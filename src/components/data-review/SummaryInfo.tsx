import { GroundLevelData, CalculationType } from '@/types/earthwork';

interface SummaryInfoProps {
  groundLevelData: GroundLevelData;
  calculationType: CalculationType;
}

export default function SummaryInfo({
  groundLevelData,
  calculationType,
}: SummaryInfoProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">
        견적서 산출 결과
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-gray-700">평균지반고</h3>
          <p className="text-3xl font-bold text-blue-600">
            {groundLevelData.average.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">
            총 {groundLevelData.values.length}개 데이터
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-700">계산 타입</h3>
          <p className="text-3xl font-bold text-green-600">{calculationType}</p>
          <p className="text-sm text-gray-600">
            {calculationType === 'TYPE1' ? '4개 암종 분류' : '3개 암종 분류'}
          </p>
        </div>
      </div>
    </div>
  );
}
