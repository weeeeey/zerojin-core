# useDebounce

디바운스된 함수가 마지막으로 호출된 이후 지정된 delay가 경과할 때까지 콜백 실행을 지연시키는 디바운스 함수를 생성합니다.

## 시그니처

```typescript
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay?: number,
  options?: DebounceOptions
): DebouncedFunction<T>

interface DebounceOptions {
  leading?: boolean   // 첫 호출 시 실행 (기본값: false)
  trailing?: boolean  // delay 후 실행 (기본값: true)
}

interface DebouncedFunction<T> {
  (...args: Parameters<T>): ReturnType<T> | undefined
  cancel: () => void
  flush: () => void
}
```

## 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|-----------|------|---------|-------------|
| `callback` | `T extends Function` | 필수 | 디바운스할 함수 |
| `delay` | `number` | `500` | 밀리초 단위 지연 시간 |
| `options` | `DebounceOptions` | `{ leading: false, trailing: true }` | 디바운스 동작 옵션 |

### 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|--------|------|---------|-------------|
| `leading` | `boolean` | `false` | 첫 호출 시 콜백 실행 (leading edge) |
| `trailing` | `boolean` | `true` | delay 후 콜백 실행 (trailing edge) |

## 반환값

원본 콜백과 동일한 시그니처를 가진 디바운스 함수를 반환하며, 두 가지 제어 메서드가 추가됩니다:

- **`cancel()`**: 대기 중인 실행을 취소
- **`flush()`**: 대기 중인 콜백을 즉시 실행

## 기본 예제

### 검색 입력

가장 일반적인 사용 사례 - 사용자가 입력을 멈출 때까지 API 호출을 지연:

```tsx
import { useDebounce } from 'zerojin'

function SearchInput() {
  const handleSearch = useDebounce(
    (query: string) => {
      console.log('검색:', query)
      fetch(`/api/search?q=${query}`)
        .then(res => res.json())
        .then(results => setResults(results))
    },
    500
  )

  return (
    <input
      type="text"
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="검색..."
    />
  )
}
```

### 폼 유효성 검사

사용자가 입력을 멈춘 후 폼 필드 유효성 검사:

```tsx
function EmailInput() {
  const [error, setError] = useState('')

  const validateEmail = useDebounce(
    (email: string) => {
      if (!email.includes('@')) {
        setError('유효하지 않은 이메일')
      } else {
        setError('')
      }
    },
    300
  )

  return (
    <div>
      <input
        type="email"
        onChange={(e) => validateEmail(e.target.value)}
      />
      {error && <span className="error">{error}</span>}
    </div>
  )
}
```

### 버튼 클릭 보호 (Leading)

첫 클릭만 실행하여 버튼 스팸 방지:

```tsx
function SubmitButton() {
  const handleSubmit = useDebounce(
    () => {
      console.log('폼 제출됨')
      api.submitForm()
    },
    2000,
    { leading: true, trailing: false }  // 첫 클릭만
  )

  return (
    <button onClick={handleSubmit}>
      제출
    </button>
  )
}
```

## 고급 예제

### cancel() 메서드 사용

컴포넌트가 언마운트될 때 대기 중인 실행 취소:

```tsx
function SearchComponent() {
  const handleSearch = useDebounce(
    (query: string) => api.search(query),
    500
  )

  useEffect(() => {
    return () => {
      // 언마운트 시 대기 중인 검색 취소
      handleSearch.cancel()
    }
  }, [])

  return <input onChange={(e) => handleSearch(e.target.value)} />
}
```

### flush() 메서드 사용

사용자가 포커스를 잃을 때 즉시 실행:

```tsx
function AutoSaveInput() {
  const handleSave = useDebounce(
    (value: string) => {
      console.log('저장:', value)
      api.save(value)
    },
    1000
  )

  return (
    <input
      onChange={(e) => handleSave(e.target.value)}
      onBlur={() => handleSave.flush()}  // blur 시 즉시 저장
    />
  )
}
```

### Leading + Trailing

첫 호출과 delay 후 모두 실행:

```tsx
function TrackingButton() {
  const trackClick = useDebounce(
    () => {
      console.log('사용자 클릭')
      analytics.track('button_click')
    },
    1000,
    { leading: true, trailing: true }
  )

  return <button onClick={trackClick}>추적하기</button>
}
```

### TypeScript와 함께

파라미터와 반환값에 대한 완벽한 타입 추론:

```tsx
// 특정 타입을 가진 함수
const calculate = useDebounce(
  (a: number, b: number): number => {
    return a + b
  },
  300
)

// TypeScript가 시그니처를 알고 있음
const result = calculate(10, 20)  // result: number | undefined
calculate('invalid', 20)           // ❌ 타입 에러
```

### 복잡한 데이터 타입

모든 함수 시그니처와 작동:

```tsx
interface User {
  id: number
  name: string
}

const updateUser = useDebounce(
  (user: User, options?: { notify: boolean }) => {
    console.log('업데이트:', user)
    api.updateUser(user, options)
  },
  500
)

// 타입 안전 사용
updateUser({ id: 1, name: 'John' }, { notify: true })
```

## 언제 사용할까

다음과 같은 경우 `useDebounce`를 사용하세요:

✅ **사용자가 작업을 멈출 때까지 대기**
- 검색 입력
- 폼 유효성 검사
- 자동 저장 에디터

✅ **마지막 호출만 실행**
- 사용자 입력 기반 API 호출
- 윈도우 리사이즈 핸들러 (최종 크기만 필요한 경우)

✅ **빠른 연속 호출 방지**
- 버튼 스팸 보호 (`leading: true` 사용)

## 언제 사용하지 말아야 할까

❌ **연속 이벤트 중 주기적 실행이 필요한 경우**
- 스크롤 추적에는 `useThrottle` 사용
- 마우스 이동 추적에는 `useThrottle` 사용

❌ **즉시 실행이 필요한 경우**
- 함수를 직접 호출하세요

## Debounce vs Throttle

| 시나리오 | useDebounce | useThrottle |
|----------|-------------|-------------|
| 검색 입력 | ✅ 입력이 멈출 때까지 대기 | ❌ 입력 중에도 검색 |
| 스크롤 추적 | ❌ 끝에서만 실행 | ✅ 주기적으로 업데이트 |
| 자동 저장 | ✅ 편집이 끝난 후 저장 | ❌ 너무 자주 저장 |
| 속도 제한 | ❌ 예측 불가능한 타이밍 | ✅ 최대 속도 보장 |

## 구현 세부사항

- stale closure 문제를 방지하기 위해 `useRef` 사용
- 안정적인 함수 참조를 위해 `useCallback` 사용
- 언마운트 시 타이머를 자동으로 정리
- Leading edge는 쿨다운 기간을 생성
- Trailing edge는 각 호출마다 재설정

## 참고

- [useThrottle](/api/hooks/useThrottle) - 실행 빈도 제한
- [훅 개요](/api/hooks/) - 사용 가능한 모든 훅
