import { useManholeStore } from '@/store/manholeStore';

export default function ManholeHeader() {
  const { header, setTitle, setSpecification, setUnit } = useManholeStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          공종
        </label>
        <input
          type="text"
          value={header.title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="예: 우수1호 맨홀"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          규격
        </label>
        <input
          type="text"
          value={header.specification}
          onChange={(e) => setSpecification(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="예: (D900mm)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          단위
        </label>
        <input
          type="text"
          value={header.unit}
          onChange={(e) => setUnit(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="예: 개소당"
        />
      </div>
    </div>
  );
}