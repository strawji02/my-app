import useExcavationStore from '@/store/excavationStore';

export default function SectionNameInput() {
  const { sectionName, setSectionName } = useExcavationStore();

  return (
    <div>
      <h3 className="font-bold text-sm mb-2">4-2. 구간명 입력</h3>
      <div>
        <label className="block text-sm font-medium mb-1">
          구간명 (숫자 또는 텍스트)
        </label>
        <input
          type="text"
          value={sectionName}
          onChange={(e) => setSectionName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="예: 1, A, 구간1 등"
        />
      </div>
    </div>
  );
}
