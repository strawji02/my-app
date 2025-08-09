import { useManholeStore } from '@/store/manholeStore';

export default function ManholeCalculationTable() {
  const { calculationResult, header, inputData } = useManholeStore();

  if (!calculationResult) {
    return (
      <div className="text-center py-8 text-gray-500">
        제원을 입력하면 자동으로 계산됩니다.
      </div>
    );
  }

  // 계산식 표시를 위한 헬퍼 함수
  const toMeter = (mm: number) => (mm / 1000).toFixed(3);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{header.title} {header.specification}</h3>
        <span className="text-sm text-gray-600">단위: {header.unit}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                공종
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                규격
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                단위
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                수량
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                산출근거
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(calculationResult).map(([key, item], index) => (
              <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.공종}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.규격}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.단위}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {item.수량}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {getCalculationFormula(key, inputData)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 총계 섹션 */}
      <div className="border-t pt-4">
        <div className="flex justify-end">
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">전체 공종 수</p>
            <p className="text-2xl font-bold text-gray-900">14개 공종</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 각 공종별 계산식을 반환하는 함수
function getCalculationFormula(key: string, inputData: any): string {
  const toM = (mm: number) => (mm / 1000).toFixed(3);
  
  switch (key) {
    case '터파기':
      return `${toM(inputData.WIDE_A)} × ${toM(inputData.WIDE_B)} × ${toM(inputData.H1)}`;
    case '잔토처리':
      return '터파기 × 0.1';
    case '되메우기':
      return '터파기 × 0.8';
    case '사토처리':
      return '터파기 × 0.2';
    case '기초콘크리트타설':
      return `${toM(inputData.WIDE_A)} × ${toM(inputData.WIDE_B)} × ${toM(inputData.t6)}`;
    case '바닥슬래브타설':
      return `π × (${toM(inputData.D/2 + inputData.t5)})² × ${toM(inputData.t5)}`;
    case '벽체타설':
      return `π × ${toM(inputData.D + inputData.t3)} × ${toM(inputData.t3)} × ${toM(inputData.H)}`;
    case '상부슬래브타설':
      return `π × (${toM(inputData.D/2 + inputData.t1)})² × ${toM(inputData.t1)}`;
    case '거푸집':
      return `π × ${toM(inputData.D)} × ${toM(inputData.H)} × 2`;
    case '철근':
      return '(터파기 × 0.1) × 7.85';
    case '맨홀뚜껑':
      return '1개소';
    case '접속관연결':
      return '유입구 + 유출구';
    case '방수':
      return `π × ${toM(inputData.D)} × ${toM(inputData.H)}`;
    case '기초잡석':
      return `${toM(inputData.WIDE_A)} × ${toM(inputData.WIDE_B)} × 0.2`;
    default:
      return '-';
  }
}