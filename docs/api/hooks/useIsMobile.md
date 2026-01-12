# useIsMobile

모바일 디바이스 여부를 간단하게 확인할 수 있는 훅입니다. `useMediaQuery`의 편의 래퍼로 모바일 감지에 특화되어 있습니다.

## 시그니처

```typescript
//
// query default = '(max-width: 767px)'
function useIsMobile(query?: string): boolean;
```

## 파라미터

| 파라미터 | 타입     | 기본값                 | 설명                             |
| -------- | -------- | ---------------------- | -------------------------------- |
| `query`  | `string` | `'(max-width: 767px)'` | 모바일 감지에 사용할 미디어 쿼리 |

## 반환값

현재 뷰포트가 모바일 크기인지 여부를 나타내는 boolean 값을 반환합니다.

## 기본 예제

### 간단한 모바일 감지

기본 브레이크포인트로 모바일 여부 확인:

```tsx
import { useIsMobile } from 'zerojin';

function Navigation() {
    const isMobile = useIsMobile();

    return <nav>{isMobile ? <HamburgerMenu /> : <FullNavigation />}</nav>;
}
```

### 모바일 전용 기능

모바일에서만 특정 기능 활성화:

```tsx
function App() {
    const isMobile = useIsMobile();

    return (
        <div>
            <MainContent />
            {isMobile && <MobilePullToRefresh />}
            {isMobile && <BottomNavigation />}
        </div>
    );
}
```

### 조건부 스타일링

모바일/데스크톱 다른 스타일 적용:

```tsx
function Card() {
    const isMobile = useIsMobile();

    return (
        <div
            style={{
                padding: isMobile ? '12px' : '24px',
                fontSize: isMobile ? '14px' : '16px',
            }}
        >
            반응형 카드
        </div>
    );
}
```

## 고급 예제

### 커스텀 브레이크포인트

다른 모바일 크기 기준 사용:

```tsx
function SmallMobileDetector() {
    // 작은 모바일 (480px 이하)
    const isSmallMobile = useIsMobile('(max-width: 480px)');

    // 일반 모바일 (767px 이하, 기본값)
    const isMobile = useIsMobile();

    // 큰 모바일/작은 태블릿 (900px 이하)
    const isLargeMobile = useIsMobile('(max-width: 900px)');

    if (isSmallMobile) return <CompactView />;
    if (isMobile) return <MobileView />;
    return <DesktopView />;
}
```

### 모바일 최적화 이미지

모바일에서 작은 이미지 로드:

```tsx
function ResponsiveImage({ src, mobileSrc }: Props) {
    const isMobile = useIsMobile();

    return (
        <img src={isMobile ? mobileSrc : src} alt="Responsive" loading="lazy" />
    );
}
```

### 터치 이벤트 처리

모바일에서만 터치 제스처 활성화:

```tsx
function InteractiveCard() {
    const isMobile = useIsMobile();
    const [touchStart, setTouchStart] = useState(0);

    const handleTouch = isMobile
        ? {
              onTouchStart: (e) => setTouchStart(e.touches[0].clientX),
              onTouchEnd: (e) => {
                  const touchEnd = e.changedTouches[0].clientX;
                  const diff = touchStart - touchEnd;
                  if (Math.abs(diff) > 50) {
                      // 스와이프 처리
                      handleSwipe(diff > 0 ? 'left' : 'right');
                  }
              },
          }
        : {};

    return <div {...handleTouch}>스와이프 가능한 카드</div>;
}
```

### 모바일 전용 라이브러리 로딩

모바일에서만 필요한 라이브러리 조건부 로드:

```tsx
import { lazy, Suspense } from 'react';

const MobileGestures = lazy(() => import('react-mobile-gestures'));

function GestureContainer() {
    const isMobile = useIsMobile();

    if (!isMobile) {
        return <DesktopInteraction />;
    }

    return (
        <Suspense fallback={<Loading />}>
            <MobileGestures>
                <MobileContent />
            </MobileGestures>
        </Suspense>
    );
}
```

### 모바일 네비게이션 패턴

모바일/데스크톱 다른 네비게이션 구조:

```tsx
function Layout({ children }: Props) {
    const isMobile = useIsMobile();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div>
            {isMobile ? (
                <>
                    <Header>
                        <MenuButton onClick={() => setMenuOpen(true)} />
                    </Header>
                    <Drawer open={menuOpen} onClose={() => setMenuOpen(false)}>
                        <MobileMenu />
                    </Drawer>
                </>
            ) : (
                <Sidebar>
                    <DesktopMenu />
                </Sidebar>
            )}
            <main>{children}</main>
        </div>
    );
}
```

### TypeScript와 함께

타입 안전한 반응형 컴포넌트:

```tsx
interface ResponsiveProps {
    mobileComponent: React.ComponentType;
    desktopComponent: React.ComponentType;
    mobileBreakpoint?: string;
}

function ResponsiveRenderer({
    mobileComponent: Mobile,
    desktopComponent: Desktop,
    mobileBreakpoint,
}: ResponsiveProps) {
    const isMobile = useIsMobile(mobileBreakpoint);

    return isMobile ? <Mobile /> : <Desktop />;
}

// 사용
<ResponsiveRenderer
    mobileComponent={MobileView}
    desktopComponent={DesktopView}
    mobileBreakpoint="(max-width: 600px)"
/>;
```

## 언제 사용할까

다음과 같은 경우 `useIsMobile`를 사용하세요:

✅ **모바일/데스크톱 구분만 필요한 경우**

-   간단한 반응형 UI
-   모바일 전용 기능 토글
-   네비게이션 전환

✅ **빠른 프로토타이핑**

-   간단한 API로 빠른 구현
-   기본 브레이크포인트로 충분한 경우

✅ **일관된 모바일 기준**

-   앱 전체에서 동일한 모바일 정의 사용

## 언제 사용하지 말아야 할까

❌ **복잡한 미디어 쿼리가 필요한 경우**

-   `useMediaQuery` 사용
-   다크 모드, 방향 감지 등

❌ **여러 브레이크포인트 필요**

-   `useMediaQuery`로 각각 관리
-   더 세밀한 제어 필요

❌ **CSS만으로 충분한 경우**

-   CSS 미디어 쿼리 사용
-   JavaScript 오버헤드 불필요

## useIsMobile vs useMediaQuery

| 기능           | useIsMobile  | useMediaQuery |
| -------------- | ------------ | ------------- |
| 사용 편의성    | ✅ 매우 쉬움 | 중간          |
| 모바일 감지    | ✅ 특화됨    | ✅ 가능       |
| 다른 쿼리 지원 | ❌           | ✅ 모든 쿼리  |
| 코드 간결성    | ✅ 짧음      | 조금 더 김    |
| 기본값         | ✅ 767px     | ❌ 직접 지정  |

### 예제 비교

```tsx
// useIsMobile - 모바일 감지 전용
const isMobile = useIsMobile(); // 간단!
const isSmallMobile = useIsMobile('(max-width: 480px)'); // 커스텀 가능

// useMediaQuery - 범용
const isMobile = useMediaQuery('(max-width: 767px)'); // 같은 결과
const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)'); // 더 복잡한 쿼리
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)'); // 다른 쿼리도 가능
```

## 구현 세부사항

-   `useMediaQuery`의 래퍼로 구현
-   기본 브레이크포인트: `767px` (일반적인 모바일 최대 너비)
-   SSR 안전: 서버에서 `false` 반환
-   커스텀 쿼리 지원으로 유연성 유지
-   제로 오버헤드: `useMediaQuery`에 직접 위임
