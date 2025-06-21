'use client';

import { useRef } from 'react';
import { CSVRow } from '@/types/earthwork';

interface CSVUploaderProps {
  onUpload: (data: CSVRow[]) => void;
  hasHeader?: boolean;
}

export default function CSVUploader({
  onUpload,
  hasHeader = true,
}: CSVUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length === 0) return [];

    const data: CSVRow[] = [];

    if (hasHeader) {
      // 기존 로직: 첫 줄을 헤더로 사용
      const headers = lines[0].split(',').map((h) => h.trim());

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        const row: CSVRow = {};

        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        data.push(row);
      }
    } else {
      // 헤더 없는 경우: 각 값에 인덱스를 키로 사용
      for (let i = 0; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        const row: CSVRow = {};

        values.forEach((value, index) => {
          row[index] = value;
        });

        data.push(row);
      }
    }

    return data;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const data = parseCSV(text);
      onUpload(data);
    };
    reader.readAsText(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <path
          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <button
        onClick={handleClick}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        CSV 파일 선택
      </button>

      <p className="mt-2 text-sm text-gray-600">
        CSV 파일을 선택하거나 드래그 앤 드롭하세요
      </p>
    </div>
  );
}
