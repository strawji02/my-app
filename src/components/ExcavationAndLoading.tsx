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
  type: 'p' | 's'; // 구간 타입
  sectionText?: string; // 구간 텍스트 입력값
  rows: ExcavationRow[];
  excavationLevel2?: number; // s 구간용 두 번째 터파기고
  subSections?: string[]; // s 구간의 서브섹션 (예: ['1-1', '1-2'])
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
  // 지형 선택 상태 추가
  const [terrainType, setTerrainType] = useState<'평면' | '사면'>('평면');

  // 면적 입력값
  const [area, setArea] = useState<number>(213.23);
  const [sArea, setSArea] = useState<number>(18.01);

  // 원지반고 및 터파기고
  const [originalGroundLevel, setOriginalGroundLevel] = useState<number>(28.05);
  const [excavationLevel, setExcavationLevel] = useState<number>(0.56);

  // s 구간용 터파기고
  const [sExcavationLevel1, setSExcavationLevel1] = useState<number>(0.56);
  const [sExcavationLevel2, setSExcavationLevel2] = useState<number>(1.76);

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
      name: 'p',
      type: 'p',
      sectionText: '',
      rows: [
        {
          id: 'p-1',
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
          id: 'p-2',
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
          id: 'p-3',
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
          id: 'p-4',
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
    {
      name: 's',
      type: 's',
      sectionText: '1-2',
      subSections: ['1-2'],
      rows: [
        {
          id: 's-1',
          sectionNumber: '1',
          rockType: '매립토',
          workType: '직',
          item: '일반',
          area: 18.01,
          modifiedThickness: 3.0,
          applicationRate: 100,
          volume: 54,
        },
        {
          id: 's-2',
          sectionNumber: '2',
          rockType: '매립토',
          workType: '크',
          item: '일반',
          area: 18.01,
          modifiedThickness: 18.48,
          applicationRate: 100,
          volume: 333,
        },
        {
          id: 's-3',
          sectionNumber: '3',
          rockType: '풍화암',
          workType: '크',
          item: '일반',
          area: 18.01,
          modifiedThickness: 0.75,
          applicationRate: 100,
          volume: 14,
        },
        {
          id: 's-4',
          sectionNumber: '4',
          rockType: '연암',
          workType: '크',
          item: '마사토',
          area: 18.01,
          modifiedThickness: 7.59,
          applicationRate: 100,
          volume: 137,
        },
        {
          id: 's-5',
          sectionNumber: '5',
          rockType: '연암',
          workType: '크',
          item: '일반',
          area: 18.01,
          modifiedThickness: 1.21,
          applicationRate: 50,
          volume: 11,
        },
      ],
    },
  ]);

  // 수정층후 업데이트
  useEffect(() => {
    const newSections = sections.map((section) => {
      // 구간별 면적 설정
      const sectionArea = section.type === 's' ? sArea : area;

      const newRows = section.rows.map((row, index) => {
        // 첫 번째 행은 사용자 입력값을 유지
        if (index === 0) {
          return {
            ...row,
            area: sectionArea,
            volume: Math.round(
              sectionArea * row.modifiedThickness * (row.applicationRate / 100)
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

        // S 구간의 경우 1~4행은 1차 굴착, 5행은 최종 굴착
        let targetElevation;
        if (section.type === 's') {
          // S 구간에서 5번째 행(index 4)은 최종 굴착길이 사용
          if (index === 4) {
            targetElevation =
              originalGroundLevel - (originalGroundLevel + sExcavationLevel2);
          } else {
            // 1~4행은 1차 굴착길이 사용
            targetElevation =
              originalGroundLevel - (originalGroundLevel + sExcavationLevel1);
          }
        } else {
          // P 구간은 기존 로직 유지
          targetElevation = originalGroundLevel - excavationDepth;
        }

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
          area: sectionArea,
          modifiedThickness: thickness,
          volume: Math.round(
            sectionArea * thickness * (row.applicationRate / 100)
          ),
        };
      });

      return { ...section, rows: newRows };
    });

    setSections(newSections);
  }, [
    area,
    sArea,
    originalGroundLevel,
    excavationLevel,
    sExcavationLevel1,
    sExcavationLevel2,
    modifiedThickness,
  ]);

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
          // 구간별 면적 설정
          const sectionArea = section.type === 's' ? sArea : area;

          // 두 번째 행부터 재계산
          for (let i = 1; i < newRows.length; i++) {
            // 이전 행들의 수정층후 합계 계산
            let currentDepth = 0;
            for (let j = 0; j < i; j++) {
              currentDepth += newRows[j].modifiedThickness;
            }

            // 현재 굴착 표고 = 원지반고 - 현재까지 굴착깊이
            const currentElevation = originalGroundLevel - currentDepth;

            // S 구간의 경우 1~4행은 1차 굴착, 5행은 최종 굴착
            let targetElevation;
            if (section.type === 's') {
              // S 구간에서 5번째 행(index 4)은 최종 굴착길이 사용
              if (i === 4) {
                targetElevation =
                  originalGroundLevel -
                  (originalGroundLevel + sExcavationLevel2);
              } else {
                // 1~4행은 1차 굴착길이 사용
                targetElevation =
                  originalGroundLevel -
                  (originalGroundLevel + sExcavationLevel1);
              }
            } else {
              // P 구간은 기존 로직 유지
              targetElevation = originalGroundLevel - excavationDepth;
            }

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
              sectionArea * thickness * (newRows[i].applicationRate / 100)
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
      type: 'p',
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

  return (
    <div className="space-y-6">
      {/* 지형 선택 */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-bold text-sm mb-3">지형 선택</h3>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="terrain"
              value="평면"
              checked={terrainType === '평면'}
              onChange={(e) =>
                setTerrainType(e.target.value as '평면' | '사면')
              }
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
              onChange={(e) =>
                setTerrainType(e.target.value as '평면' | '사면')
              }
              className="mr-2"
            />
            <span className="text-sm">사면</span>
          </label>
        </div>
      </div>

      {/* P 구간 (평면 선택시에만 표시) */}
      {terrainType === '평면' && (
        <div>
          {/* P 구간 입력 폼 */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-4">
            <h3 className="font-bold text-sm mb-2">P 구간</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* 면적 입력 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  면적 (m²)
                </label>
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
                <label className="block text-sm font-medium mb-1">
                  원지반고
                </label>
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
                      onChange={(e) =>
                        setExcavationLevel(Number(e.target.value))
                      }
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

          {/* P 구간 테이블 */}
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full border-collapse text-xs">
              <thead>
                <tr className="bg-cyan-400">
                  <th
                    className="border border-gray-400 px-2 py-1"
                    rowSpan={2}
                    colSpan={2}
                  >
                    구간
                  </th>
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
                {sections
                  .filter((section) => section.type === 'p')
                  .map((section) => (
                    <React.Fragment key={section.name}>
                      {section.rows.map((row, rowIndex) => {
                        const isFirstRow = rowIndex === 0;

                        return (
                          <tr key={row.id}>
                            {isFirstRow && (
                              <>
                                <td
                                  className="border border-gray-400 px-1 py-1 bg-yellow-200 text-center font-bold"
                                  rowSpan={section.rows.length}
                                >
                                  {section.type.toUpperCase()}
                                </td>
                                <td
                                  className="border border-gray-400 px-1 py-1 bg-yellow-100"
                                  rowSpan={section.rows.length}
                                >
                                  <input
                                    type="text"
                                    value={section.sectionText || ''}
                                    onChange={(e) => {
                                      const newSections = sections.map((s) =>
                                        s.name === section.name
                                          ? {
                                              ...s,
                                              sectionText: e.target.value,
                                            }
                                          : s
                                      );
                                      setSections(newSections);
                                    }}
                                    className="w-full px-1 py-0.5 text-center border-0 outline-none bg-transparent"
                                  />
                                </td>
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
                              </>
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
                      {/* P 구간 소계 */}
                      <tr className="bg-blue-100">
                        <td
                          colSpan={7}
                          className="border border-gray-400 px-2 py-1 text-right"
                        >
                          구간 P {section.sectionText || ''} 소계:
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center font-bold">
                          {getSectionTotal(section)}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* S 구간 (사면 선택시에만 표시) */}
      {terrainType === '사면' && (
        <div>
          {/* S 구간 입력 폼 */}
          <div className="bg-green-50 p-4 rounded-lg space-y-4">
            <h3 className="font-bold text-sm mb-2">S 구간 (1-2)</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* 면적 입력 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  면적 (m²)
                </label>
                <input
                  type="number"
                  value={sArea}
                  onChange={(e) => setSArea(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>

              {/* 원지반고 및 터파기고 입력 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  원지반고
                </label>
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
                    <span className="text-sm">터파기고1:</span>
                    <span className="text-sm">-EL</span>
                    <input
                      type="number"
                      value={sExcavationLevel1}
                      onChange={(e) =>
                        setSExcavationLevel1(Number(e.target.value))
                      }
                      className="w-24 px-2 py-1 border border-gray-300 rounded"
                      step="0.01"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">터파기고2:</span>
                    <span className="text-sm">-EL</span>
                    <input
                      type="number"
                      value={sExcavationLevel2}
                      onChange={(e) =>
                        setSExcavationLevel2(Number(e.target.value))
                      }
                      className="w-24 px-2 py-1 border border-gray-300 rounded"
                      step="0.01"
                    />
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-blue-600">
                      굴착길이1:{' '}
                      {(originalGroundLevel + sExcavationLevel1).toFixed(2)}m
                    </p>
                    <p className="font-medium text-blue-600">
                      굴착길이2:{' '}
                      {(originalGroundLevel + sExcavationLevel2).toFixed(2)}m
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* S 구간 테이블 */}
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full border-collapse text-xs">
              <thead>
                <tr className="bg-cyan-400">
                  <th
                    className="border border-gray-400 px-2 py-1"
                    rowSpan={2}
                    colSpan={2}
                  >
                    구간
                  </th>
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
                {sections
                  .filter((section) => section.type === 's')
                  .map((section) => (
                    <React.Fragment key={section.name}>
                      {section.rows.map((row, rowIndex) => {
                        const isFirstRow = rowIndex === 0;

                        return (
                          <tr key={row.id}>
                            {isFirstRow && (
                              <>
                                <td
                                  className="border border-gray-400 px-1 py-1 bg-yellow-200 text-center font-bold"
                                  rowSpan={section.rows.length}
                                >
                                  {section.type.toUpperCase()}
                                </td>
                                <td
                                  className="border border-gray-400 px-1 py-1 bg-yellow-100"
                                  rowSpan={section.rows.length}
                                >
                                  <input
                                    type="text"
                                    value={section.sectionText || ''}
                                    onChange={(e) => {
                                      const newSections = sections.map((s) =>
                                        s.name === section.name
                                          ? {
                                              ...s,
                                              sectionText: e.target.value,
                                            }
                                          : s
                                      );
                                      setSections(newSections);
                                    }}
                                    className="w-full px-1 py-0.5 text-center border-0 outline-none bg-transparent"
                                  />
                                </td>
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
                              </>
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
                      {/* S 구간 소계 */}
                      <tr className="bg-blue-100">
                        <td
                          colSpan={7}
                          className="border border-gray-400 px-2 py-1 text-right"
                        >
                          구간 S {section.sectionText || ''} 소계:
                        </td>
                        <td className="border border-gray-400 px-2 py-1 text-center font-bold">
                          {getSectionTotal(section)}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 전체 합계 (해당 지형에 따라 합계 계산) */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-xs">
          <tbody>
            <tr className="bg-gray-200">
              <td
                colSpan={7}
                className="border border-gray-400 px-2 py-1 font-bold text-right"
              >
                전체 합계:
              </td>
              <td className="border border-gray-400 px-2 py-1 text-center font-bold">
                {terrainType === '평면'
                  ? sections
                      .filter((section) => section.type === 'p')
                      .reduce(
                        (sum, section) =>
                          sum +
                          section.rows.reduce(
                            (sectionSum, row) => sectionSum + row.volume,
                            0
                          ),
                        0
                      )
                  : sections
                      .filter((section) => section.type === 's')
                      .reduce(
                        (sum, section) =>
                          sum +
                          section.rows.reduce(
                            (sectionSum, row) => sectionSum + row.volume,
                            0
                          ),
                        0
                      )}
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
          {terrainType === '평면' && (
            <p>P 구간 목표 굴착길이: {excavationDepth.toFixed(2)}m</p>
          )}
          {terrainType === '사면' && (
            <>
              <p>
                S 구간 굴착길이1:{' '}
                {(originalGroundLevel + sExcavationLevel1).toFixed(2)}m
              </p>
              <p>
                S 구간 굴착길이2:{' '}
                {(originalGroundLevel + sExcavationLevel2).toFixed(2)}m
              </p>
            </>
          )}
          {sections
            .filter(
              (section) => section.type === (terrainType === '평면' ? 'p' : 's')
            )
            .map((section) => {
              if (section.type === 'p') {
                return (
                  <div key={section.name}>
                    <p>
                      구간 P {section.sectionText || ''} 수정층후 합계:{' '}
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
                      {Math.abs(
                        getSectionThicknessTotal(section) - excavationDepth
                      ) < 0.01
                        ? 'TRUE'
                        : 'FALSE'}
                    </p>
                  </div>
                );
              } else {
                // S 구간은 1~4행과 1~5행 두 가지 검증
                const firstFourRowsTotal = section.rows
                  .slice(0, 4)
                  .reduce((sum, row) => sum + Number(row.modifiedThickness), 0);
                const allRowsTotal = getSectionThicknessTotal(section);
                const excavation1 = originalGroundLevel + sExcavationLevel1;
                const excavation2 = originalGroundLevel + sExcavationLevel2;

                return (
                  <div key={section.name}>
                    <p>
                      구간 S {section.sectionText || ''} 수정층후 1~4행 합계:{' '}
                      {firstFourRowsTotal.toFixed(2)}m
                    </p>
                    <p
                      className={
                        Math.abs(firstFourRowsTotal - excavation1) < 0.01
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      1차 굴착 검증:{' '}
                      {Math.abs(firstFourRowsTotal - excavation1) < 0.01
                        ? 'TRUE'
                        : 'FALSE'}
                    </p>
                    <p>
                      구간 S {section.sectionText || ''} 수정층후 1~5행 합계:{' '}
                      {allRowsTotal.toFixed(2)}m
                    </p>
                    <p
                      className={
                        Math.abs(allRowsTotal - excavation2) < 0.01
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      최종 굴착 검증:{' '}
                      {Math.abs(allRowsTotal - excavation2) < 0.01
                        ? 'TRUE'
                        : 'FALSE'}
                    </p>
                  </div>
                );
              }
            })}
        </div>
      </div>

      {/* 계산식 설명 */}
      <div className="bg-green-100 p-4 rounded-lg text-xs space-y-2">
        <h4 className="font-bold text-sm mb-2">수정층후 계산식</h4>
        <div className="space-y-1">
          {terrainType === '평면' && (
            <>
              <p className="font-medium">P 구간:</p>
              <div className="ml-4 space-y-1">
                <p>
                  매립토: MIN(MAX(0, 굴착깊이-원지반고), MAX(0,
                  매립토두께-원지반고))
                </p>
                <p>
                  풍화암: MIN(풍화암두께, MAX(0,
                  굴착깊이-원지반고-매립토계산값))
                </p>
                <p>
                  연암: MIN(연암두께, MAX(0,
                  굴착깊이-원지반고-매립토계산값-풍화암계산값))
                </p>
              </div>
              <p className="mt-3 text-red-600 font-medium">
                P 구간: 수정층후 합계 = 굴착깊이
              </p>
            </>
          )}

          {terrainType === '사면' && (
            <>
              <p className="font-medium">S 구간:</p>
              <div className="ml-4 space-y-1">
                <p>1~4행: 1차 굴착길이 기준으로 계산</p>
                <p>5행: 최종 굴착길이 기준으로 계산 (추가 굴착분)</p>
              </div>
              <p className="mt-3 text-red-600 font-medium">
                S 구간: 1~4행 합계 = 1차 굴착길이, 1~5행 합계 = 최종 굴착길이
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
