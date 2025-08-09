import { useState, useCallback, useRef, useEffect } from 'react';
import { useManholeStore } from '@/store/manholeStore';

export default function ImageUploader() {
  const { image, setImage, updateImageSize } = useManholeStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImage({
            src: e.target?.result as string,
            width: Math.min(img.width, 600), // 최대 너비 600px
            height: Math.min(img.height, 400) // 최대 높이 400px
          });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(imageFile);
    }
  }, [setImage]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImage({
            src: e.target?.result as string,
            width: Math.min(img.width, 600),
            height: Math.min(img.height, 400)
          });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }, [setImage]);

  const startResize = useCallback((e: React.MouseEvent) => {
    if (!image) return;
    e.preventDefault();
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: image.width,
      startHeight: image.height
    };
  }, [image]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeRef.current || !image) return;

    const deltaX = e.clientX - resizeRef.current.startX;
    const deltaY = e.clientY - resizeRef.current.startY;
    
    const newWidth = Math.max(100, resizeRef.current.startWidth + deltaX);
    const newHeight = Math.max(100, resizeRef.current.startHeight + deltaY);
    
    updateImageSize(newWidth, newHeight);
  }, [isResizing, image, updateImageSize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    resizeRef.current = null;
  }, []);

  // 마우스 이벤트 리스너 등록
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div className="space-y-4">
      {!image ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            이미지를 드래그하여 놓거나 클릭하여 선택하세요
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
          >
            이미지 선택
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative inline-block">
            <img
              src={image.src}
              alt="맨홀 도면"
              width={image.width}
              height={image.height}
              className="border border-gray-300 rounded"
              style={{ width: image.width, height: image.height }}
            />
            <div
              className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize"
              onMouseDown={startResize}
              style={{
                cursor: isResizing ? 'se-resize' : 'se-resize'
              }}
            />
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-600">
              크기: {image.width} × {image.height}px
            </p>
            <button
              onClick={() => setImage(null)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              이미지 제거
            </button>
          </div>
        </div>
      )}
    </div>
  );
}