# useSessionStorage

sessionStorage에 상태를 자동으로 동기화하고 같은 탭 내 컴포넌트 간 변경사항을 실시간으로 공유하는 React 훅입니다. 탭을 닫으면 데이터가 자동으로 삭제됩니다.

## 시그니처

```typescript
function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void]
```

## 파라미터

| 파라미터 | 타입 | 설명 |
|-----------|------|-------------|
| `key` | `string` | sessionStorage 키 |
| `initialValue` | `T` | 키가 존재하지 않을 때 사용할 초기값 |

## 반환값

튜플 형태로 3개의 값을 반환합니다:

1. **현재값** (`T`): 현재 저장된 값
2. **값 설정 함수** (`(value: T | ((prev: T) => T)) => void`): 값을 업데이트하는 함수
3. **값 제거 함수** (`() => void`): sessionStorage에서 값을 제거하고 초기값으로 되돌리는 함수

## 기본 예제

### 인증 토큰 저장

세션 동안만 유지되는 인증 토큰:

```tsx
import { useSessionStorage } from 'zerojin'

function AuthProvider() {
  const [token, setToken, removeToken] = useSessionStorage('authToken', '')

  const login = async (credentials: Credentials) => {
    const response = await api.login(credentials)
    setToken(response.token)
  }

  const logout = () => {
    removeToken()
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### 폼 임시 저장

탭을 닫으면 사라지는 폼 데이터:

```tsx
interface FormData {
  email: string
  message: string
  category: string
}

function ContactForm() {
  const [formData, setFormData] = useSessionStorage<FormData>('contactForm', {
    email: '',
    message: '',
    category: 'general'
  })

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    await api.submitForm(formData)
    // 제출 후 초기화
    setFormData({ email: '', message: '', category: 'general' })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.email}
        onChange={(e) => updateField('email', e.target.value)}
        placeholder="이메일"
      />
      <textarea
        value={formData.message}
        onChange={(e) => updateField('message', e.target.value)}
        placeholder="메시지"
      />
      <button type="submit">전송</button>
    </form>
  )
}
```

### 위저드 스텝 관리

여러 단계로 구성된 폼의 현재 위치 저장:

```tsx
interface WizardData {
  step1: { name: string; email: string }
  step2: { address: string; phone: string }
  step3: { payment: string }
}

function MultiStepWizard() {
  const [currentStep, setCurrentStep] = useSessionStorage('wizardStep', 0)
  const [wizardData, setWizardData] = useSessionStorage<Partial<WizardData>>('wizardData', {})

  const nextStep = () => setCurrentStep(prev => prev + 1)
  const prevStep = () => setCurrentStep(prev => prev - 1)

  const updateStepData = (step: keyof WizardData, data: any) => {
    setWizardData(prev => ({ ...prev, [step]: data }))
  }

  return (
    <div>
      {currentStep === 0 && <Step1 onNext={(data) => {
        updateStepData('step1', data)
        nextStep()
      }} />}
      {currentStep === 1 && <Step2 onNext={(data) => {
        updateStepData('step2', data)
        nextStep()
      }} onBack={prevStep} />}
      {currentStep === 2 && <Step3 onBack={prevStep} />}
    </div>
  )
}
```

## 고급 예제

### 필터 상태 저장

검색 및 필터 상태를 세션에 저장:

```tsx
interface FilterState {
  search: string
  category: string
  priceRange: [number, number]
  sortBy: 'name' | 'price' | 'date'
}

function ProductList() {
  const [filters, setFilters] = useSessionStorage<FilterState>('productFilters', {
    search: '',
    category: 'all',
    priceRange: [0, 1000],
    sortBy: 'name'
  })

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div>
      <input
        value={filters.search}
        onChange={(e) => updateFilter('search', e.target.value)}
        placeholder="검색..."
      />
      <select
        value={filters.category}
        onChange={(e) => updateFilter('category', e.target.value)}
      >
        <option value="all">전체</option>
        <option value="electronics">전자제품</option>
        <option value="clothing">의류</option>
      </select>
    </div>
  )
}
```

### 임시 장바구니

세션 동안만 유지되는 장바구니:

```tsx
interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

function ShoppingCart() {
  const [cart, setCart, clearCart] = useSessionStorage<CartItem[]>('tempCart', [])

  const addItem = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div>
      <h2>임시 장바구니 (세션 종료 시 삭제)</h2>
      {cart.map(item => (
        <div key={item.id}>
          {item.name} - {item.quantity}개 - ${item.price * item.quantity}
          <button onClick={() => removeItem(item.id)}>삭제</button>
        </div>
      ))}
      <div>총액: ${total}</div>
      <button onClick={clearCart}>전체 비우기</button>
    </div>
  )
}
```

### 탭별 설정

각 탭마다 다른 설정을 유지:

```tsx
interface TabSettings {
  fontSize: number
  compactView: boolean
  sidebarOpen: boolean
}

function Editor() {
  const [settings, setSettings] = useSessionStorage<TabSettings>('editorSettings', {
    fontSize: 14,
    compactView: false,
    sidebarOpen: true
  })

  return (
    <div>
      <p className="info">
        각 탭마다 독립적인 설정을 가집니다!
        새 탭을 열면 기본 설정으로 시작합니다.
      </p>
      <label>
        글자 크기:
        <input
          type="number"
          value={settings.fontSize}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            fontSize: Number(e.target.value)
          }))}
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={settings.compactView}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            compactView: e.target.checked
          }))}
        />
        간소 보기
      </label>
    </div>
  )
}
```

### 같은 탭 내 동기화

같은 키를 사용하는 여러 컴포넌트가 자동으로 동기화됩니다:

```tsx
// ComponentA.tsx
function StepProgress() {
  const [currentStep, setCurrentStep] = useSessionStorage('step', 0)

  return (
    <button onClick={() => setCurrentStep(currentStep + 1)}>
      다음 단계
    </button>
  )
}

// ComponentB.tsx
function StepIndicator() {
  const [currentStep] = useSessionStorage('step', 0)

  return <div>현재 단계: {currentStep + 1}/5</div>
}

// ComponentA에서 단계를 변경하면 ComponentB도 즉시 업데이트됩니다!
```

### 새로고침 후 복원

페이지를 새로고침해도 세션 동안 데이터 유지:

```tsx
function DraftEditor() {
  const [draft, setDraft] = useSessionStorage('draft', '')
  const [lastSaved, setLastSaved] = useSessionStorage('lastSaved', 0)

  useEffect(() => {
    if (lastSaved > 0) {
      const savedAt = new Date(lastSaved).toLocaleTimeString()
      console.log(`자동 저장된 초안 복원됨 (${savedAt})`)
    }
  }, [])

  const handleChange = (value: string) => {
    setDraft(value)
    setLastSaved(Date.now())
  }

  return (
    <div>
      <textarea
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="작성 중인 내용이 세션에 자동 저장됩니다"
      />
      {lastSaved > 0 && (
        <p>마지막 저장: {new Date(lastSaved).toLocaleTimeString()}</p>
      )}
    </div>
  )
}
```

## 주요 기능

### 1. 세션 단위 저장

- 브라우저 탭을 닫으면 자동으로 삭제
- 새로고침 시에는 데이터 유지
- 각 탭마다 독립적인 저장소

### 2. 자동 JSON 직렬화

모든 JavaScript 값을 자동으로 직렬화/역직렬화:

```tsx
// 객체
const [user, setUser] = useSessionStorage('user', { name: 'John' })

// 배열
const [items, setItems] = useSessionStorage('items', [1, 2, 3])

// 불리언
const [flag, setFlag] = useSessionStorage('flag', true)
```

### 3. SSR 안전

서버 사이드 렌더링 환경에서 안전하게 작동:

```tsx
// Next.js에서도 안전
function MyComponent() {
  const [value, setValue] = useSessionStorage('key', 'default')
  return <div>{value}</div>
}
```

### 4. 같은 탭 내 동기화

같은 키를 사용하는 컴포넌트들이 실시간 동기화됩니다.

## 언제 사용할까

✅ **다음과 같은 경우 사용하세요:**

- **임시 인증 토큰**: 세션 종료 시 자동 삭제
- **폼 임시 저장**: 새로고침 시 복원, 탭 닫으면 삭제
- **위저드/다단계 폼**: 단계별 데이터 임시 저장
- **검색/필터 상태**: 탭마다 독립적인 필터
- **임시 장바구니**: 세션 동안만 유지
- **탭별 UI 설정**: 각 탭마다 다른 레이아웃

✅ **장점:**

- 탭을 닫으면 자동 정리 (메모리 효율적)
- 새로고침 시 데이터 복원
- 같은 탭 내 컴포넌트 간 자동 동기화
- 각 탭마다 독립적인 데이터
- TypeScript 완벽 지원

## 언제 사용하지 말아야 할까

❌ **다음과 같은 경우 사용하지 마세요:**

- **장기 저장이 필요한 데이터**
  - `useLocalStorage` 사용 (브라우저를 닫아도 유지)

- **여러 탭에서 공유해야 하는 데이터**
  - `useLocalStorage` 사용 (모든 탭에서 공유)
  - `useBroadcastChannel` 사용 (탭 간 메시지 브로드캐스트)

- **민감한 정보** (비밀번호, 신용카드 등)
  - sessionStorage도 암호화되지 않음

- **서버 동기화가 필요한 데이터**
  - React Query나 SWR 사용

## localStorage vs sessionStorage

| 특성 | useLocalStorage | useSessionStorage |
|------|-----------------|-------------------|
| **데이터 유지** | 브라우저를 닫아도 유지 | 탭을 닫으면 삭제 |
| **탭 간 공유** | ✅ 모든 탭에서 공유 | ❌ 탭마다 독립적 |
| **새로고침** | ✅ 데이터 유지 | ✅ 데이터 유지 |
| **용도** | 장기 저장 (설정, 캐시) | 임시 저장 (폼, 위저드) |
| **자동 정리** | 수동으로 삭제 필요 | 탭 닫으면 자동 삭제 |

## 사용 사례 비교

| 시나리오 | localStorage | sessionStorage |
|---------|--------------|----------------|
| 사용자 설정 (테마, 언어) | ✅ | ❌ |
| 인증 토큰 (자동 로그인) | ✅ | ❌ |
| 인증 토큰 (세션만) | ❌ | ✅ |
| 폼 임시 저장 | ❌ | ✅ |
| 위저드 진행 상태 | ❌ | ✅ |
| 검색 기록 | ✅ | ❌ |
| 임시 필터 설정 | ❌ | ✅ |
| 장바구니 (영구) | ✅ | ❌ |
| 장바구니 (임시) | ❌ | ✅ |

## 구현 세부사항

- **자동 동기화**: 커스텀 이벤트를 사용하여 같은 탭 내 컴포넌트 동기화
- **탭 독립성**: 각 탭마다 독립적인 sessionStorage 사용
- **메모리 효율**: 탭을 닫으면 자동으로 데이터 정리
- **타입 안전**: 제네릭을 통한 완벽한 타입 추론
- **에러 복원력**: try-catch로 모든 sessionStorage 작업 보호
- **SSR 호환**: `typeof window !== 'undefined'` 체크

## 참고

- [useLocalStorage](/api/hooks/useLocalStorage) - 영구 저장
- [useBroadcastChannel](/api/hooks/useBroadcastChannel) - 탭 간 메시지 브로드캐스트
- [훅 개요](/api/hooks/) - 사용 가능한 모든 훅
