# 설치

## 패키지 매니저

선호하는 패키지 매니저를 사용하여 zerojin을 설치하세요:

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

```bash [bun]
bun add zerojin
```

:::

## 요구사항

### Peer Dependencies

zerojin은 React 18 이상을 필요로 합니다:

```json
{
    "peerDependencies": {
        "react": "^18.0.0 || ^19.0.0",
        "react-dom": "^18.0.0 || ^19.0.0"
    }
}
```

### TypeScript

zerojin은 JavaScript에서도 작동하지만, 최상의 개발 경험을 위해 TypeScript 사용을 강력히 권장합니다:

-   TypeScript >= 5.0.0 권장
-   모든 훅에 대한 완전한 타입 추론
-   `Parameters<T>` 및 `ReturnType<T>` 보존

## 프레임워크 통합

### Next.js

zerojin은 Next.js (App Router 또는 Pages Router)와 완벽하게 작동합니다:

```tsx
// app/components/SearchInput.tsx
'use client';

import { useDebouncedCallback } from 'zerojin';

export function SearchInput() {
    const handleSearch = useDebouncedCallback((query: string) => {
        // 검색 로직
    }, 500);

    return <input onChange={(e) => handleSearch(e.target.value)} />;
}
```

### Vite

특별한 설정이 필요 없습니다:

```tsx
import { useDebouncedCallback } from 'zerojin';

function App() {
    // 일반적으로 훅 사용
}
```

### Create React App

별도 설정 없이 바로 사용 가능합니다:

```tsx
import { useDebouncedCallback } from 'zerojin';

function App() {
    // 일반적으로 훅 사용
}
```

## Import 경로

zerojin은 유연성을 위해 여러 import 패턴을 지원합니다:

### 기본 Import

```tsx
import { useDebouncedCallback, useThrottle } from 'zerojin';
```

### 모듈 Import

더 나은 트리쉐이킹을 위해 필요한 것만 import:

```tsx
// hooks 모듈에서 import
import { useDebouncedCallback } from 'zerojin/hooks';

// components 모듈에서 import (향후)
import { SomeComponent } from 'zerojin/components';
```

### 네임스페이스 Import

```tsx
import * as zerojin from 'zerojin';

const handleSearch = zerojin.useDebouncedCallback(callback, 500);
```

## 번들 크기

zerojin은 가볍게 설계되었습니다:

-   **useDebouncedCallback**: ~1.2KB (minified + gzipped)
-   **useThrottle**: ~1.3KB (minified + gzipped)
-   **전체 패키지**: ~2.5KB (minified + gzipped)
-   **제로 디펜던시**: 외부 패키지 없음

모든 훅은 트리쉐이킹이 가능하므로, 사용하는 것만 번들에 포함됩니다.

## 설치 확인

설치를 확인하세요:

```tsx
import { useDebouncedCallback } from 'zerojin';

console.log(typeof useDebouncedCallback); // 'function'
```

## 다음 단계

-   [시작하기](/guide/getting-started) - 기본 사용법 학습
-   [useDebouncedCallback API](/api/hooks/useDebouncedCallback) - 전체 API 문서
-   [useThrottle API](/api/hooks/useThrottle) - 전체 API 문서
