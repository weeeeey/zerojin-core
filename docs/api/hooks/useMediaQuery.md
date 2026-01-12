# useMediaQuery

CSS 미디어 쿼리의 매칭 상태를 추적하고 SSR을 안전하게 지원하는 훅입니다.

## 시그니처

```typescript
function useMediaQuery(query: string): boolean;
```

## 파라미터

| 파라미터 | 타입     | 기본값 | 설명                                 |
| -------- | -------- | ------ | ------------------------------------ |
| `query`  | `string` | 필수   | CSS 미디어 쿼리 문자열 (예: '(max-width: 768px)') |

## 반환값

미디어 쿼리가 현재 매칭되는지 여부를 나타내는 boolean 값을 반환합니다. SSR 환경에서는 `false`를 반환합니다.

## 기본 예제

### 반응형 레이아웃

화면 크기에 따라 다른 UI를 렌더링:

```tsx
import { useMediaQuery } from 'zerojin';

function ResponsiveLayout() {
    const isMobile = useMediaQuery('(max-width: 768px)');

    return (
        <div>
            {isMobile ? (
                <MobileNavigation />
            ) : (
                <DesktopNavigation />
            )}
        </div>
    );
}
```

### 다크 모드 감지

시스템 다크 모드 설정 감지:

```tsx
function ThemeDetector() {
    const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

    return (
        <div className={prefersDark ? 'dark-theme' : 'light-theme'}>
            현재 테마: {prefersDark ? '다크' : '라이트'}
        </div>
    );
}
```

### 태블릿 감지

특정 화면 크기 범위 타겟팅:

```tsx
function DeviceSpecificContent() {
    const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');

    if (isTablet) {
        return <TabletOptimizedView />;
    }

    return <DefaultView />;
}
```

## 고급 예제

### 다중 브레이크포인트

여러 미디어 쿼리 조합:

```tsx
function MultiBreakpoint() {
    const isMobile = useMediaQuery('(max-width: 640px)');
    const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
    const isDesktop = useMediaQuery('(min-width: 1025px)');

    return (
        <div>
            {isMobile && <MobileView />}
            {isTablet && <TabletView />}
            {isDesktop && <DesktopView />}
        </div>
    );
}
```

### 디바이스 방향

화면 방향에 따른 UI 조정:

```tsx
function OrientationAware() {
    const isPortrait = useMediaQuery('(orientation: portrait)');

    return (
        <div className={isPortrait ? 'portrait-layout' : 'landscape-layout'}>
            {isPortrait ? '세로 모드' : '가로 모드'}
        </div>
    );
}
```

### 접근성 설정

사용자의 접근성 설정 반영:

```tsx
function AccessibilityAware() {
    const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    const prefersHighContrast = useMediaQuery('(prefers-contrast: high)');

    return (
        <div
            className={`
                ${prefersReducedMotion ? 'no-animation' : 'animated'}
                ${prefersHighContrast ? 'high-contrast' : ''}
            `}
        >
            접근성 최적화 콘텐츠
        </div>
    );
}
```

### 조건부 컴포넌트 로딩

화면 크기에 따라 무거운 컴포넌트 조건부 로드:

```tsx
import { lazy, Suspense } from 'react';

const DesktopChart = lazy(() => import('./DesktopChart'));
const MobileChart = lazy(() => import('./MobileChart'));

function ChartContainer() {
    const isDesktop = useMediaQuery('(min-width: 1024px)');

    return (
        <Suspense fallback={<Loading />}>
            {isDesktop ? <DesktopChart /> : <MobileChart />}
        </Suspense>
    );
}
```

### TypeScript와 함께

타입 안전한 미디어 쿼리 관리:

```tsx
const BREAKPOINTS = {
    mobile: '(max-width: 640px)',
    tablet: '(min-width: 641px) and (max-width: 1024px)',
    desktop: '(min-width: 1025px)',
    dark: '(prefers-color-scheme: dark)',
    reducedMotion: '(prefers-reduced-motion: reduce)',
} as const;

function TypeSafeMediaQuery() {
    const isMobile = useMediaQuery(BREAKPOINTS.mobile);
    const prefersDark = useMediaQuery(BREAKPOINTS.dark);

    return (
        <div className={prefersDark ? 'dark' : 'light'}>
            {isMobile ? 'Mobile View' : 'Desktop View'}
        </div>
    );
}
```

## 언제 사용할까

다음과 같은 경우 `useMediaQuery`를 사용하세요:

✅ **반응형 UI 구현**
- 화면 크기별 다른 레이아웃
- 모바일/데스크톱 전환
- 브레이크포인트 기반 렌더링

✅ **사용자 설정 감지**
- 다크 모드 선호도
- 애니메이션 감소 설정
- 고대비 모드

✅ **디바이스 특성 확인**
- 화면 방향 (세로/가로)
- 디바이스 타입
- 화면 해상도

## 언제 사용하지 말아야 할까

❌ **단순 모바일 감지만 필요한 경우**
- `useIsMobile` 사용 (더 간단한 API)

❌ **CSS만으로 충분한 경우**
- CSS 미디어 쿼리 사용
- JavaScript가 필요 없는 스타일링

❌ **정적인 체크만 필요한 경우**
- 빌드 타임 환경 변수 사용
- 서버 사이드에서 User-Agent 체크

## useMediaQuery vs useIsMobile

| 기능             | useMediaQuery | useIsMobile |
| ---------------- | ------------- | ----------- |
| 유연성           | ✅ 모든 미디어 쿼리 | ❌ 모바일만 |
| 사용 편의성      | 중간          | ✅ 매우 쉬움 |
| 커스터마이징     | ✅ 전체 제어  | ⚠️ 쿼리만 변경 가능 |
| SSR 안전성       | ✅            | ✅          |

### 예제 비교

```tsx
// useMediaQuery - 완전한 제어
const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

// useIsMobile - 모바일 감지에 특화
const isMobile = useIsMobile(); // 기본: (max-width: 767px)
const isSmallMobile = useIsMobile('(max-width: 480px)'); // 커스텀 가능
```

## 구현 세부사항

- `useSyncExternalStore`를 사용한 React 18+ 최적화
- `window.matchMedia`로 미디어 쿼리 매칭
- 쿼리 변경 시 자동 리스닝 및 업데이트
- SSR 환경에서 안전한 `false` 폴백
- 언마운트 시 자동 이벤트 리스너 정리
- 서버/클라이언트 불일치 없음
