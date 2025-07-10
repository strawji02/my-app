import useExcavationStore from '@/store/excavationStore';

export default function PlaneSectionInput() {
  const {
    area,
    setArea,
    originalGroundLevel,
    setOriginalGroundLevel,
    excavationLevel,
    setExcavationLevel,
  } = useExcavationStore();

  // 굴착길이 계산
  const excavationDepth = originalGroundLevel + excavationLevel;

  return (
    <div>
      <h3 className="font-bold text-sm mb-2 mt-4">4-3. P 구간 입력</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* 면적 입력 */}
        <div>
          <label className="block text-sm font-medium mb-1">면적 (m²)</label>
          <input
            type="number"
            value={area}
            onChange={(e) => setArea(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            step="0.01"
          />
        </div>

        {/* 원지반고 입력 */}
        <div>
          <label className="block text-sm font-medium mb-1">원지반고</label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm">원지반고:</span>
              <span className="text-sm">EL</span>
              <input
                type="number"
                value={originalGroundLevel}
                onChange={(e) => setOriginalGroundLevel(Number(e.target.value))}
                className="w-24 px-2 py-1 border border-gray-300 rounded"
                step="0.01"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">터파기고:</span>
              <span className="text-sm">-EL</span>
              <input
                type="number"
                value={excavationLevel}
                onChange={(e) => setExcavationLevel(Number(e.target.value))}
                className="w-24 px-2 py-1 border border-gray-300 rounded"
                step="0.01"
              />
            </div>
            <div className="text-sm font-medium text-blue-600">
              굴착길이: {excavationDepth.toFixed(2)}m
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
