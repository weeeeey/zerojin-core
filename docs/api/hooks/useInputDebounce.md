# useInputDebounce

input 값의 즉각적인 상태 업데이트와 debounced된 값을 함께 제공하는 React 훅입니다. 검색 입력, 자동 저장, 폼 검증 등에 최적화되어 있습니다.

## 시그니처

```typescript
function useInputDebounce<T>(
    initialValue: T,
    delay?: number
): [T, T, (value: T) => void];
```

## 파라미터

| 파라미터       | 타입     | 설명                                       |
| -------------- | -------- | ------------------------------------------ |
| `initialValue` | `T`      | 초기값                                     |
| `delay`        | `number` | 디바운스 지연 시간 (밀리초, 기본값: 500ms) |

## 반환값

튜플 형태로 3개의 값을 반환합니다:

1. **value** (`T`): 즉각적으로 업데이트되는 값 (input 바인딩용)
2. **debouncedValue** (`T`): 디바운스된 값 (API 호출, 검증 등에 사용)
3. **setValue** (`(value: T) => void`): 값을 업데이트하는 함수

## 기본 예제

### 검색 입력

사용자가 입력을 멈출 때까지 기다렸다가 API 호출:

```tsx
import { useInputDebounce } from 'zerojin';
import { useEffect } from 'react';

function SearchInput() {
    const [query, debouncedQuery, setQuery] = useInputDebounce('', 500);

    useEffect(() => {
        if (debouncedQuery) {
            // 사용자가 500ms 동안 입력을 멈추면 검색 실행
            console.log('Searching for:', debouncedQuery);
            api.search(debouncedQuery);
        }
    }, [debouncedQuery]);

    return (
        <div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="검색어를 입력하세요..."
            />
            <p>입력 중: {query}</p>
            <p>검색 중: {debouncedQuery}</p>
        </div>
    );
}
```

### 자동 저장

입력이 멈추면 자동으로 저장:

```tsx
function DraftEditor() {
    const [content, debouncedContent, setContent] = useInputDebounce('', 1000);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    useEffect(() => {
        if (debouncedContent) {
            localStorage.setItem('draft', debouncedContent);
            setLastSaved(new Date());
            console.log('Draft saved!');
        }
    }, [debouncedContent]);

    return (
        <div>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="여기에 작성하면 자동으로 저장됩니다..."
                rows={10}
            />
            {lastSaved && <p>마지막 저장: {lastSaved.toLocaleTimeString()}</p>}
        </div>
    );
}
```

### 폼 검증

입력이 완료되면 유효성 검사:

```tsx
function EmailInput() {
    const [email, debouncedEmail, setEmail] = useInputDebounce('', 300);
    const [error, setError] = useState('');

    useEffect(() => {
        if (debouncedEmail) {
            if (!debouncedEmail.includes('@')) {
                setError('유효한 이메일 주소를 입력하세요');
            } else if (debouncedEmail.length < 5) {
                setError('이메일이 너무 짧습니다');
            } else {
                setError('');
            }
        }
    }, [debouncedEmail]);

    return (
        <div>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일"
            />
            {error && <span style={{ color: 'red' }}>{error}</span>}
        </div>
    );
}
```

## 고급 예제

### 실시간 검색 결과

입력하는 동안 즉각적인 피드백과 debounced API 호출:

```tsx
interface SearchResult {
    id: string;
    title: string;
}

function LiveSearch() {
    const [query, debouncedQuery, setQuery] = useInputDebounce('', 500);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        api.search(debouncedQuery)
            .then(setResults)
            .finally(() => setLoading(false));
    }, [debouncedQuery]);

    return (
        <div>
            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="검색..."
            />

            {/* 즉각적인 피드백 */}
            {query && query.length < 2 && <p>최소 2자 이상 입력하세요</p>}

            {/* 로딩 상태 */}
            {loading && <p>검색 중...</p>}

            {/* 검색 결과 */}
            <ul>
                {results.map((result) => (
                    <li key={result.id}>{result.title}</li>
                ))}
            </ul>
        </div>
    );
}
```

### 여러 필드 검증

여러 input 필드를 각각 debounce:

```tsx
function SignupForm() {
    const [username, debouncedUsername, setUsername] = useInputDebounce(
        '',
        500
    );
    const [email, debouncedEmail, setEmail] = useInputDebounce('', 500);
    const [errors, setErrors] = useState({ username: '', email: '' });

    // Username 검증
    useEffect(() => {
        if (debouncedUsername.length > 0 && debouncedUsername.length < 3) {
            setErrors((prev) => ({ ...prev, username: '3자 이상 입력하세요' }));
        } else {
            setErrors((prev) => ({ ...prev, username: '' }));
        }
    }, [debouncedUsername]);

    // Email 검증
    useEffect(() => {
        if (debouncedEmail && !debouncedEmail.includes('@')) {
            setErrors((prev) => ({
                ...prev,
                email: '유효한 이메일을 입력하세요',
            }));
        } else {
            setErrors((prev) => ({ ...prev, email: '' }));
        }
    }, [debouncedEmail]);

    return (
        <form>
            <div>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="사용자 이름"
                />
                {errors.username && <span>{errors.username}</span>}
            </div>

            <div>
                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일"
                />
                {errors.email && <span>{errors.email}</span>}
            </div>
        </form>
    );
}
```

### API 중복 호출 방지

동일한 검색어에 대한 중복 API 호출 방지:

```tsx
function SmartSearch() {
    const [query, debouncedQuery, setQuery] = useInputDebounce('', 500);
    const [results, setResults] = useState([]);
    const lastSearchRef = useRef('');

    useEffect(() => {
        // 이전 검색어와 동일하면 API 호출 스킵
        if (debouncedQuery === lastSearchRef.current) {
            return;
        }

        if (debouncedQuery) {
            lastSearchRef.current = debouncedQuery;
            api.search(debouncedQuery).then(setResults);
        } else {
            setResults([]);
        }
    }, [debouncedQuery]);

    return (
        <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색..."
        />
    );
}
```

### 숫자 입력 debounce

숫자 입력 필드에도 사용 가능:

```tsx
function PriceFilter() {
    const [minPrice, debouncedMin, setMinPrice] = useInputDebounce(0, 500);
    const [maxPrice, debouncedMax, setMaxPrice] = useInputDebounce(1000, 500);

    useEffect(() => {
        console.log('Filtering:', debouncedMin, '~', debouncedMax);
        api.filterByPrice(debouncedMin, debouncedMax);
    }, [debouncedMin, debouncedMax]);

    return (
        <div>
            <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                placeholder="최소 가격"
            />
            <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                placeholder="최대 가격"
            />
        </div>
    );
}
```

## 주요 기능

### 1. 즉각적인 UI 업데이트

`value`는 즉시 업데이트되어 사용자 입력에 즉각 반응:

```tsx
const [query, debouncedQuery, setQuery] = useInputDebounce('', 500);

// query는 즉시 업데이트 → UI가 즉각 반응
// debouncedQuery는 500ms 후 업데이트 → API 호출에 사용
```

### 2. 안정적인 디바운스 로직

검증되고 안정적인 디바운스 구현:

```tsx
// useInputDebounce는 검증된 디바운스 로직을 사용하여
// 안정적으로 값을 업데이트합니다
```

### 3. TypeScript 완벽 지원

제네릭을 통한 타입 안전성:

```tsx
// 문자열
const [name, debouncedName, setName] = useInputDebounce<string>('', 300);

// 숫자
const [age, debouncedAge, setAge] = useInputDebounce<number>(0, 500);

// 객체
const [user, debouncedUser, setUser] = useInputDebounce<User>(
    {
        name: '',
        email: '',
    },
    1000
);
```

## 언제 사용할까

✅ **다음과 같은 경우 사용하세요:**

-   **검색 입력**: 사용자가 입력을 멈출 때 검색
-   **자동 저장**: 입력이 완료되면 자동 저장
-   **폼 검증**: 입력이 끝난 후 유효성 검사
-   **필터링**: 실시간 필터 적용 (가격, 카테고리 등)
-   **API 호출 최적화**: 불필요한 API 요청 방지

✅ **장점:**

-   즉각적인 UI 반응 + 최적화된 API 호출
-   간단한 사용법 (튜플 구조분해)
-   `useDebounce` 기반으로 안정적
-   TypeScript 완벽 지원

## 언제 사용하지 말아야 할까

❌ **다음과 같은 경우 사용하지 마세요:**

-   **즉시 실행이 필요한 경우**

    -   `useState`만 사용

-   **더 세밀한 제어가 필요한 경우** (leading/trailing, cancel, flush)

    -   `useDebouncedCallback` 사용

-   **throttle이 더 적합한 경우** (스크롤, 리사이즈)
    -   `useThrottle` 사용

## useDebounce vs useDebouncedCallback vs useInputDebounce

| 특성        | useDebounce  | useDebouncedCallback      | useInputDebounce                  |
| ----------- | ------------ | ------------------------- | --------------------------------- |
| **용도**    | 값 debounce  | 함수 debounce             | Input 값 debounce                 |
| **반환값**  | Debounced 값 | Debounced 함수            | [value, debouncedValue, setValue] |
| **제어**    | 자동         | cancel, flush 메서드 제공 | 자동 debounce만 제공              |
| **사용 예** | 상태 값      | 이벤트 핸들러, 콜백       | input, textarea, 폼 필드          |
| **복잡도**  | 간단         | 더 많은 제어 가능         | 간단하고 직관적                   |

## 사용 사례 비교

| 시나리오                | useDebounce | useDebouncedCallback | useInputDebounce |
| ----------------------- | ----------- | -------------------- | ---------------- |
| 검색 입력 자동완성      | ✅          | ❌                   | ✅               |
| 버튼 클릭 보호          | ❌          | ✅                   | ❌               |
| 스크롤 이벤트           | ❌          | ✅                   | ❌               |
| 폼 자동 저장            | ✅          | ❌                   | ✅               |
| API 호출 최적화 (input) | ✅          | ❌                   | ✅               |
| 윈도우 리사이즈         | ❌          | ✅                   | ❌               |

## 구현 세부사항

-   **검증된 로직**: 안정적인 debounce 구현 활용
-   **즉각적인 상태**: `value`는 즉시 업데이트로 UI 반응성 보장
-   **자동 정리**: 컴포넌트 언마운트 시 자동으로 타이머 정리
-   **메모리 효율**: 최소한의 상태만 관리
-   **타입 안전**: 제네릭을 통한 완벽한 타입 추론
