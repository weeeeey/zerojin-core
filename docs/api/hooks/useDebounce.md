# useDebounce

값이 변경된 후 지정된 delay가 경과할 때까지 업데이트를 지연시키는 디바운스된 값을 반환합니다.

## 시그니처

```typescript
function useDebounce<T>(value: T, delay?: number): T;
```

## 파라미터

| 파라미터 | 타입     | 기본값 | 설명                  |
| -------- | -------- | ------ | --------------------- |
| `value`  | `T`      | 필수   | 디바운스할 값         |
| `delay`  | `number` | `500`  | 밀리초 단위 지연 시간 |

## 반환값

지정된 delay 후에 업데이트되는 디바운스된 값을 반환합니다.

## 기본 예제

### 검색 입력

가장 일반적인 사용 사례 - 사용자가 입력을 멈출 때까지 검색 쿼리 업데이트를 지연:

```tsx
import { useState } from 'react';
import { useDebounce } from 'zerojin';

function SearchComponent() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // debouncedSearchTerm이 변경될 때만 API 호출
    useEffect(() => {
        if (debouncedSearchTerm) {
            fetch(`/api/search?q=${debouncedSearchTerm}`)
                .then((res) => res.json())
                .then((results) => setResults(results));
        }
    }, [debouncedSearchTerm]);

    return (
        <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="검색..."
        />
    );
}
```

### 실시간 필터링

사용자가 입력을 멈춘 후 목록 필터링:

```tsx
function FilteredList() {
    const [filter, setFilter] = useState('');
    const debouncedFilter = useDebounce(filter, 300);

    const filteredItems = useMemo(() => {
        return items.filter((item) =>
            item.name.toLowerCase().includes(debouncedFilter.toLowerCase())
        );
    }, [debouncedFilter, items]);

    return (
        <div>
            <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="필터..."
            />
            <ul>
                {filteredItems.map((item) => (
                    <li key={item.id}>{item.name}</li>
                ))}
            </ul>
        </div>
    );
}
```

### 자동 저장

사용자가 편집을 멈춘 후 자동으로 저장:

```tsx
function AutoSaveEditor() {
    const [content, setContent] = useState('');
    const debouncedContent = useDebounce(content, 1000);

    useEffect(() => {
        if (debouncedContent) {
            console.log('자동 저장:', debouncedContent);
            api.save(debouncedContent);
        }
    }, [debouncedContent]);

    return (
        <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요..."
        />
    );
}
```

## 고급 예제

### API 호출 최적화

불필요한 API 호출을 줄여 성능 향상:

```tsx
function UserSearch() {
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 500);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!debouncedQuery) {
            setUsers([]);
            return;
        }

        setLoading(true);
        fetch(`/api/users?search=${debouncedQuery}`)
            .then((res) => res.json())
            .then((data) => {
                setUsers(data);
                setLoading(false);
            });
    }, [debouncedQuery]);

    return (
        <div>
            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="사용자 검색..."
            />
            {loading && <div>검색 중...</div>}
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.name}</li>
                ))}
            </ul>
        </div>
    );
}
```

### 폼 유효성 검사

입력이 안정화된 후 유효성 검사:

```tsx
function EmailInput() {
    const [email, setEmail] = useState('');
    const debouncedEmail = useDebounce(email, 300);
    const [isValid, setIsValid] = useState(true);

    useEffect(() => {
        if (debouncedEmail) {
            setIsValid(debouncedEmail.includes('@'));
        }
    }, [debouncedEmail]);

    return (
        <div>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={!isValid ? 'error' : ''}
            />
            {!isValid && <span>유효하지 않은 이메일</span>}
        </div>
    );
}
```

### 복잡한 객체 디바운싱

객체나 배열도 디바운스 가능:

```tsx
interface SearchFilters {
    category: string;
    minPrice: number;
    maxPrice: number;
}

function ProductSearch() {
    const [filters, setFilters] = useState<SearchFilters>({
        category: '',
        minPrice: 0,
        maxPrice: 1000,
    });
    const debouncedFilters = useDebounce(filters, 500);

    useEffect(() => {
        console.log('필터로 검색:', debouncedFilters);
        api.searchProducts(debouncedFilters);
    }, [debouncedFilters]);

    return (
        <div>
            <select
                value={filters.category}
                onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                }
            >
                <option value="">모든 카테고리</option>
                <option value="electronics">전자제품</option>
                <option value="books">도서</option>
            </select>
            <input
                type="number"
                value={filters.minPrice}
                onChange={(e) =>
                    setFilters({ ...filters, minPrice: +e.target.value })
                }
            />
            <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) =>
                    setFilters({ ...filters, maxPrice: +e.target.value })
                }
            />
        </div>
    );
}
```

### TypeScript와 함께

모든 타입과 함께 작동:

```tsx
// 문자열
const debouncedString = useDebounce<string>('hello', 500);

// 숫자
const debouncedNumber = useDebounce<number>(42, 300);

// 객체
interface User {
    id: number;
    name: string;
}
const debouncedUser = useDebounce<User>({ id: 1, name: 'John' }, 500);

// 배열
const debouncedArray = useDebounce<string[]>(['a', 'b', 'c'], 500);
```

## 언제 사용할까

다음과 같은 경우 `useDebounce`를 사용하세요:

✅ **값이 안정화될 때까지 대기**

-   검색 입력
-   폼 필터
-   자동 저장

✅ **불필요한 계산/렌더링 방지**

-   비용이 큰 연산
-   API 호출
-   복잡한 필터링

✅ **사용자가 입력을 완료할 때까지 대기**

-   유효성 검사
-   실시간 미리보기

## 언제 사용하지 말아야 할까

❌ **함수를 디바운스해야 하는 경우**

-   `useDebouncedCallback` 사용

❌ **주기적인 업데이트가 필요한 경우**

-   스크롤 추적에는 `useThrottle` 사용
-   마우스 이동 추적에는 `useThrottle` 사용

❌ **즉시 반응이 필요한 경우**

-   디바운싱 없이 직접 상태 사용

## useDebounce vs useDebouncedCallback

| 기능             | useDebounce | useDebouncedCallback |
| ---------------- | ----------- | -------------------- |
| 디바운스 대상    | 값          | 함수                 |
| 사용 사례        | 상태 값     | 이벤트 핸들러        |
| 제어 메서드      | ❌          | ✅ cancel, flush     |
| leading/trailing | ❌          | ✅                   |

### 예제 비교

```tsx
// useDebounce - 값을 디바운스
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 500);

useEffect(() => {
    api.search(debouncedSearch);
}, [debouncedSearch]);

// useDebouncedCallback - 함수를 디바운스
const handleSearch = useDebouncedCallback((query: string) => {
    api.search(query);
}, 500);
```

## 구현 세부사항

-   `useState`로 디바운스된 값 상태 관리
-   `useEffect`로 값 변경 감지 및 타이머 설정
-   언마운트 시 타이머 자동 정리
-   delay가 변경되면 타이머 재시작

## 참고

-   [useDebouncedCallback](/api/hooks/useDebouncedCallback) - 함수 디바운싱
-   [useThrottle](/api/hooks/useThrottle) - 실행 빈도 제한
-   [훅 개요](/api/hooks/) - 사용 가능한 모든 훅
