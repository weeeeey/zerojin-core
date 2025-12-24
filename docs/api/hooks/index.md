# 훅 개요

zerojin은 기본적인 구현을 넘어서는 고급 기능을 갖춘 프로덕션급 React 훅을 제공합니다.

## 사용 가능한 훅

### 속도 제한

| 훅 | 설명 | 사용 사례 |
|------|-------------|----------|
| [useDebounce](/api/hooks/useDebounce) | 활동이 없을 때까지 실행을 지연 | 이벤트 핸들러, 콜백 함수 |
| [useInputDebounce](/api/hooks/useInputDebounce) | Input 값을 즉시 반영하고 debounced 값 제공 | 검색 입력, 폼 유효성 검사, 자동 저장 |
| [useThrottle](/api/hooks/useThrottle) | 일정 시간당 한 번만 실행 | 스크롤 이벤트, 마우스 추적 |

### 스토리지

| 훅 | 설명 | 사용 사례 |
|------|-------------|----------|
| [useLocalStorage](/api/hooks/useLocalStorage) | localStorage에 상태 동기화 (영구 저장, 탭 간 공유) | 사용자 설정, 테마, 장기 캐시 |
| [useSessionStorage](/api/hooks/useSessionStorage) | sessionStorage에 상태 동기화 (세션 저장, 탭 독립) | 폼 임시 저장, 위저드, 임시 토큰 |

### 탭 간 통신

| 훅 | 설명 | 사용 사례 |
|------|-------------|----------|
| [useBroadcastChannel](/api/hooks/useBroadcastChannel) | 브라우저 탭 간 타입 안전 메시지 브로드캐스트 | 실시간 동기화, 탭 간 이벤트, 멀티탭 조정 |

## 주요 기능

모든 zerojin 훅은 다음을 포함합니다:

### 1. Leading & Trailing 옵션

함수가 언제 실행될지 제어:

```tsx
// delay 후에 실행 (trailing)
useDebounce(callback, 500, { leading: false, trailing: true })

// 즉시 실행 (leading)
useThrottle(callback, 500, { leading: true, trailing: false })

// 둘 다 실행 (leading + trailing)
useDebounce(callback, 500, { leading: true, trailing: true })
```

### 2. Cancel & Flush 메서드

대기 중인 실행을 제어:

```tsx
const debouncedFn = useDebounce(callback, 500)

// 대기 중인 실행 취소
debouncedFn.cancel()

// 즉시 실행 (delay 우회)
debouncedFn.flush()
```

### 3. Stale Closure 방지

훅은 `useRef`를 사용하여 자동으로 최신 콜백을 참조합니다:

```tsx
function Component() {
  const [count, setCount] = useState(0)

  const handleClick = useDebounce(
    () => {
      // 항상 최신 count 값을 로그
      console.log(count)
    },
    500
  )

  // useCallback 필요 없음!
  return <button onClick={handleClick}>클릭</button>
}
```

### 4. 완벽한 TypeScript 지원

`Parameters<T>` 및 `ReturnType<T>`를 통한 완전한 타입 추론:

```tsx
const calculate = useDebounce(
  (a: number, b: number): number => a + b,
  300
)

calculate(10, 20)        // ✅ 타입 안전
calculate('wrong', 10)   // ❌ 컴파일 에러
```

## 올바른 훅 선택하기

| 시나리오 | 훅 | 이유 |
|----------|------|-----|
| 검색 입력 | useDebounce | 사용자가 입력을 멈출 때까지 대기 |
| 폼 유효성 검사 | useDebounce | 사용자가 입력을 마친 후 유효성 검사 |
| 스크롤 추적 | useThrottle | 주기적으로 위치 업데이트 |
| 윈도우 리사이즈 | useThrottle | 주기적으로 레이아웃 재계산 |
| 버튼 스팸 | useDebounce (leading) | 첫 클릭만 실행 |
| API 속도 제한 | useThrottle | 초당 최대 N개 요청 |
| 사용자 설정 저장 | useLocalStorage | 브라우저를 닫아도 유지 |
| 임시 폼 데이터 | useSessionStorage | 탭을 닫으면 자동 삭제 |
| 탭 간 상태 공유 | useLocalStorage | 모든 탭에서 자동 동기화 |
| 탭별 독립 상태 | useSessionStorage | 각 탭마다 별도 데이터 |
| 탭 간 메시지 전송 | useBroadcastChannel | 타입 안전한 이벤트 브로드캐스트 |

## 일반적인 패턴

### 언마운트 시 정리

```tsx
useEffect(() => {
  return () => {
    debouncedFn.cancel()  // 대기 중인 실행 취소
  }
}, [])
```

### Blur 시 즉시 실행

```tsx
<input
  onChange={(e) => handleSearch(e.target.value)}
  onBlur={() => handleSearch.flush()}  // 즉시 검색
/>
```

### 조건부 실행

```tsx
const handleSave = useDebounce(
  (data: FormData) => {
    if (data.isValid) {
      api.save(data)
    }
  },
  1000
)
```

## 다음 단계

### 속도 제한 훅
- [useDebounce API](/api/hooks/useDebounce) - 함수 debounce 완전한 문서
- [useInputDebounce API](/api/hooks/useInputDebounce) - Input debounce 완전한 문서
- [useThrottle API](/api/hooks/useThrottle) - 예제를 포함한 완전한 문서

### 스토리지 훅
- [useLocalStorage API](/api/hooks/useLocalStorage) - 영구 저장 및 탭 간 동기화
- [useSessionStorage API](/api/hooks/useSessionStorage) - 세션 저장 및 탭 독립 상태

### 탭 간 통신 훅
- [useBroadcastChannel API](/api/hooks/useBroadcastChannel) - 타입 안전한 탭 간 메시지 브로드캐스트
