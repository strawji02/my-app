import { useManholeStore } from '@/store/manholeStore';
import { ManholeInputData } from '@/types/manhole';

export default function ManholeInputTable() {
  const { inputData, updateInputData } = useManholeStore();

  const handleInputChange = (key: keyof ManholeInputData, value: string) => {
    const numValue = parseFloat(value) || 0;
    updateInputData({ [key]: numValue });
  };

  // 사용자 입력 필드
  const userInputFields: Array<{ key: keyof ManholeInputData; label: string }> = [
    { key: 'd0', label: 'd0' },
    { key: 'd1', label: 'd1' },
    { key: 'd2', label: 'd2' },
    { key: 'd3', label: 'd3' },
    { key: 'd4', label: 'd4' },
    { key: 'D', label: 'D' },
    { key: 't1', label: 't1' },
    { key: 't2', label: 't2' },
    { key: 't3', label: 't3' },
    { key: 't5', label: 't5' },
    { key: 't6', label: 't6' },
    { key: 't7', label: 't7' },
    { key: 'H', label: 'H' },
  ];

  // 자동 계산 필드
  const calculatedFields: Array<{ key: keyof ManholeInputData; label: string; formula: string }> = [
    { key: 'WIDE_A', label: 'WIDE A', formula: 'd2 + (d2 + d3) × 2' },
    { key: 'WIDE_B', label: 'WIDE B', formula: 'H1 × 0.3 × 2 + WIDE A' },
    { key: 't4', label: 't4', formula: 'H - (t1 + t2 + t3)' },
    { key: 'D1', label: 'D1', formula: 'D + d4 × 2' },
    { key: 'D2', label: 'D2', formula: 'D1 + d1 × 2' },
    { key: 'H1', label: 'H1', formula: 'H + t5 + t6 + t7' },
  ];

  return (
    <div className="space-y-4">
      {/* 사용자 입력 섹션 */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">사용자 입력 (단위: mm)</h4>
        <div className="grid grid-cols-2 gap-3">
          {userInputFields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                type="number"
                value={inputData[field.key] || ''}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 자동 계산 섹션 */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">자동 계산 값 (단위: mm)</h4>
        <div className="space-y-2">
          {calculatedFields.map((field) => (
            <div key={field.key} className="bg-gray-50 p-2 rounded">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-700">
                  {field.label}
                </span>
                <span className="text-xs text-gray-500">
                  = {field.formula}
                </span>
              </div>
              <div className="text-sm font-semibold text-blue-600">
                {inputData[field.key]?.toFixed(2) || '0.00'} mm
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 참고 사항 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
        <h5 className="text-xs font-medium text-yellow-800 mb-1">참고 사항</h5>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• 모든 입력값은 mm 단위로 입력</li>
          <li>• 계산된 값은 자동 업데이트</li>
          <li>• 수량 계산 시 m 단위로 변환</li>
        </ul>
      </div>
    </div>
  );
}