'use client';

import { useState, useEffect } from 'react';

interface ExcavationData {
  name: string;
  length: number;
  width: number;
  depth: number;
  volume: number;
}

interface ExcavationCalculatorProps {
  onCalculationUpdate?: (data: ExcavationData[]) => void;
}

export default function ExcavationCalculator({
  onCalculationUpdate,
}: ExcavationCalculatorProps) {
  const [excavations, setExcavations] = useState<ExcavationData[]>([
    {
      name: 'SIDE-PILE 구간',
      length: 181.0,
      width: 1,
      depth: 1.5,
      volume: 271.5,
    },
  ]);

  // 볼륨 계산
  const calculateVolume = (
    length: number,
    width: number,
    depth: number
  ): number => {
    return length * width * depth;
  };

  // 굴착 데이터 업데이트
  const updateExcavation = (
    index: number,
    field: keyof ExcavationData,
    value: string
  ) => {
    const newExcavations = [...excavations];
    const numValue = parseFloat(value) || 0;

    if (field === 'name') {
      newExcavations[index][field] = value;
    } else {
      newExcavations[index][field] = numValue;

      // 볼륨 재계산
      if (field === 'length' || field === 'width' || field === 'depth') {
        newExcavations[index].volume = calculateVolume(
          newExcavations[index].length,
          newExcavations[index].width,
          newExcavations[index].depth
        );
      }
    }

    setExcavations(newExcavations);
  };

  // 새 굴착 추가
  const addExcavation = () => {
    setExcavations([
      ...excavations,
      {
        name: `구간 ${excavations.length + 1}`,
        length: 0,
        width: 1,
        depth: 1.5,
        volume: 0,
      },
    ]);
  };

  // 굴착 삭제
  const removeExcavation = (index: number) => {
    setExcavations(excavations.filter((_, i) => i !== index));
  };

  // 총 볼륨 계산
  const totalVolume = excavations.reduce((sum, exc) => sum + exc.volume, 0);

  // 데이터 변경시 부모 컴포넌트에 알림
  useEffect(() => {
    if (onCalculationUpdate) {
      onCalculationUpdate(excavations);
    }
  }, [excavations, onCalculationUpdate]);

  return (
    <div className="space-y-4">
      {excavations.map((excavation, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <input
              type="text"
              value={excavation.name}
              onChange={(e) => updateExcavation(index, 'name', e.target.value)}
              className="text-lg font-semibold bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none"
            />
            {excavations.length > 1 && (
              <button
                onClick={() => removeExcavation(index)}
                className="text-red-500 hover:text-red-700"
              >
                삭제
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 입력 섹션 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-700 w-20">전체 길이:</span>
                <div className="flex items-center space-x-2 flex-1">
                  <div className="bg-yellow-300 px-4 py-2 rounded">
                    <input
                      type="number"
                      value={excavation.length}
                      onChange={(e) =>
                        updateExcavation(index, 'length', e.target.value)
                      }
                      className="w-24 bg-transparent text-center font-medium outline-none"
                      step="0.01"
                    />
                  </div>
                  <span className="font-medium">M</span>
                </div>
              </div>

              <div className="pl-4 space-y-3">
                <div className="text-sm text-gray-600">줄파기 상세 토시</div>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700">폭:</span>
                  <div className="flex items-center space-x-2">
                    <div className="bg-yellow-100 px-3 py-1 rounded">
                      <input
                        type="number"
                        value={excavation.width}
                        onChange={(e) =>
                          updateExcavation(index, 'width', e.target.value)
                        }
                        className="w-16 bg-transparent text-center outline-none"
                        step="0.1"
                      />
                    </div>
                    <span>M</span>
                  </div>
                  <span className="text-gray-400">×</span>
                  <span className="text-gray-700">깊이:</span>
                  <div className="flex items-center space-x-2">
                    <div className="border border-gray-300 px-3 py-1 rounded">
                      <input
                        type="number"
                        value={excavation.depth}
                        onChange={(e) =>
                          updateExcavation(index, 'depth', e.target.value)
                        }
                        className="w-16 bg-transparent text-center outline-none"
                        step="0.1"
                      />
                    </div>
                    <span>M</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 계산 결과 섹션 */}
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">계산 결과</div>
                <div className="flex items-center space-x-2 text-lg">
                  <span>{excavation.length.toFixed(2)}</span>
                  <span>×</span>
                  <span>{excavation.width.toFixed(2)}</span>
                  <span>×</span>
                  <span>{excavation.depth.toFixed(2)}</span>
                  <span>=</span>
                  <div className="bg-gray-200 px-4 py-2 rounded font-bold">
                    {excavation.volume.toFixed(2)}
                  </div>
                  <span className="font-medium">m³</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* 구간 추가 버튼 */}
      <button
        onClick={addExcavation}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
      >
        + 구간 추가
      </button>

      {/* 총 합계 */}
      {excavations.length > 1 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-blue-900">
              전체 토공량 합계:
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">
                {totalVolume.toFixed(2)}
              </span>
              <span className="text-lg font-medium text-blue-900">m³</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
