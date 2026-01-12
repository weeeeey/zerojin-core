# useIsMounted

컴포넌트의 마운트 상태를 추적하여 SSR 하이드레이션 불일치를 방지하는 훅입니다.

## 시그니처

```typescript
function useIsMounted(): boolean;
```

## 파라미터

이 훅은 파라미터를 받지 않습니다.

## 반환값

컴포넌트가 마운트되었는지 여부를 나타내는 boolean 값을 반환합니다.
- SSR/첫 렌더링: `false`
- 클라이언트 마운트 후: `true`

## 기본 예제

### 하이드레이션 불일치 방지

서버와 클라이언트에서 다른 콘텐츠 렌더링:

```tsx
import { useIsMounted } from 'zerojin';

function ClientOnlyContent() {
    const isMounted = useIsMounted();

    if (!isMounted) {
        return <Skeleton />; // SSR 플레이스홀더
    }

    return <div>{new Date().toLocaleString()}</div>; // 클라이언트 전용
}
```

### 브라우저 API 안전하게 사용

Window 객체 사용 전 마운트 확인:

```tsx
function WindowSize() {
    const isMounted = useIsMounted();

    if (!isMounted) {
        return null;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    return <div>화면 크기: {width} x {height}</div>;
}
```

### 로컬스토리지 접근

SSR 환경에서 안전한 로컬스토리지 사용:

```tsx
function UserPreference() {
    const isMounted = useIsMounted();

    if (!isMounted) {
        return <DefaultTheme />;
    }

    const theme = localStorage.getItem('theme') || 'light';
    return <div className={theme}>콘텐츠</div>;
}
```

## 고급 예제

### 조건부 라이브러리 로딩

클라이언트 전용 라이브러리 동적 로드:

```tsx
import { useState, useEffect } from 'react';

function DynamicMap() {
    const isMounted = useIsMounted();
    const [MapComponent, setMapComponent] = useState(null);

    useEffect(() => {
        if (isMounted) {
            import('react-map-gl').then((mod) => {
                setMapComponent(() => mod.default);
            });
        }
    }, [isMounted]);

    if (!isMounted || !MapComponent) {
        return <MapPlaceholder />;
    }

    return <MapComponent />;
}
```

### 애니메이션 트리거

마운트 후 애니메이션 시작:

```tsx
function AnimatedEntry() {
    const isMounted = useIsMounted();

    return (
        <div
            className={`
                transition-all duration-500
                ${isMounted
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }
            `}
        >
            페이드 인 콘텐츠
        </div>
    );
}
```

### 써드파티 스크립트 로딩

클라이언트에서만 외부 스크립트 로드:

```tsx
function Analytics() {
    const isMounted = useIsMounted();

    useEffect(() => {
        if (isMounted) {
            const script = document.createElement('script');
            script.src = 'https://analytics.example.com/script.js';
            script.async = true;
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        }
    }, [isMounted]);

    return null;
}
```

### 랜덤 값 생성

서버/클라이언트 불일치 없는 랜덤 값:

```tsx
function RandomQuote() {
    const isMounted = useIsMounted();
    const [quote, setQuote] = useState('');

    useEffect(() => {
        if (isMounted) {
            const quotes = [
                'Stay hungry, stay foolish.',
                'Think different.',
                'Just do it.',
            ];
            setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
        }
    }, [isMounted]);

    if (!isMounted || !quote) {
        return <QuoteSkeleton />;
    }

    return <blockquote>{quote}</blockquote>;
}
```

### 지오로케이션

브라우저 위치 API 안전하게 사용:

```tsx
function LocationDetector() {
    const isMounted = useIsMounted();
    const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);

    useEffect(() => {
        if (isMounted && 'geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            });
        }
    }, [isMounted]);

    if (!isMounted) {
        return <div>위치 정보 로딩 중...</div>;
    }

    if (!location) {
        return <div>위치 정보를 가져올 수 없습니다.</div>;
    }

    return <div>현재 위치: {location.lat}, {location.lng}</div>;
}
```

### TypeScript와 함께

타입 가드로 활용:

```tsx
function TypeSafeClientCode() {
    const isMounted = useIsMounted();

    // isMounted가 true일 때만 window 접근
    const userAgent = isMounted ? window.navigator.userAgent : 'SSR';

    return (
        <div>
            {isMounted && (
                <div>
                    브라우저: {userAgent}
                    <ClientOnlyFeature />
                </div>
            )}
        </div>
    );
}

// 컴포넌트 Props로 전달
interface ClientGateProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

function ClientGate({ children, fallback = null }: ClientGateProps) {
    const isMounted = useIsMounted();
    return isMounted ? <>{children}</> : <>{fallback}</>;
}

// 사용
<ClientGate fallback={<Loading />}>
    <ClientOnlyFeature />
</ClientGate>
```

## 언제 사용할까

다음과 같은 경우 `useIsMounted`를 사용하세요:

✅ **SSR 하이드레이션 불일치 방지**
- 서버/클라이언트 다른 콘텐츠
- 날짜, 시간, 랜덤 값
- 동적 콘텐츠

✅ **브라우저 전용 API 사용**
- Window, Document, Navigator
- LocalStorage, SessionStorage
- Geolocation, WebGL 등

✅ **클라이언트 전용 라이브러리**
- 차트, 지도 라이브러리
- 애니메이션 라이브러리
- 브라우저 전용 기능

## 언제 사용하지 말아야 할까

❌ **정적 콘텐츠**
- SSR/클라이언트 동일한 콘텐츠
- 불필요한 체크

❌ **이미 SSR 안전한 API**
- React의 `useEffect` (자동으로 클라이언트만 실행)
- Next.js의 `dynamic` (ssr: false 옵션 사용)

❌ **단순 조건부 렌더링**
- CSS로 해결 가능한 경우
- 미디어 쿼리로 충분한 경우

## 일반적인 패턴

### ClientOnly 컴포넌트

재사용 가능한 클라이언트 전용 래퍼:

```tsx
interface ClientOnlyProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
    const isMounted = useIsMounted();

    if (!isMounted) return <>{fallback}</>;

    return <>{children}</>;
}

// 사용
<ClientOnly fallback={<Skeleton />}>
    <BrowserOnlyComponent />
</ClientOnly>
```

### Lazy Hydration

성능 최적화를 위한 지연 하이드레이션:

```tsx
function LazyHydrateComponent() {
    const isMounted = useIsMounted();
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        if (isMounted) {
            // 약간의 지연 후 하이드레이션
            const timer = setTimeout(() => setHydrated(true), 100);
            return () => clearTimeout(timer);
        }
    }, [isMounted]);

    if (!hydrated) {
        return <StaticPlaceholder />;
    }

    return <InteractiveComponent />;
}
```

## useIsMounted vs useEffect

| 기능             | useIsMounted | useEffect |
| ---------------- | ------------ | --------- |
| SSR 안전         | ✅ 명시적    | ✅ 자동   |
| 조건부 렌더링    | ✅ 적합      | ❌ 부적합 |
| 사이드 이펙트    | ❌           | ✅ 적합   |
| 코드 의도 명확성 | ✅ 높음      | 중간      |

### 예제 비교

```tsx
// useIsMounted - 조건부 렌더링
function Component1() {
    const isMounted = useIsMounted();

    if (!isMounted) return <Skeleton />;

    return <div>{window.innerWidth}</div>;
}

// useEffect - 사이드 이펙트
function Component2() {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        setWidth(window.innerWidth); // 자동으로 클라이언트만 실행
    }, []);

    return <div>{width || <Skeleton />}</div>;
}
```

## 구현 세부사항

- `useState`로 마운트 상태 관리
- `useEffect`로 마운트 후 상태 업데이트
- 초기값 `false`로 SSR 안전성 보장
- 중복 업데이트 방지 로직 포함
- 언마운트 처리 불필요 (상태만 관리)
- 최소한의 리렌더링 (한 번만 업데이트)
