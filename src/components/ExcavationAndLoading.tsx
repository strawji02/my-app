'use client';

import { useState, useEffect } from 'react';

interface ExcavationRow {
  id: string;
  section: string; // p, s
  elevation: string;
  rockType: string;
  rockSubType: string;
  area: number;
  modifiedThickness: number;
  applicationRate: number;
  volume: number;
  excavationDepth?: number; // 굴착깊이
  originalThickness?: number; // 원래 암종 두께
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
  // 굴착깊이 설정 (각 구간별로 다름)
  const excavationDepths = {
    p: 28.0, // P 구간 굴착깊이
    s: 28.0, // S 구간 굴착깊이
  };

  // 원래 암종 두께 (기본값)
  const originalThickness = {
    매립토: 21.475,
    풍화암: 0.75,
    연암: 7.8,
  };

  const [rows, setRows] = useState<ExcavationRow[]>([
    // P 섹션
    {
      id: 'p1',
      section: 'p',
      elevation: 'E.L 28.05',
      rockType: '매립토',
      rockSubType: '풍',
      area: 213.23,
      modifiedThickness: 5.0,
      applicationRate: 100,
      volume: 1066,
      excavationDepth: excavationDepths.p,
      originalThickness: 5.0,
    },
    {
      id: 'p2',
      section: 'p',
      elevation: '-E.L 0.56',
      rockType: '매립토',
      rockSubType: '극',
      area: 213.23,
      modifiedThickness: 16.475,
      applicationRate: 100,
      volume: 3513,
      excavationDepth: excavationDepths.p,
      originalThickness: 16.475,
    },
    {
      id: 'p3',
      section: 'p',
      elevation: '28.61',
      rockType: '풍화암',
      rockSubType: '극',
      area: 213.23,
      modifiedThickness: 0.75,
      applicationRate: 100,
      volume: 160,
      excavationDepth: excavationDepths.p,
      originalThickness: originalThickness.풍화암,
    },
    {
      id: 'p4',
      section: 'p',
      elevation: '28.61',
      rockType: '연암',
      rockSubType: '극',
      area: 213.23,
      modifiedThickness: 5.775,
      applicationRate: 100,
      volume: 1231,
      excavationDepth: excavationDepths.p,
      originalThickness: originalThickness.연암,
    },
    // S 섹션 (1-2)
    {
      id: 's1',
      section: 's',
      elevation: 'E.L 28.05',
      rockType: '매립토',
      rockSubType: '풍',
      area: 18.01,
      modifiedThickness: 5.0,
      applicationRate: 100,
      volume: 90,
      excavationDepth: excavationDepths.s,
      originalThickness: 5.0,
    },
    {
      id: 's2',
      section: 's',
      elevation: '-E.L 1.76',
      rockType: '매립토',
      rockSubType: '극',
      area: 18.01,
      modifiedThickness: 16.475,
      applicationRate: 100,
      volume: 297,
      excavationDepth: excavationDepths.s,
      originalThickness: 16.475,
    },
    {
      id: 's3',
      section: 's',
      elevation: '-E.L 0.56',
      rockType: '풍화암',
      rockSubType: '극',
      area: 18.01,
      modifiedThickness: 0.75,
      applicationRate: 100,
      volume: 14,
      excavationDepth: excavationDepths.s,
      originalThickness: originalThickness.풍화암,
    },
    {
      id: 's4',
      section: 's',
      elevation: '28.61',
      rockType: '연암',
      rockSubType: '극',
      area: 18.01,
      modifiedThickness: 5.775,
      applicationRate: 100,
      volume: 104,
      excavationDepth: excavationDepths.s,
      originalThickness: originalThickness.연암,
    },
    {
      id: 's5',
      section: 's',
      elevation: '29.81',
      rockType: '연암',
      rockSubType: '극',
      area: 18.01,
      modifiedThickness: 0.0,
      applicationRate: 50,
      volume: 0,
      excavationDepth: excavationDepths.s,
      originalThickness: 1.2,
    },
  ]);

  // 섹션별 수정층후 계산 로직
  const calculateSectionThickness = (section: string) => {
    const sectionRows = rows.filter((row) => row.section === section);
    const excavationDepth =
      excavationDepths[section as keyof typeof excavationDepths];

    let remainingDepth = excavationDepth;

    // 매립토 계산
    const landfillRows = sectionRows.filter((row) => row.rockType === '매립토');

    landfillRows.forEach((row) => {
      if (remainingDepth > 0) {
        const thickness = Math.min(row.originalThickness || 0, remainingDepth);
        row.modifiedThickness = thickness;
        remainingDepth -= thickness;
      } else {
        row.modifiedThickness = 0;
      }
    });

    // 풍화암 계산
    const weatheredRockRows = sectionRows.filter(
      (row) => row.rockType === '풍화암'
    );
    weatheredRockRows.forEach((row) => {
      if (remainingDepth > 0) {
        const thickness = Math.min(row.originalThickness || 0, remainingDepth);
        row.modifiedThickness = thickness;
        remainingDepth -= thickness;
      } else {
        row.modifiedThickness = 0;
      }
    });

    // 연암 계산
    const softRockRows = sectionRows.filter((row) => row.rockType === '연암');
    softRockRows.forEach((row) => {
      if (remainingDepth > 0) {
        const thickness = Math.min(row.originalThickness || 0, remainingDepth);
        row.modifiedThickness = thickness;
        remainingDepth -= thickness;
      } else {
        row.modifiedThickness = 0;
      }
    });

    return sectionRows;
  };

  // 수정층후 값이 props로 전달되면 업데이트
  useEffect(() => {
    if (!modifiedThickness) return;

    const newRows = [...rows];

    // P 구간과 S 구간 각각 계산
    ['p', 's'].forEach((section) => {
      calculateSectionThickness(section);
    });

    // 볼륨 재계산
    newRows.forEach((row) => {
      row.volume = calculateVolume(
        row.area,
        row.modifiedThickness,
        row.applicationRate
      );
    });

    setRows(newRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modifiedThickness]);

  // 볼륨 계산
  const calculateVolume = (
    area: number,
    thickness: number,
    rate: number
  ): number => {
    return Math.round(area * thickness * (rate / 100));
  };

  // 행 업데이트
  const updateRow = (
    id: string,
    field: keyof ExcavationRow,
    value: string | number
  ) => {
    const newRows = rows.map((row) => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };

        // 면적이나 적용률이 변경되면 볼륨 재계산
        if (field === 'area' || field === 'applicationRate') {
          updatedRow.volume = calculateVolume(
            field === 'area' ? Number(value) : updatedRow.area,
            updatedRow.modifiedThickness,
            field === 'applicationRate'
              ? Number(value)
              : updatedRow.applicationRate
          );
        }

        return updatedRow;
      }
      return row;
    });
    setRows(newRows);
  };

  // 섹션별 합계 계산
  const getSectionTotal = (section: string) => {
    return rows
      .filter((row) => row.section === section)
      .reduce((sum, row) => sum + row.volume, 0);
  };

  // 섹션별 수정층후 합계 계산
  const getSectionThicknessTotal = (section: string) => {
    return rows
      .filter((row) => row.section === section)
      .reduce((sum, row) => sum + row.modifiedThickness, 0);
  };

  // 전체 합계
  const totalVolume = rows.reduce((sum, row) => sum + row.volume, 0);

  return (
    <div className="space-y-6">
      {/* 계산 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr className="bg-cyan-400">
              <th className="border border-gray-400 px-2 py-1" rowSpan={2}>
                구분
              </th>
              <th
                className="border border-gray-400 px-2 py-1"
                colSpan={2}
                rowSpan={2}
              >
                암종
              </th>
              <th className="border border-gray-400 px-2 py-1" colSpan={3}>
                토량
              </th>
              <th className="border border-gray-400 px-2 py-1" rowSpan={2}>
                산출값
              </th>
            </tr>
            <tr className="bg-cyan-400">
              <th className="border border-gray-400 px-2 py-1">
                면적
                <br />
                (m2)
              </th>
              <th className="border border-gray-400 px-2 py-1">
                수정층후
                <br />
                (m)
              </th>
              <th className="border border-gray-400 px-2 py-1">적용률</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const isFirstInSection =
                index === 0 || rows[index - 1].section !== row.section;
              const sectionRowCount = rows.filter(
                (r) => r.section === row.section
              ).length;

              return (
                <tr key={row.id}>
                  {isFirstInSection && (
                    <td
                      className="border border-gray-400 text-center font-medium bg-yellow-200"
                      rowSpan={sectionRowCount}
                    >
                      {row.section}
                    </td>
                  )}
                  <td className="border border-gray-400 px-2 py-1 bg-gray-100">
                    {row.elevation}
                  </td>
                  <td className="border border-gray-400 px-2 py-1">
                    {row.rockType} {row.rockSubType}
                  </td>
                  <td className="border border-gray-400 px-1 py-1">
                    <input
                      type="number"
                      value={row.area}
                      onChange={(e) =>
                        updateRow(row.id, 'area', e.target.value)
                      }
                      className="w-16 px-1 py-0.5 text-center bg-yellow-100 border-0 outline-none"
                      step="0.01"
                    />
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-center bg-gray-300">
                    {row.modifiedThickness.toFixed(3)}
                  </td>
                  <td className="border border-gray-400 px-1 py-1">
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={row.applicationRate}
                        onChange={(e) =>
                          updateRow(row.id, 'applicationRate', e.target.value)
                        }
                        className="w-12 px-1 py-0.5 text-center bg-yellow-100 border-0 outline-none"
                        step="1"
                        min="0"
                        max="100"
                      />
                      <span className="ml-1">%</span>
                    </div>
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-center font-medium">
                    {row.volume}
                  </td>
                </tr>
              );
            })}
            {/* 섹션별 소계 */}
            <tr className="bg-blue-100">
              <td
                colSpan={6}
                className="border border-gray-400 px-2 py-1 text-right"
              >
                P 구간 소계:
              </td>
              <td className="border border-gray-400 px-2 py-1 text-center font-bold">
                {getSectionTotal('p')}
              </td>
            </tr>
            <tr className="bg-blue-100">
              <td
                colSpan={6}
                className="border border-gray-400 px-2 py-1 text-right"
              >
                S 구간 소계:
              </td>
              <td className="border border-gray-400 px-2 py-1 text-center font-bold">
                {getSectionTotal('s')}
              </td>
            </tr>
            {/* 전체 합계 */}
            <tr className="bg-gray-200">
              <td
                colSpan={6}
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

      {/* 굴착깊이 및 검증 정보 */}
      <div className="bg-yellow-50 p-4 rounded-lg space-y-2">
        <h4 className="font-bold text-sm mb-2">굴착깊이 검증</h4>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-medium">P 구간</p>
            <p>굴착깊이: {excavationDepths.p.toFixed(3)}</p>
            <p>수정층후 합계: {getSectionThicknessTotal('p').toFixed(3)}</p>
            <p
              className={
                getSectionThicknessTotal('p') === excavationDepths.p
                  ? 'text-green-600'
                  : 'text-red-600'
              }
            >
              검증:{' '}
              {getSectionThicknessTotal('p') === excavationDepths.p
                ? 'TRUE'
                : 'FALSE'}
            </p>
          </div>
          <div>
            <p className="font-medium">S 구간</p>
            <p>굴착깊이: {excavationDepths.s.toFixed(3)}</p>
            <p>수정층후 합계: {getSectionThicknessTotal('s').toFixed(3)}</p>
            <p
              className={
                getSectionThicknessTotal('s') === excavationDepths.s
                  ? 'text-green-600'
                  : 'text-red-600'
              }
            >
              검증:{' '}
              {getSectionThicknessTotal('s') === excavationDepths.s
                ? 'TRUE'
                : 'FALSE'}
            </p>
          </div>
        </div>
      </div>

      {/* 계산 방법 설명 */}
      <div className="bg-green-100 p-4 rounded-lg text-xs space-y-2">
        <h4 className="font-bold text-sm mb-2">
          P. 평면 계산식 설명(수정 층후 계산식 설명)
        </h4>
        <p className="font-medium">
          수정층후 계산은 순차적으로 계산하고 암종깊이와 굴착 깊이에 논리적으로
          처리
        </p>
        <div className="mt-2 space-y-1">
          <p className="font-medium text-yellow-700">
            굴착깊이: 28.000, 22.000, 10.000 (변수 28, 22, 10 등을 직접 입력)
          </p>
          <p className="font-medium text-yellow-700">
            암종별 수정층후: 변수 5, 3, 2 등을 직접 입력
          </p>
        </div>
        <div className="mt-3 space-y-1">
          <p>
            1. 굴착깊이가 (변수 + 매립토깊이)보다 크면 계산값 ={' '}
            <span className="text-red-600">매립토깊이 - 변수</span>
          </p>
          <p>
            2. 굴착깊이가 매립토깊이+ 풍화암깊이 보다 작으면 계산값 ={' '}
            <span className="text-red-600">굴착깊이 - 변수를 계산</span>
          </p>
          <br />
          <p>
            1. 굴착깊이가 매립토깊이+ 풍화암깊이 보다 크면 계산값 ={' '}
            <span className="text-red-600">풍화암깊이</span>
          </p>
          <p>
            2. 굴착깊이가 매립토깊이+ 풍화암깊이 보다 작으면 계산값 ={' '}
            <span className="text-red-600">굴착깊이 - 매립토 깊이를 계산</span>
          </p>
          <br />
          <p>
            1. 굴착깊이가 매립토깊이+ 풍화암깊이+ 연암깊이 보다 크면 계산값 ={' '}
            <span className="text-red-600">
              굴착깊이 - (매립토 깊이 + 풍화암깊이)
            </span>
          </p>
          <p>
            2. 굴착깊이가 매립토깊이+ 풍화암깊이+ 연암깊이 보다 작으면 계산값 ={' '}
            <span className="text-red-600">0</span>
          </p>
        </div>
        <p className="mt-3 text-red-600 font-medium">
          수정층후 합계와 굴착깊이 입력값이 동일
        </p>
      </div>
    </div>
  );
}
