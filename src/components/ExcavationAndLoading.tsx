'use client';

import { useState, useEffect } from 'react';
import React from 'react';

interface ExcavationRow {
  id: string;
  sectionNumber: string; // 순번
  rockType: string; // 암종
  workType: '직' | '크'; // 직/크 선택
  item: string; // 항목
  area: number; // 면적
  modifiedThickness: number; // 수정층후
  applicationRate: number; // 적용률
  volume: number; // 산출값
}

interface ExcavationSection {
  name: string; // 구간 이름
  rows: ExcavationRow[];
}

interface ExcavationAndLoadingProps {
  modifiedThickness?: {
    modified: {
      landfill: number;
      weatheredRock: number;
      softRock: number;
      cumulative: {
        landfill: number;
        weatheredRock: number;
        softRock: number;
      };
    };
  };
}

export default function ExcavationAndLoading({
  modifiedThickness,
}: ExcavationAndLoadingProps) {
  // 면적 입력값
  const [area, setArea] = useState<number>(213.23);

  // 원지반고 및 터파기고
  const [originalGroundLevel, setOriginalGroundLevel] = useState<number>(28.05);
  const [excavationLevel, setExcavationLevel] = useState<number>(0.56);

  // 굴착길이 계산
  const excavationDepth = originalGroundLevel + excavationLevel;

  // 기본 암종 두께 (props에서 받거나 기본값 사용)
  const rockThickness = {
    매립토: modifiedThickness?.modified.landfill || 21.475,
    풍화암: modifiedThickness?.modified.weatheredRock || 0.75,
    연암: modifiedThickness?.modified.softRock || 7.8,
  };

  // 암종별 절대 표고 계산 (원지반고 기준)
  const rockElevations = {
    매립토Bottom: originalGroundLevel - rockThickness.매립토,
    풍화암Bottom:
      originalGroundLevel - rockThickness.매립토 - rockThickness.풍화암,
    연암Bottom:
      originalGroundLevel -
      rockThickness.매립토 -
      rockThickness.풍화암 -
      rockThickness.연암,
  };

  // 구간별 데이터
  const [sections, setSections] = useState<ExcavationSection[]>([
    {
      name: '1',
      rows: [
        {
          id: '1-1',
          sectionNumber: '1',
          rockType: '매립토',
          workType: '직',
          item: '일반',
          area: area,
          modifiedThickness: 5.0,
          applicationRate: 100,
          volume: 1066,
        },
        {
          id: '1-2',
          sectionNumber: '2',
          rockType: '매립토',
          workType: '크',
          item: '일반',
          area: area,
          modifiedThickness: 16.475,
          applicationRate: 100,
          volume: 3513,
        },
        {
          id: '1-3',
          sectionNumber: '3',
          rockType: '풍화암',
          workType: '크',
          item: '일반',
          area: area,
          modifiedThickness: 0.75,
          applicationRate: 100,
          volume: 160,
        },
        {
          id: '1-4',
          sectionNumber: '4',
          rockType: '연암',
          workType: '크',
          item: '마사토',
          area: area,
          modifiedThickness: 6.385,
          applicationRate: 100,
          volume: 1361,
        },
      ],
    },
  ]);

  // 수정층후 업데이트
  useEffect(() => {
    const newSections = sections.map((section) => {
      const newRows = section.rows.map((row, index) => {
        // 첫 번째 행은 사용자 입력값을 유지
        if (index === 0) {
          return {
            ...row,
            volume: Math.round(
              area * row.modifiedThickness * (row.applicationRate / 100)
            ),
          };
        }

        // 이전 행들의 수정층후 합계 계산 (현재 굴착 깊이)
        let currentDepth = 0;
        for (let i = 0; i < index; i++) {
          currentDepth += section.rows[i].modifiedThickness;
        }

        // 현재 굴착 표고 = 원지반고 - 현재까지 굴착깊이
        const currentElevation = originalGroundLevel - currentDepth;

        // 목표 굴착 표고 = 원지반고 - 전체 굴착깊이
        const targetElevation = originalGroundLevel - excavationDepth;

        let thickness = 0;

        if (row.rockType === '매립토') {
          // 매립토 하단 표고
          const bottomElevation = rockElevations.매립토Bottom;

          // 현재 표고에서 목표 표고까지 또는 매립토 하단까지 중 작은 값
          thickness = Math.max(
            0,
            Math.min(
              currentElevation - targetElevation,
              currentElevation - bottomElevation
            )
          );
        } else if (row.rockType === '풍화암') {
          // 풍화암 하단 표고
          const bottomElevation = rockElevations.풍화암Bottom;

          // 현재 표고에서 목표 표고까지 또는 풍화암 하단까지 중 작은 값
          thickness = Math.max(
            0,
            Math.min(
              currentElevation - targetElevation,
              currentElevation - bottomElevation
            )
          );
        } else if (row.rockType === '연암') {
          // 연암은 목표 표고까지 남은 전체 깊이
          thickness = Math.max(0, currentElevation - targetElevation);
        }

        return {
          ...row,
          modifiedThickness: thickness,
          volume: Math.round(area * thickness * (row.applicationRate / 100)),
        };
      });

      return { ...section, rows: newRows };
    });

    setSections(newSections);
  }, [area, originalGroundLevel, excavationLevel, modifiedThickness]);

  // 행 업데이트 함수
  const updateRow = (
    sectionName: string,
    rowId: string,
    field: keyof ExcavationRow,
    value: string | number
  ) => {
    const newSections = sections.map((section) => {
      if (section.name === sectionName) {
        const newRows = section.rows.map((row) => {
          if (row.id === rowId) {
            const updatedRow = {
              ...row,
              [field]:
                field === 'area' ||
                field === 'modifiedThickness' ||
                field === 'applicationRate'
                  ? Number(value)
                  : value,
            };

            // 면적, 적용률, 수정층후가 변경되면 볼륨 재계산
            if (
              field === 'area' ||
              field === 'applicationRate' ||
              field === 'modifiedThickness'
            ) {
              updatedRow.volume = Math.round(
                updatedRow.area *
                  updatedRow.modifiedThickness *
                  (updatedRow.applicationRate / 100)
              );
            }

            return updatedRow;
          }
          return row;
        });

        // 첫 번째 행의 수정층후가 변경되면 아래 행들 재계산
        const firstRowChanged =
          rowId === section.rows[0].id && field === 'modifiedThickness';
        if (firstRowChanged) {
          // 두 번째 행부터 재계산
          for (let i = 1; i < newRows.length; i++) {
            // 이전 행들의 수정층후 합계 계산
            let currentDepth = 0;
            for (let j = 0; j < i; j++) {
              currentDepth += newRows[j].modifiedThickness;
            }

            // 현재 굴착 표고 = 원지반고 - 현재까지 굴착깊이
            const currentElevation = originalGroundLevel - currentDepth;

            // 목표 굴착 표고 = 원지반고 - 전체 굴착깊이
            const targetElevation = originalGroundLevel - excavationDepth;

            let thickness = 0;

            if (newRows[i].rockType === '매립토') {
              // 매립토 하단 표고
              const bottomElevation = rockElevations.매립토Bottom;

              // 현재 표고에서 목표 표고까지 또는 매립토 하단까지 중 작은 값
              thickness = Math.max(
                0,
                Math.min(
                  currentElevation - targetElevation,
                  currentElevation - bottomElevation
                )
              );
            } else if (newRows[i].rockType === '풍화암') {
              // 풍화암 하단 표고
              const bottomElevation = rockElevations.풍화암Bottom;

              // 현재 표고에서 목표 표고까지 또는 풍화암 하단까지 중 작은 값
              thickness = Math.max(
                0,
                Math.min(
                  currentElevation - targetElevation,
                  currentElevation - bottomElevation
                )
              );
            } else if (newRows[i].rockType === '연암') {
              // 연암은 목표 표고까지 남은 전체 깊이
              thickness = Math.max(0, currentElevation - targetElevation);
            }

            newRows[i].modifiedThickness = thickness;
            newRows[i].volume = Math.round(
              area * thickness * (newRows[i].applicationRate / 100)
            );
          }
        }

        return { ...section, rows: newRows };
      }
      return section;
    });
    setSections(newSections);
  };

  // 행 추가
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addRow = (sectionName: string) => {
    const newSections = sections.map((section) => {
      if (section.name === sectionName) {
        const newRow: ExcavationRow = {
          id: `${sectionName}-${section.rows.length + 1}`,
          sectionNumber: String(section.rows.length + 1),
          rockType: '매립토',
          workType: '직',
          item: '',
          area: area,
          modifiedThickness: 0,
          applicationRate: 100,
          volume: 0,
        };
        return { ...section, rows: [...section.rows, newRow] };
      }
      return section;
    });
    setSections(newSections);
  };

  // 행 삭제
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const deleteRow = (sectionName: string, rowId: string) => {
    const newSections = sections.map((section) => {
      if (section.name === sectionName) {
        return {
          ...section,
          rows: section.rows.filter((row) => row.id !== rowId),
        };
      }
      return section;
    });
    setSections(newSections);
  };

  // 구간 추가
  const addSection = () => {
    const newSection: ExcavationSection = {
      name: String(sections.length + 1),
      rows: [
        {
          id: `${sections.length + 1}-1`,
          sectionNumber: '1',
          rockType: '매립토',
          workType: '직',
          item: '',
          area: area,
          modifiedThickness: 0,
          applicationRate: 100,
          volume: 0,
        },
      ],
    };
    setSections([...sections, newSection]);
  };

  // 구간별 합계 계산
  const getSectionTotal = (section: ExcavationSection) => {
    return section.rows.reduce((sum, row) => sum + row.volume, 0);
  };

  // 구간별 수정층후 합계
  const getSectionThicknessTotal = (section: ExcavationSection) => {
    return section.rows.reduce(
      (sum, row) => sum + Number(row.modifiedThickness),
      0
    );
  };

  // 전체 합계
  const totalVolume = sections.reduce(
    (sum, section) =>
      sum +
      section.rows.reduce((sectionSum, row) => sectionSum + row.volume, 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* 입력 폼 */}
      <div className="bg-blue-50 p-4 rounded-lg space-y-4">
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
                  onChange={(e) =>
                    setOriginalGroundLevel(Number(e.target.value))
                  }
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

      {/* 계산 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr className="bg-cyan-400">
              <th className="border border-gray-400 px-2 py-1" rowSpan={2}>
                구분
              </th>
              <th className="border border-gray-400 px-2 py-1" rowSpan={2}>
                항목
              </th>
              <th className="border border-gray-400 px-2 py-1" colSpan={3}>
                토량
              </th>
              <th className="border border-gray-400 px-2 py-1" rowSpan={2}>
                산출값
                <br />
                (m³)
              </th>
            </tr>
            <tr className="bg-cyan-400">
              <th className="border border-gray-400 px-2 py-1">
                면적
                <br />
                (m²)
              </th>
              <th className="border border-gray-400 px-2 py-1">
                수정층후
                <br />
                (m)
              </th>
              <th className="border border-gray-400 px-2 py-1">
                적용률
                <br />
                (%)
              </th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <React.Fragment key={section.name}>
                {section.rows.map((row, rowIndex) => {
                  const isFirstRow = rowIndex === 0;

                  return (
                    <tr key={row.id}>
                      {isFirstRow && (
                        <td
                          className="border border-gray-400 px-1 py-1 bg-yellow-200"
                          rowSpan={section.rows.length}
                        >
                          <div className="space-y-1">
                            {section.rows.map((sectionRow, idx) => (
                              <div key={idx}>
                                <div
                                  className="flex items-center space-x-1 pb-1"
                                  style={{
                                    borderBottom:
                                      idx < section.rows.length - 1
                                        ? '1px solid #9ca3af'
                                        : 'none',
                                  }}
                                >
                                  <input
                                    type="text"
                                    value={sectionRow.sectionNumber}
                                    onChange={(e) =>
                                      updateRow(
                                        section.name,
                                        sectionRow.id,
                                        'sectionNumber',
                                        e.target.value
                                      )
                                    }
                                    className="w-8 text-center border-0 bg-transparent"
                                  />
                                  <input
                                    type="text"
                                    value={sectionRow.rockType}
                                    onChange={(e) =>
                                      updateRow(
                                        section.name,
                                        sectionRow.id,
                                        'rockType',
                                        e.target.value
                                      )
                                    }
                                    className="w-16 text-xs border-0 bg-transparent"
                                  />
                                  <select
                                    value={sectionRow.workType}
                                    onChange={(e) =>
                                      updateRow(
                                        section.name,
                                        sectionRow.id,
                                        'workType',
                                        e.target.value
                                      )
                                    }
                                    className="w-10 text-xs border-0 bg-transparent"
                                  >
                                    <option value="직">직</option>
                                    <option value="크">크</option>
                                  </select>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      )}
                      <td className="border border-gray-400 px-1 py-1">
                        <input
                          type="text"
                          value={row.item}
                          onChange={(e) =>
                            updateRow(
                              section.name,
                              row.id,
                              'item',
                              e.target.value
                            )
                          }
                          className="w-full px-1 py-0.5 text-center border-0 outline-none"
                        />
                      </td>
                      <td className="border border-gray-400 px-1 py-1 bg-yellow-100">
                        <input
                          type="number"
                          value={row.area}
                          onChange={(e) =>
                            updateRow(
                              section.name,
                              row.id,
                              'area',
                              e.target.value
                            )
                          }
                          className="w-16 px-1 py-0.5 text-center bg-transparent border-0 outline-none"
                          step="0.01"
                        />
                      </td>
                      <td
                        className={`border border-gray-400 px-2 py-1 text-center ${
                          rowIndex === 0 ? 'bg-yellow-100' : 'bg-gray-300'
                        }`}
                      >
                        {rowIndex === 0 ? (
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
                            className="w-16 px-1 py-0.5 text-center bg-transparent border-0 outline-none"
                            step="0.01"
                          />
                        ) : (
                          row.modifiedThickness.toFixed(2)
                        )}
                      </td>
                      <td className="border border-gray-400 px-1 py-1 bg-yellow-100">
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
                          className="w-12 px-1 py-0.5 text-center bg-transparent border-0 outline-none"
                          step="1"
                          min="0"
                          max="100"
                        />
                      </td>
                      <td className="border border-gray-400 px-2 py-1 text-center font-medium">
                        {row.volume}
                      </td>
                    </tr>
                  );
                })}
                {/* 구간별 소계 */}
                <tr className="bg-blue-100">
                  <td
                    colSpan={5}
                    className="border border-gray-400 px-2 py-1 text-right"
                  >
                    구간 {section.name} 소계:
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-center font-bold">
                    {getSectionTotal(section)}
                  </td>
                </tr>
              </React.Fragment>
            ))}
            {/* 전체 합계 */}
            <tr className="bg-gray-200">
              <td
                colSpan={5}
                className="border border-gray-400 px-2 py-1 font-bold text-right"
              >
                전체 합계:
              </td>
              <td className="border border-gray-400 px-2 py-1 text-center font-bold">
                {totalVolume}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 구간 추가 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={addSection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          구간 추가
        </button>
      </div>

      {/* 굴착깊이 검증 정보 */}
      <div className="bg-yellow-50 p-4 rounded-lg space-y-2">
        <h4 className="font-bold text-sm mb-2">수정층후 검증</h4>
        <div className="text-xs space-y-1">
          <p>목표 굴착길이: {excavationDepth.toFixed(2)}m</p>
          {sections.map((section) => (
            <div key={section.name}>
              <p>
                구간 {section.name} 수정층후 합계:{' '}
                {getSectionThicknessTotal(section).toFixed(2)}m
              </p>
              <p
                className={
                  Math.abs(
                    getSectionThicknessTotal(section) - excavationDepth
                  ) < 0.01
                    ? 'text-green-600'
                    : 'text-red-600'
                }
              >
                검증:{' '}
                {Math.abs(getSectionThicknessTotal(section) - excavationDepth) <
                0.01
                  ? 'TRUE'
                  : 'FALSE'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 계산식 설명 */}
      <div className="bg-green-100 p-4 rounded-lg text-xs space-y-2">
        <h4 className="font-bold text-sm mb-2">수정층후 계산식</h4>
        <div className="space-y-1">
          <p className="font-medium">매립토:</p>
          <p className="ml-4">
            MIN(MAX(0, 굴착깊이-원지반고), MAX(0, 매립토두께-원지반고))
          </p>

          <p className="font-medium mt-2">풍화암:</p>
          <p className="ml-4">
            MIN(풍화암두께, MAX(0, 굴착깊이-원지반고-매립토계산값))
          </p>

          <p className="font-medium mt-2">연암:</p>
          <p className="ml-4">
            MIN(연암두께, MAX(0, 굴착깊이-원지반고-매립토계산값-풍화암계산값))
          </p>
        </div>
        <p className="mt-3 text-red-600 font-medium">
          수정층후 합계와 굴착깊이가 동일해야 함
        </p>
      </div>
    </div>
  );
}
