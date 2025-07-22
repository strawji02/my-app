# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

## Architecture Overview

This is a Next.js 15 application for earthwork and earth retaining wall
estimation (토공 및 흙막이 견적서 산출). It processes CSV data through a
multi-step form workflow.

### Key Technical Stack

- **Next.js 15.3.3** with App Router and Turbopack
- **TypeScript 5** with strict mode
- **Zustand** for state management with localStorage persistence
- **Tailwind CSS 4** for styling

### Application Flow

1. **Upload** (`/upload`): CSV file upload for geological and ground level data
2. **Data Review** (`/data-review`): Review and modify uploaded data
3. **Excavation** (`/excavation`): Configure excavation sections and loading
   parameters
4. **Result** (`/result`): View final calculations and estimates

### State Management Architecture

The application uses two Zustand stores:

- **`src/store/earthworkStore.ts`**: Main application state

  - CSV data (geological and ground level)
  - Calculation results
  - Step validation and navigation
  - localStorage persistence for progress saving

- **`src/store/excavationStore.ts`**: Excavation-specific state
  - Section management (sections with start/end points)
  - Loading parameters for each section
  - Persisted separately for modular data handling

### Component Structure

- **Pages** (`src/app/`): Next.js App Router pages with client-side rendering
- **Components** (`src/components/`): Feature-specific components organized by
  page
  - `common/`: Shared UI components
  - `data-review/`: Data table and editing components
  - `excavation/`: Section management and calculation components

### Important Implementation Details

1. **CSV Processing**: Custom parser in `CSVUploader.tsx` handles both header
   and headerless CSV files
2. **Client Components**: All interactive pages use `"use client"` directive
3. **Type Safety**: Strict TypeScript with types defined in
   `src/types/earthwork.ts`
4. **Path Alias**: Use `@/` for imports from `src/` directory

### Development Notes

- No testing framework is configured - consider manual testing for now
- ESLint has `react-hooks/exhaustive-deps` rule disabled
- The app uses Korean language for UI and comments
- Sample CSV files are available in `public/` directory for testing

## 프로젝트 컨텍스트: 토공 데이터 전처리 및 견적서 프로그램

### 프로젝트 개요

토공(earthwork) 굴착 작업을 위한 데이터 전처리 및 견적 계산 웹 애플리케이션입니
다. CSV 파일로 지질 데이터를 업로드하고, 이를 기반으로 굴착 깊이와 물량을 계산하
여 견적서를 생성합니다.

### 기술 스택

- **프레임워크**: Next.js 13+ (App Directory)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **상태관리**: Zustand with persist middleware
- **빌드도구**: ESLint, PostCSS
- **UI 언어**: 한국어

### 코딩 규칙

1. **React.FC 타입 사용 금지** - 컴포넌트는 일반 함수로 선언
2. **한국어 응답** - 모든 커뮤니케이션은 한국어로 진행
3. **한국어 변수명 사용** - 도메인 특화 용어는 한국어 사용 가능 (예: 매립토, 풍
   화암, 연암)

### 프로젝트 구조

```
src/
├── app/                    # Next.js App Directory
│   ├── page.tsx           # 메인 페이지
│   ├── upload/            # CSV 업로드 페이지
│   ├── data-review/       # 데이터 검토 페이지
│   ├── excavation/        # 굴착 계산 페이지
│   └── result/            # 결과 확인 페이지
├── components/
│   ├── common/            # 공통 컴포넌트
│   ├── data-review/       # 데이터 검토 관련 컴포넌트
│   └── excavation/        # 굴착 계산 관련 컴포넌트
├── store/                 # Zustand 스토어
│   ├── earthworkStore.ts  # 전체 데이터 상태 관리
│   └── excavationStore.ts # 굴착 계산 상태 관리
└── types/                 # TypeScript 타입 정의
```

### 핵심 도메인 용어

- **지질 데이터**: 매립토, 풍화암, 연암, 경암
- **구간 타입**: P (평면), S (사면)
- **작업 종류**: 직 (직접), 로 (로더), 크 (크레인)
- **항목**: 일반, 할증
- **레벨**: GL (지반고), EL (표고)

### 주요 비즈니스 로직

#### 1. 데이터 플로우

```
CSV 업로드 → 데이터 파싱 → 보정두께 계산 → 구간별 입력 → 물량 계산 → 결과 집계
```

#### 2. 보정두께 계산

- 기본 공식: `보정두께 = 두께 * 1.2`
- 누적 계산: 상부 암층의 보정두께가 하부 암층에 영향

#### 3. 굴착 깊이 계산

- P구간 (평면): 단일 굴착고 사용
- S구간 (사면): 이중 굴착고 (좌/우) 사용
- 공식: `굴착깊이 = 지반고 - 굴착고`

#### 4. 물량 계산

```typescript
물량 = 면적 * 굴착깊이 * (작업별 비율 / 100)
```

### 상태 관리 구조

#### earthworkStore.ts

```typescript
{
  geologicalData: [],      // CSV에서 읽은 지질 데이터
  groundLevelData: [],     // CSV에서 읽은 지반고 데이터
  currentStep: number,     // 현재 진행 단계
  isDataImported: boolean  // 데이터 임포트 여부
}
```

#### excavationStore.ts

```typescript
{
  sections: [{
    id: string,            // 고유 ID
    terrainType: 'P'|'S',  // 구간 타입
    sectionName: string,   // 구간명 (예: p-1, s-1)
    area: number,          // 면적
    originalGroundLevel: number,  // 원지반고
    excavationLevel: number,      // 굴착고 (P구간)
    leftExcavationLevel: number,  // 좌측 굴착고 (S구간)
    rightExcavationLevel: number, // 우측 굴착고 (S구간)
    calculations: {
      매립토: { 직: { 일반: number, 할증: number }, ... },
      풍화암: { ... },
      연암: { ... },
      경암: { ... }
    }
  }]
}
```

### 주요 컴포넌트 설명

1. **SectionForm**: 구간별 입력 폼 (지형 선택 → 구간명 → 데이터 입력)
2. **SectionTable**: 구간별 물량 계산 테이블
3. **SummaryTable**: 전체 집계 테이블 (P/S 구분)
4. **DataReview**: CSV 데이터 검토 및 보정두께 확인

### 검증 규칙

- 모든 필수 입력값 확인
- 숫자 유효성 검사
- 굴착깊이 > 0 검증
- 작업 비율 합계 = 100% 검증

### localStorage 구조

- `earthwork-storage`: 전체 프로젝트 데이터
- `excavation-storage`: 굴착 계산 데이터
- 페이지 새로고침 시에도 데이터 유지

### 개발 시 주의사항

1. **무한 루프 방지**: useEffect에서 상태 업데이트 시 의존성 관리 철저
2. **중복 키 방지**: 구간 추가 시 고유한 이름 생성 로직 필요
3. **타입 안정성**: TypeScript 타입 정의 철저히 관리
4. **성능 최적화**: 큰 데이터셋 처리 시 메모이제이션 활용

### 추가 개발 예정 기능

- 결과 페이지 상세 구현
- PDF 견적서 출력
- 데이터 내보내기 기능
- 다중 프로젝트 관리
