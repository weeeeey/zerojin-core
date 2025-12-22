# useThrottle

지정된 delay 기간당 최대 한 번만 콜백을 실행하는 스로틀 함수를 생성합니다.

## 시그니처

```typescript
function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay?: number,
  options?: ThrottleOptions
): ThrottledFunction<T>

interface ThrottleOptions {
  leading?: boolean   // 첫 호출 시 실행 (기본값: true)
  trailing?: boolean  // 기간 후 실행 (기본값: false)
}

interface ThrottledFunction<T> {
  (...args: Parameters<T>): ReturnType<T> | undefined
  cancel: () => void
  flush: () => void
}
```

## 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `callback` | `T extends Function` | 필수 | 스로틀할 함수 |
| `delay` | `number` | `500` | 밀리초 단위 스로틀 기간 |
| `options` | `ThrottleOptions` | `{ leading: true, trailing: false }` | 스로틀 동작 옵션 |

### 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|--------|------|---------|-------------|
| `leading` | `boolean` | `true` | 첫 호출 시 콜백을 즉시 실행 (leading edge) |
| `trailing` | `boolean` | `false` | delay 기간 후 콜백 실행 (trailing edge) |

## 반환값

원본 콜백과 동일한 시그니처를 가진 스로틀 함수를 반환하며, 두 가지 제어 메서드가 추가됩니다:

- **`cancel()`**: 대기 중인 실행을 취소하고 타이머를 리셋
- **`flush()`**: 대기 중인 콜백을 즉시 실행

## 기본 예제

### 스크롤 위치 추적

스크롤 위치를 기반으로 UI를 업데이트하지만, 모든 픽셀마다 업데이트하지 않음:

```tsx
import { useThrottle } from 'zerojin'

function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0)

  const handleScroll = useThrottle(
    () => {
      setScrollY(window.scrollY)
      console.log('스크롤 위치:', window.scrollY)
    },
    200  // 200ms마다 최대 한 번 업데이트
  )

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      handleScroll.flush()  // 최종 위치 가져오기
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return <div>현재 스크롤: {scrollY}px</div>
}
```

### 윈도우 리사이즈 핸들러

리사이즈 중 주기적으로 레이아웃 재계산:

```tsx
function ResponsiveLayout() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  const handleResize = useThrottle(
    () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    },
    300
  )

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return <div>윈도우: {dimensions.width}x{dimensions.height}</div>
}
```

### 버튼 클릭 속도 제한

사용자가 액션 버튼을 스팸하는 것을 방지:

```tsx
function RefreshButton() {
  const handleRefresh = useThrottle(
    () => {
      console.log('데이터 새로고침...')
      api.fetchData()
    },
    2000,  // 2초마다 최대 한 번
    { leading: true, trailing: false }
  )

  return (
    <button onClick={handleRefresh}>
      데이터 새로고침
    </button>
  )
}
```

## 고급 예제

### 마우스 위치 추적

성능을 압도하지 않으면서 마우스 움직임 추적:

```tsx
function MouseTracker() {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const trackMouse = useThrottle(
    (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    },
    100  // 초당 최대 10회 업데이트
  )

  useEffect(() => {
    window.addEventListener('mousemove', trackMouse)
    return () => window.removeEventListener('mousemove', trackMouse)
  }, [])

  return <div>마우스: ({position.x}, {position.y})</div>
}
```

### API 속도 제한

API 호출이 속도 제한을 초과하지 않도록 보장:

```tsx
function DataFetcher() {
  const fetchData = useThrottle(
    (endpoint: string) => {
      console.log('가져오는 중:', endpoint)
      fetch(endpoint)
        .then(res => res.json())
        .then(data => console.log(data))
    },
    1000  // 초당 최대 1개 요청
  )

  return (
    <div>
      <button onClick={() => fetchData('/api/users')}>사용자 가져오기</button>
      <button onClick={() => fetchData('/api/posts')}>게시물 가져오기</button>
    </div>
  )
}
```

### Trailing Edge 예제

활동이 끝날 때 실행 (디바운스와 유사하지만 최대 대기 시간 있음):

```tsx
function AutoSaveEditor() {
  const saveContent = useThrottle(
    (content: string) => {
      console.log('저장:', content)
      api.save(content)
    },
    5000,  // 최소 5초마다 저장
    { leading: false, trailing: true }
  )

  return (
    <textarea onChange={(e) => saveContent(e.target.value)} />
  )
}
```

### 언마운트 시 flush() 사용

컴포넌트가 언마운트될 때 최종 실행 보장:

```tsx
function Analytics() {
  const trackEvent = useThrottle(
    (event: string) => {
      analytics.track(event)
    },
    1000
  )

  useEffect(() => {
    return () => {
      // 언마운트 전 최종 이벤트 전송
      trackEvent.flush()
    }
  }, [])

  return <button onClick={() => trackEvent('click')}>추적</button>
}
```

### 무한 스크롤

사용자가 스크롤할 때 더 많은 콘텐츠를 로드하지만, 너무 자주 로드하지 않음:

```tsx
function InfiniteScroll() {
  const loadMore = useThrottle(
    () => {
      const scrollPosition = window.scrollY + window.innerHeight
      const pageHeight = document.documentElement.scrollHeight

      if (scrollPosition >= pageHeight - 100) {
        console.log('더 로드 중...')
        api.loadMoreItems()
      }
    },
    500
  )

  useEffect(() => {
    window.addEventListener('scroll', loadMore)
    return () => window.removeEventListener('scroll', loadMore)
  }, [])

  return <div>스크롤하여 더 로드...</div>
}
```

### TypeScript와 함께

완벽한 타입 추론:

```tsx
const processData = useThrottle(
  (data: { id: number; name: string }) => {
    console.log('처리 중:', data)
    return data.id
  },
  1000
)

// 타입 안전
const result = processData({ id: 1, name: 'John' })  // number | undefined
processData({ invalid: true })  // ❌ 타입 에러
```

## 언제 사용할까

다음과 같은 경우 `useThrottle`을 사용하세요:

✅ **실행 빈도 제한**
- 스크롤 이벤트 핸들러
- 윈도우 리사이즈 핸들러
- 마우스/터치 이동 추적

✅ **최대 실행 속도 보장**
- API 속도 제한
- 분석 추적
- 성능 모니터링

✅ **연속 이벤트 중 주기적 실행**
- 사용자 상호작용 중 실시간 업데이트
- 진행 상황 추적

## 언제 사용하지 말아야 할까

❌ **최종 값만 필요한 경우**
- 검색 입력에는 `useDebounce` 사용
- 폼 유효성 검사에는 `useDebounce` 사용

❌ **일회성 이벤트의 경우**
- 함수를 직접 호출하세요

## Debounce vs Throttle

| 시나리오 | useThrottle | useDebounce |
|----------|-------------|-------------|
| 스크롤 추적 | ✅ 주기적으로 업데이트 | ❌ 끝에서만 실행 |
| 검색 입력 | ❌ 입력 중에도 검색 | ✅ 입력이 멈출 때까지 대기 |
| 속도 제한 | ✅ 최대 속도 보장 | ❌ 예측 불가능한 타이밍 |
| 자동 저장 | ⚠️ 너무 자주 저장할 수 있음 | ✅ 편집이 끝난 후 저장 |

## Throttle 동작

### Leading Edge (기본값)

```
사용자 입력:  ●●●●●●●●●●●●●●●●●●●●
실행:        ↓      ↓      ↓
시간:        0ms    500ms  1000ms
```

첫 호출은 즉시 실행되고, 후속 호출은 delay가 경과할 때까지 무시됩니다.

### Trailing Edge

```
사용자 입력:  ●●●●●●●●●●●●●●●●●●●●
실행:              ↓      ↓      ↓
시간:        0ms   500ms  1000ms 1500ms
```

호출은 delay 기간 후 실행되도록 예약됩니다.

### Leading + Trailing

```
사용자 입력:  ●●●●●●●●●●●●●●●●●●●●
실행:        ↓     ↓↓     ↓↓
시간:        0ms   500ms  1000ms
```

즉시 실행되고 delay 후에도 실행됩니다.

## 구현 세부사항

- stale closure 문제를 방지하기 위해 `useRef` 사용
- 안정적인 함수 참조를 위해 `useCallback` 사용
- 언마운트 시 타이머를 자동으로 정리
- Leading edge는 쿨다운 기간을 생성
- Trailing edge는 기간 끝에 실행을 예약

## 참고

- [useDebounce](/api/hooks/useDebounce) - 활동이 없을 때까지 지연
- [훅 개요](/api/hooks/) - 사용 가능한 모든 훅
