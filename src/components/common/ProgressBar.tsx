'use client';

import Link from 'next/link';
import useEarthworkStore from '@/store/earthworkStore';

const steps = [
  { id: 1, name: '데이터 업로드', path: '/upload' },
  { id: 2, name: '데이터 검토', path: '/data-review' },
  { id: 3, name: '터파기 계산', path: '/excavation' },
  { id: 4, name: '결과 확인', path: '/result' },
];

export default function ProgressBar() {
  const { currentStep, completedSteps } = useEarthworkStore();

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const isClickable =
              isCompleted || isCurrent || completedSteps.includes(step.id - 1);

            return (
              <div key={step.id} className="flex items-center flex-1">
                <Link
                  href={isClickable ? step.path : '#'}
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full font-medium
                    ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }
                    ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                  `}
                >
                  {isCompleted ? '✓' : step.id}
                </Link>
                <div className="ml-3 flex-1">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent
                        ? 'text-blue-600'
                        : isCompleted
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-12 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
