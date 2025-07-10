import useExcavationStore from '@/store/excavationStore';

export default function TerrainSelector() {
  const { terrainType, setTerrainType, setIsInputComplete } =
    useExcavationStore();

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="font-bold text-sm mb-3">4-1. 지형 선택</h3>
      <div className="flex gap-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="terrain"
            value="평면"
            checked={terrainType === '평면'}
            onChange={(e) => {
              setTerrainType(e.target.value as '평면' | '사면');
              setIsInputComplete(false); // 지형 변경시 입력 상태 초기화
            }}
            className="mr-2"
          />
          <span className="text-sm">평면</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="terrain"
            value="사면"
            checked={terrainType === '사면'}
            onChange={(e) => {
              setTerrainType(e.target.value as '평면' | '사면');
              setIsInputComplete(false); // 지형 변경시 입력 상태 초기화
            }}
            className="mr-2"
          />
          <span className="text-sm">사면</span>
        </label>
      </div>
    </div>
  );
}
