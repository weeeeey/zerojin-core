# useLocalStorage

localStorage에 상태를 자동으로 동기화하고 다른 탭과 같은 탭 내 컴포넌트 간 변경사항을 실시간으로 공유하는 React 훅입니다.

## 시그니처

```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void]
```

## 파라미터

| 파라미터 | 타입 | 설명 |
|-----------|------|-------------|
| `key` | `string` | localStorage 키 |
| `initialValue` | `T` | 키가 존재하지 않을 때 사용할 초기값 |

## 반환값

튜플 형태로 3개의 값을 반환합니다:

1. **현재값** (`T`): 현재 저장된 값
2. **값 설정 함수** (`(value: T | ((prev: T) => T)) => void`): 값을 업데이트하는 함수
3. **값 제거 함수** (`() => void`): localStorage에서 값을 제거하고 초기값으로 되돌리는 함수

## 기본 예제

### 간단한 문자열 저장

```tsx
import { useLocalStorage } from 'zerojin'

function UserProfile() {
  const [name, setName, removeName] = useLocalStorage('userName', '')

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름을 입력하세요"
      />
      <button onClick={removeName}>초기화</button>
      <p>저장된 이름: {name}</p>
    </div>
  )
}
```

### 객체 저장

```tsx
interface Settings {
  theme: 'light' | 'dark'
  notifications: boolean
  language: string
}

function AppSettings() {
  const [settings, setSettings] = useLocalStorage<Settings>('settings', {
    theme: 'light',
    notifications: true,
    language: 'ko'
  })

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }))
  }

  const toggleNotifications = () => {
    setSettings(prev => ({
      ...prev,
      notifications: !prev.notifications
    }))
  }

  return (
    <div>
      <button onClick={toggleTheme}>
        테마: {settings.theme}
      </button>
      <button onClick={toggleNotifications}>
        알림: {settings.notifications ? 'ON' : 'OFF'}
      </button>
    </div>
  )
}
```

### 배열 저장

```tsx
function TodoList() {
  const [todos, setTodos, clearTodos] = useLocalStorage<string[]>('todos', [])

  const addTodo = (todo: string) => {
    setTodos(prev => [...prev, todo])
  }

  const removeTodo = (index: number) => {
    setTodos(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div>
      <button onClick={() => addTodo('새 할일')}>추가</button>
      <button onClick={clearTodos}>전체 삭제</button>
      <ul>
        {todos.map((todo, i) => (
          <li key={i}>
            {todo}
            <button onClick={() => removeTodo(i)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## 고급 예제

### 함수형 업데이트

이전 상태를 기반으로 새로운 값 계산:

```tsx
function Counter() {
  const [count, setCount] = useLocalStorage('counter', 0)

  const increment = () => {
    setCount(prev => prev + 1)  // 함수형 업데이트
  }

  const decrement = () => {
    setCount(prev => prev - 1)
  }

  return (
    <div>
      <p>카운트: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  )
}
```

### 복잡한 타입

```tsx
interface UserData {
  profile: {
    name: string
    email: string
    avatar?: string
  }
  preferences: {
    theme: 'light' | 'dark'
    language: string
  }
  lastLogin: number
}

function UserDashboard() {
  const [userData, setUserData] = useLocalStorage<UserData>('user', {
    profile: {
      name: '',
      email: '',
    },
    preferences: {
      theme: 'light',
      language: 'ko',
    },
    lastLogin: Date.now(),
  })

  const updateProfile = (name: string, email: string) => {
    setUserData(prev => ({
      ...prev,
      profile: { ...prev.profile, name, email }
    }))
  }

  return (
    <div>
      <h1>{userData.profile.name}</h1>
      <p>{userData.profile.email}</p>
    </div>
  )
}
```

### 다중 컴포넌트 동기화

같은 키를 사용하는 여러 컴포넌트가 자동으로 동기화됩니다:

```tsx
// ComponentA.tsx
function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('theme', 'light')

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      테마 변경
    </button>
  )
}

// ComponentB.tsx
function ThemeDisplay() {
  const [theme] = useLocalStorage('theme', 'light')

  return <div className={theme}>현재 테마: {theme}</div>
}

// ComponentA에서 테마를 변경하면 ComponentB도 즉시 업데이트됩니다!
```

### 다중 탭 동기화

다른 브라우저 탭에서 변경된 값도 자동으로 동기화됩니다:

```tsx
function SyncedCounter() {
  const [count, setCount] = useLocalStorage('globalCounter', 0)

  return (
    <div>
      <p>카운트: {count}</p>
      <button onClick={() => setCount(count + 1)}>증가</button>
      <p className="hint">
        다른 탭을 열어보세요. 모든 탭이 동기화됩니다!
      </p>
    </div>
  )
}
```

### TypeScript와 함께

완벽한 타입 안전성:

```tsx
// 타입 추론
const [name, setName] = useLocalStorage('name', 'John')
// name: string
// setName: (value: string | ((prev: string) => string)) => void

// 명시적 타입
interface Config {
  apiUrl: string
  timeout: number
}

const [config, setConfig] = useLocalStorage<Config>('config', {
  apiUrl: 'https://api.example.com',
  timeout: 5000
})
// config: Config
// setConfig: (value: Config | ((prev: Config) => Config)) => void

// 타입 에러 방지
setConfig({ apiUrl: 'new-url' })  // ❌ 에러: timeout이 없음
setConfig({ apiUrl: 'new-url', timeout: 3000 })  // ✅ OK
```

## 주요 기능

### 1. 자동 JSON 직렬화

객체, 배열, 원시 타입 모두 자동으로 직렬화/역직렬화됩니다:

```tsx
// 객체
const [user, setUser] = useLocalStorage('user', { name: 'John', age: 30 })

// 배열
const [items, setItems] = useLocalStorage('items', [1, 2, 3])

// 불리언
const [isEnabled, setIsEnabled] = useLocalStorage('enabled', true)

// 숫자
const [count, setCount] = useLocalStorage('count', 0)
```

### 2. SSR 안전

서버 사이드 렌더링 환경에서도 안전하게 작동:

```tsx
// Next.js에서 안전하게 사용 가능
function MyComponent() {
  const [value, setValue] = useLocalStorage('key', 'default')
  // SSR 중에는 초기값 사용, 클라이언트에서 hydration 후 localStorage 값 사용

  return <div>{value}</div>
}
```

### 3. 에러 처리

localStorage 에러 자동 처리:

```tsx
// localStorage가 가득 차거나 접근 불가능한 경우에도 안전
const [data, setData] = useLocalStorage('data', defaultValue)
// 에러 발생 시 콘솔에 경고 출력 및 초기값 사용
```

### 4. 실시간 동기화

- **같은 탭 내**: 여러 컴포넌트가 같은 키를 사용하면 즉시 동기화
- **다른 탭 간**: 브라우저의 storage 이벤트를 통해 자동 동기화

```tsx
// Tab A
function ComponentA() {
  const [count, setCount] = useLocalStorage('counter', 0)
  return <button onClick={() => setCount(count + 1)}>증가</button>
}

// Tab B - 자동으로 업데이트됨!
function ComponentB() {
  const [count] = useLocalStorage('counter', 0)
  return <div>카운트: {count}</div>
}
```

## 언제 사용할까

✅ **다음과 같은 경우 사용하세요:**

- 사용자 설정 저장 (테마, 언어 등)
- 폼 데이터 임시 저장
- 사용자 인증 토큰 저장
- 앱 상태를 세션 간 유지
- 여러 탭 간 데이터 공유 필요
- 오프라인 데이터 캐싱

✅ **장점:**

- 브라우저를 닫아도 데이터 유지
- 다른 탭과 자동 동기화
- 같은 탭 내 컴포넌트 간 자동 동기화
- TypeScript 완벽 지원
- SSR 안전

## 언제 사용하지 말아야 할까

❌ **다음과 같은 경우 사용하지 마세요:**

- **민감한 정보 저장** (비밀번호, 신용카드 등)
  - localStorage는 암호화되지 않음
  - XSS 공격에 취약

- **큰 데이터 저장** (보통 5-10MB 제한)
  - 대용량 파일이나 이미지는 IndexedDB 사용

- **서버와 동기화가 필요한 데이터**
  - 서버 상태는 React Query나 SWR 사용

- **탭마다 다른 값이 필요한 경우**
  - `useSessionStorage` 사용

## localStorage vs sessionStorage

| 특성 | useLocalStorage | useSessionStorage |
|------|-----------------|-------------------|
| 데이터 유지 | 브라우저를 닫아도 유지 | 탭을 닫으면 삭제 |
| 탭 간 공유 | ✅ 모든 탭에서 공유 | ❌ 탭마다 독립적 |
| 용도 | 장기 저장 (설정, 캐시) | 임시 저장 (폼, 위저드) |

## 구현 세부사항

- **자동 동기화**: `StorageEvent`와 커스텀 이벤트를 사용하여 모든 컴포넌트 동기화
- **메모리 효율**: `useRef`로 이벤트 리스너 최적화
- **타입 안전**: 제네릭을 통한 완벽한 타입 추론
- **에러 복원력**: try-catch로 모든 localStorage 작업 보호
- **SSR 호환**: `typeof window !== 'undefined'` 체크

## 참고

- [useSessionStorage](/api/hooks/useSessionStorage) - 탭 단위 임시 저장
- [useBroadcastChannel](/api/hooks/useBroadcastChannel) - 탭 간 메시지 브로드캐스트
- [훅 개요](/api/hooks/) - 사용 가능한 모든 훅
