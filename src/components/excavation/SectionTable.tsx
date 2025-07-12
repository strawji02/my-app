import { useMemo, useEffect, useRef } from 'react';
import useExcavationStore from '@/store/excavationStore';

interface SectionTableProps {
  section: {
    name: string;
    type: 'p' | 's';
    sectionText?: string;
    rows: Array<{
      id: string;
      sectionNumber: string;
      rockType: string;
      workType: '직' | '크';
      item: string;
      area: number;
      modifiedThickness: number;
      applicationRate: number;
      volume: number;
    }>;
    terrainType: '평면' | '사면' | '';
    sectionName: string;
    isInputComplete: boolean;
    area: number;
    originalGroundLevel: number;
    excavationLevel: number;
    sExcavationLevel1?: number;
    sExcavationLevel2?: number;
  };
}

export default function SectionTable({ section }: SectionTableProps) {
  const { updateRow, updateSectionText, deleteSection, rockThickness } =
    useExcavationStore();

  // 이전 값들을 추적하여 실제 변경이 있을 때만 업데이트
  const prevDepsRef = useRef({
    rockThickness,
    originalGroundLevel: section.originalGroundLevel,
    excavationLevel: section.excavationLevel,
    sExcavationLevel1: section.sExcavationLevel1,
    sExcavationLevel2: section.sExcavationLevel2,
  });

  const currentExcavationDepth = useMemo(() => {
    if (section.terrainType === '평면') {
      return section.originalGroundLevel + section.excavationLevel;
    } else {
      return section.originalGroundLevel + (section.sExcavationLevel1 || 0);
    }
  }, [
    section.terrainType,
    section.originalGroundLevel,
    section.excavationLevel,
    section.sExcavationLevel1,
  ]);

  const secondExcavationDepth = useMemo(() => {
    if (section.terrainType === '사면') {
      return section.originalGroundLevel + (section.sExcavationLevel2 || 0);
    }
    return 0;
  }, [
    section.terrainType,
    section.originalGroundLevel,
    section.sExcavationLevel2,
  ]);

  // 수정층후 자동 계산
  useEffect(() => {
    if (!rockThickness) return;

    // 이전 값과 비교하여 실제로 변경되었는지 확인
    const deps = {
      rockThickness,
      originalGroundLevel: section.originalGroundLevel,
      excavationLevel: section.excavationLevel,
      sExcavationLevel1: section.sExcavationLevel1,
      sExcavationLevel2: section.sExcavationLevel2,
    };

    const hasChanged =
      JSON.stringify(prevDepsRef.current.rockThickness) !==
        JSON.stringify(deps.rockThickness) ||
      prevDepsRef.current.originalGroundLevel !== deps.originalGroundLevel ||
      prevDepsRef.current.excavationLevel !== deps.excavationLevel ||
      prevDepsRef.current.sExcavationLevel1 !== deps.sExcavationLevel1 ||
      prevDepsRef.current.sExcavationLevel2 !== deps.sExcavationLevel2;

    if (!hasChanged) return;

    prevDepsRef.current = deps;

    const firstRowDepth = 5.0; // 첫 번째 row는 항상 5.0
    const excavationDepth = currentExcavationDepth;

    // 각 row의 새로운 값들을 먼저 계산
    const newValues: Array<{ id: string; modifiedThickness: number }> = [];

    // 첫 번째 row는 항상 5.0
    if (section.rows[0]) {
      newValues.push({
        id: section.rows[0].id,
        modifiedThickness: 5.0,
      });
    }

    // P 구간이나 S 구간의 처음 4개 row 계산
    for (let i = 1; i <= 3; i++) {
      if (section.rows[i]) {
        let modifiedThickness = 0;

        if (i === 1) {
          // 매립토-크 계산
          const remainingFill = rockThickness.매립토 - firstRowDepth;
          if (remainingFill > 0) {
            modifiedThickness = remainingFill;
          } else {
            // 매립토가 부족한 경우 풍화암까지 파고들어감
            const digIntoWeathered = Math.abs(remainingFill);
            const weatheredDepth = Math.min(
              digIntoWeathered,
              rockThickness.풍화암
            );
            modifiedThickness = weatheredDepth;
          }
        } else if (i === 2) {
          // 풍화암 계산
          const totalFill = rockThickness.매립토;

          if (totalFill > firstRowDepth) {
            // 매립토가 5m보다 두꺼운 경우
            const remainingWeathered = rockThickness.풍화암;
            modifiedThickness = remainingWeathered;
          } else {
            // 매립토가 5m보다 얇은 경우
            const digIntoWeathered = firstRowDepth - totalFill;
            const remainingWeathered = Math.max(
              0,
              rockThickness.풍화암 - digIntoWeathered
            );
            modifiedThickness = remainingWeathered;
          }
        } else if (i === 3) {
          // 연암 계산
          const totalFillAndWeathered =
            rockThickness.매립토 + rockThickness.풍화암;

          if (excavationDepth > totalFillAndWeathered) {
            const digIntoHardRock = excavationDepth - totalFillAndWeathered;
            modifiedThickness = Math.min(digIntoHardRock, rockThickness.연암);
          } else {
            modifiedThickness = 0;
          }
        }

        newValues.push({
          id: section.rows[i].id,
          modifiedThickness,
        });
      }
    }

    // S 구간의 5번째 row 계산 (연암-크 일반)
    if (section.type === 's' && section.rows[4] && secondExcavationDepth > 0) {
      const totalDepth =
        rockThickness.매립토 + rockThickness.풍화암 + rockThickness.연암;

      let additionalThickness = 0;
      if (secondExcavationDepth > totalDepth) {
        additionalThickness = secondExcavationDepth - currentExcavationDepth;
      }

      newValues.push({
        id: section.rows[4].id,
        modifiedThickness: additionalThickness,
      });
    }

    // 실제로 변경된 값만 업데이트
    newValues.forEach((newValue) => {
      const currentRow = section.rows.find((row) => row.id === newValue.id);
      if (
        currentRow &&
        currentRow.modifiedThickness !== newValue.modifiedThickness
      ) {
        updateRow(
          section.name,
          newValue.id,
          'modifiedThickness',
          newValue.modifiedThickness
        );
      }
    });
  }, [
    rockThickness,
    currentExcavationDepth,
    secondExcavationDepth,
    section.name,
    section.type,
    section.originalGroundLevel,
    section.excavationLevel,
    section.sExcavationLevel1,
    section.sExcavationLevel2,
  ]);

  const subtotal = useMemo(() => {
    return section.rows.reduce((acc, row) => acc + row.volume, 0);
  }, [section.rows]);

  const sectionTitle = useMemo(() => {
    const displayName = section.sectionText || section.sectionName;
    if (section.terrainType === '평면') {
      return `4.${
        3 + parseInt(section.name.split('-')[1] || '1')
      }. P-${displayName}`;
    } else {
      return `4.${
        3 + parseInt(section.name.split('-')[1] || '1')
      }. S-${displayName}`;
    }
  }, [
    section.terrainType,
    section.name,
    section.sectionText,
    section.sectionName,
  ]);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-bold text-sm">{sectionTitle}</h3>
        <input
          type="text"
          value={section.sectionText || ''}
          onChange={(e) => updateSectionText(section.name, e.target.value)}
          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
          placeholder="구간명"
        />
      </div>

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">구분</th>
            <th className="border px-2 py-1">암종</th>
            <th className="border px-2 py-1">작업</th>
            <th className="border px-2 py-1">항목</th>
            <th className="border px-2 py-1">면적(m²)</th>
            <th className="border px-2 py-1">
              수정층후
              <br />
              (m)
            </th>
            <th className="border px-2 py-1">
              적용율
              <br />
              (%)
            </th>
            <th className="border px-2 py-1">
              부피
              <br />
              (m³)
            </th>
          </tr>
        </thead>
        <tbody>
          {section.rows.map((row) => (
            <tr key={row.id}>
              <td className="border px-2 py-1 text-center">
                {row.sectionNumber}
              </td>
              <td className="border px-2 py-1">{row.rockType}</td>
              <td className="border px-2 py-1 text-center">
                <select
                  value={row.workType}
                  onChange={(e) =>
                    updateRow(section.name, row.id, 'workType', e.target.value)
                  }
                  className="w-full"
                >
                  <option value="직">직</option>
                  <option value="크">크</option>
                </select>
              </td>
              <td className="border px-2 py-1">
                <select
                  value={row.item}
                  onChange={(e) =>
                    updateRow(section.name, row.id, 'item', e.target.value)
                  }
                  className="w-full"
                >
                  <option value="일반">일반</option>
                  <option value="마사토">마사토</option>
                </select>
              </td>
              <td className="border px-2 py-1">
                <input
                  type="number"
                  value={row.area}
                  onChange={(e) =>
                    updateRow(section.name, row.id, 'area', e.target.value)
                  }
                  className="w-full text-right"
                  step="0.01"
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  type="number"
                  value={row.modifiedThickness}
                  onChange={(e) =>
                    updateRow(
                      section.name,
                      row.id,
                      'modifiedThickness',
                      e.target.value
                    )
                  }
                  className="w-full text-right"
                  step="0.001"
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  type="number"
                  value={row.applicationRate}
                  onChange={(e) =>
                    updateRow(
                      section.name,
                      row.id,
                      'applicationRate',
                      e.target.value
                    )
                  }
                  className="w-full text-right"
                  step="1"
                />
              </td>
              <td className="border px-2 py-1 text-right">
                {row.volume.toLocaleString()}
              </td>
            </tr>
          ))}
          <tr className="bg-yellow-100 font-bold">
            <td colSpan={7} className="border px-2 py-1 text-right">
              소계
            </td>
            <td className="border px-2 py-1 text-right">
              {subtotal.toLocaleString()}
              <button
                onClick={() => deleteSection(section.name)}
                className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded text-xs hover:bg-red-600"
              >
                삭제
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
