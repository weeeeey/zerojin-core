# 시작하기

zerojin에 오신 것을 환영합니다! 이 가이드를 통해 몇 분 안에 프로덕션급 React 훅을 사용할 수 있습니다.

## zerojin이란?

zerojin은 현대적인 웹 애플리케이션을 위한 고급 React 훅 및 컴포넌트 모음입니다. 기본적인 구현과 달리 다음과 같은 기능을 제공합니다:

-   **고급 제어**: Leading/trailing 옵션, cancel/flush 메서드
-   **타입 안전성**: `Parameters<T>` 및 `ReturnType<T>`를 통한 완벽한 TypeScript 추론
-   **프로덕션 준비**: 엣지 케이스, stale closure, 메모리 누수 처리
-   **제로 디펜던시**: 가볍고 트리쉐이킹 가능

## 설치

::: code-group

```bash [npm]
npm install zerojin
```

```bash [pnpm]
pnpm add zerojin
```

```bash [yarn]
yarn add zerojin
```

:::

## 요구사항

-   React >= 18.0.0
-   TypeScript >= 5.0.0 (권장)

## 빠른 예제

검색 입력에 `useDebouncedCallback`를 사용하는 간단한 예제입니다:

```tsx
import { useDebouncedCallback } from 'zerojin';

function SearchInput() {
    const handleSearch = useDebouncedCallback((query: string) => {
        console.log('검색:', query);
        // 여기서 API 호출
    }, 500);

    return (
        <input
            type="text"
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="검색어를 입력하세요..."
        />
    );
}
```

## 핵심 개념

### Debounce vs Throttle

언제 어떤 훅을 사용해야 하는지 이해하는 것이 중요합니다:

**Debounce (`useDebouncedCallback`)**

-   일정 시간 동안 활동이 없을 때까지 실행을 지연
-   적합한 경우: 검색 입력, 폼 유효성 검사, 리사이즈 핸들러
-   예시: 사용자가 입력을 멈춘 후 500ms 뒤에 실행

**Throttle (`useThrottle`)**

-   일정 시간마다 최대 한 번만 실행
-   적합한 경우: 스크롤 이벤트, 마우스 추적, API 속도 제한
-   예시: 200ms마다 최대 한 번만 실행

### Leading vs Trailing

두 훅 모두 leading 및 trailing 실행을 지원합니다:

```tsx
// Trailing (debounce 기본값): delay 후에 실행
useDebouncedCallback(callback, 500, { leading: false, trailing: true });

// Leading (throttle 기본값): 즉시 실행
useThrottle(callback, 500, { leading: true, trailing: false });

// 둘 다: 즉시 실행 + delay 후 실행
useDebouncedCallback(callback, 500, { leading: true, trailing: true });
```

## Import 패턴

zerojin은 여러 가지 import 패턴을 지원합니다:

```tsx
// 개별 훅 import
import { useDebouncedCallback, useThrottle } from 'zerojin';

// hooks 모듈에서 import
import { useDebouncedCallback } from 'zerojin/hooks';

// 전체 import
import * as zerojin from 'zerojin';
```

## 다음 단계

-   [설치 가이드](/guide/installation) - 상세한 설치 방법
-   [useDebouncedCallback API](/api/hooks/useDebouncedCallback) - 예제를 포함한 전체 API 레퍼런스
-   [useThrottle API](/api/hooks/useThrottle) - 예제를 포함한 전체 API 레퍼런스
