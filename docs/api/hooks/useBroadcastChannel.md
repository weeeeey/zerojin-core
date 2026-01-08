# useBroadcastChannel

BroadcastChannel API를 활용하여 브라우저의 여러 탭, 윈도우, iframe 간에 타입 안전한 메시지를 주고받는 React 훅입니다.

## 시그니처

```typescript
function useBroadcastChannel<T extends Record<string, unknown>>(
    channelName: string,
    handlers: EventHandlers<T>,
    options?: UseBroadcastChannelOptions
): {
    post: <K extends keyof T>(type: K, payload: T[K]) => void;
    close: () => void;
    tabId: string;
    getTabId: () => string;
};

type EventHandlers<T extends Record<string, unknown>> = {
    [K in keyof T]: (payload: T[K]) => void;
};

interface UseBroadcastChannelOptions {
    autoTimestamp?: boolean;
    autoTabId?: boolean;
    receiveSelfMessages?: boolean;
}
```

## 파라미터

| 파라미터      | 타입                         | 설명                                              |
| ------------- | ---------------------------- | ------------------------------------------------- |
| `channelName` | `string`                     | BroadcastChannel 이름 (같은 이름의 채널끼리 통신) |
| `handlers`    | `EventHandlers<T>`           | 이벤트 타입별 핸들러 함수 맵                      |
| `options`     | `UseBroadcastChannelOptions` | 추가 옵션 (선택사항)                              |

### 옵션

| 옵션                  | 타입      | 기본값  | 설명                               |
| --------------------- | --------- | ------- | ---------------------------------- |
| `autoTimestamp`       | `boolean` | `true`  | 메시지에 자동으로 timestamp 추가   |
| `autoTabId`           | `boolean` | `false` | 메시지에 자동으로 발신 탭 ID 추가  |
| `receiveSelfMessages` | `boolean` | `false` | 자신이 보낸 메시지도 수신할지 여부 |

## 반환값

| 속성       | 타입                                                  | 설명                     |
| ---------- | ----------------------------------------------------- | ------------------------ |
| `post`     | `<K extends keyof T>(type: K, payload: T[K]) => void` | 메시지 브로드캐스트 함수 |
| `close`    | `() => void`                                          | 채널 연결 종료 함수      |
| `tabId`    | `string`                                              | 현재 탭의 고유 ID        |
| `getTabId` | `() => string`                                        | 탭 ID를 가져오는 함수    |

## 기본 예제

### 간단한 카운터 동기화

여러 탭에서 카운터를 동기화:

```tsx
import { useBroadcastChannel } from 'zerojin';

interface CounterEvents {
    increment: number;
    decrement: number;
    reset: void;
}

function Counter() {
    const [count, setCount] = useState(0);

    const { post } = useBroadcastChannel<CounterEvents>('counter-channel', {
        increment: (value) => setCount(value),
        decrement: (value) => setCount(value),
        reset: () => setCount(0),
    });

    const increment = () => {
        const newValue = count + 1;
        setCount(newValue);
        post('increment', newValue);
    };

    const decrement = () => {
        const newValue = count - 1;
        setCount(newValue);
        post('decrement', newValue);
    };

    const reset = () => {
        setCount(0);
        post('reset', undefined);
    };

    return (
        <div>
            <p>카운트: {count}</p>
            <button onClick={increment}>+</button>
            <button onClick={decrement}>-</button>
            <button onClick={reset}>초기화</button>
            <p className="hint">다른 탭을 열어보세요!</p>
        </div>
    );
}
```

### 메시지 브로드캐스팅

여러 탭 간 채팅:

```tsx
interface ChatEvents {
    message: {
        id: string;
        text: string;
        timestamp: number;
    };
    userJoined: {
        userId: string;
        username: string;
    };
    userLeft: {
        userId: string;
    };
}

function Chat() {
    const [messages, setMessages] = useState<ChatEvents['message'][]>([]);
    const [inputText, setInputText] = useState('');

    const { post, tabId } = useBroadcastChannel<ChatEvents>(
        'chat-channel',
        {
            message: (msg) => {
                setMessages((prev) => [...prev, msg]);
            },
            userJoined: ({ username }) => {
                console.log(`${username} joined`);
            },
            userLeft: ({ userId }) => {
                console.log(`User ${userId} left`);
            },
        },
        {
            autoTimestamp: true,
            autoTabId: true,
        }
    );

    const sendMessage = () => {
        if (!inputText.trim()) return;

        const message: ChatEvents['message'] = {
            id: Math.random().toString(36),
            text: inputText,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, message]);
        post('message', message);
        setInputText('');
    };

    return (
        <div>
            <div className="messages">
                {messages.map((msg) => (
                    <div key={msg.id}>
                        {msg.text} -{' '}
                        {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                ))}
            </div>
            <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>전송</button>
        </div>
    );
}
```

## 고급 예제

### 복잡한 이벤트 타입

여러 종류의 이벤트 처리:

```tsx
interface AppEvents {
    // 사용자 이벤트
    userLogin: { userId: string; timestamp: number };
    userLogout: { userId: string };

    // 데이터 이벤트
    dataUpdated: { entity: string; id: string };
    dataDeleted: { entity: string; id: string };

    // UI 이벤트
    themeChanged: { theme: 'light' | 'dark' };
    notificationShown: { message: string; type: 'info' | 'warning' | 'error' };

    // 동기화 이벤트
    syncRequested: void;
    syncCompleted: { itemsCount: number };
}

function App() {
    const { post } = useBroadcastChannel<AppEvents>('app-channel', {
        userLogin: ({ userId, timestamp }) => {
            console.log(`User ${userId} logged in at ${timestamp}`);
            refreshUserData(userId);
        },

        userLogout: ({ userId }) => {
            console.log(`User ${userId} logged out`);
            clearUserData();
        },

        dataUpdated: ({ entity, id }) => {
            console.log(`${entity} ${id} updated`);
            refetchData(entity, id);
        },

        dataDeleted: ({ entity, id }) => {
            console.log(`${entity} ${id} deleted`);
            removeFromCache(entity, id);
        },

        themeChanged: ({ theme }) => {
            setTheme(theme);
        },

        notificationShown: ({ message, type }) => {
            showToast(message, type);
        },

        syncRequested: () => {
            performSync();
        },

        syncCompleted: ({ itemsCount }) => {
            console.log(`Synced ${itemsCount} items`);
        },
    });

    // 사용 예시
    const handleLogin = (userId: string) => {
        post('userLogin', { userId, timestamp: Date.now() });
    };

    return <div>...</div>;
}
```

### 탭 간 상태 동기화

여러 탭에서 앱 상태 동기화:

```tsx
interface SyncEvents {
    stateUpdate: {
        key: string;
        value: any;
    };
}

function useSyncedState<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(initialValue);

    const { post } = useBroadcastChannel<SyncEvents>('state-sync', {
        stateUpdate: ({ key: updateKey, value: updateValue }) => {
            if (updateKey === key) {
                setValue(updateValue);
            }
        },
    });

    const setSyncedValue = (newValue: T | ((prev: T) => T)) => {
        const resolved =
            newValue instanceof Function ? newValue(value) : newValue;
        setValue(resolved);
        post('stateUpdate', { key, value: resolved });
    };

    return [value, setSyncedValue] as const;
}

// 사용
function Dashboard() {
    const [selectedDate, setSelectedDate] = useSyncedState('date', new Date());
    const [filter, setFilter] = useSyncedState('filter', 'all');

    // 한 탭에서 변경하면 모든 탭이 업데이트됨
    return (
        <div>
            <DatePicker value={selectedDate} onChange={setSelectedDate} />
            <FilterSelect value={filter} onChange={setFilter} />
        </div>
    );
}
```

### 탭 감지 및 관리

연결된 탭 수 추적:

```tsx
interface TabEvents {
    ping: { tabId: string };
    pong: { tabId: string };
    tabClosed: { tabId: string };
}

function TabManager() {
    const [connectedTabs, setConnectedTabs] = useState<Set<string>>(new Set());

    const { post, tabId } = useBroadcastChannel<TabEvents>(
        'tab-manager',
        {
            ping: ({ tabId: fromTabId }) => {
                // 다른 탭의 ping에 응답
                post('pong', { tabId });
                setConnectedTabs((prev) => new Set([...prev, fromTabId]));
            },

            pong: ({ tabId: fromTabId }) => {
                setConnectedTabs((prev) => new Set([...prev, fromTabId]));
            },

            tabClosed: ({ tabId: closedTabId }) => {
                setConnectedTabs((prev) => {
                    const next = new Set(prev);
                    next.delete(closedTabId);
                    return next;
                });
            },
        },
        {
            autoTabId: false, // 수동으로 tabId 관리
        }
    );

    useEffect(() => {
        // 마운트 시 다른 탭에 존재 알림
        post('ping', { tabId });

        // 언마운트 시 종료 알림
        return () => {
            post('tabClosed', { tabId });
        };
    }, []);

    const checkTabs = () => {
        setConnectedTabs(new Set([tabId])); // 자신만 남김
        post('ping', { tabId }); // 다른 탭에 ping
    };

    return (
        <div>
            <p>연결된 탭: {connectedTabs.size}</p>
            <button onClick={checkTabs}>탭 수 확인</button>
            <ul>
                {Array.from(connectedTabs).map((id) => (
                    <li key={id}>
                        탭 {id} {id === tabId && '(현재)'}
                    </li>
                ))}
            </ul>
        </div>
    );
}
```

### 실시간 협업

여러 사용자가 동시에 편집:

```tsx
interface CollabEvents {
    cursorMove: {
        userId: string;
        position: { x: number; y: number };
    };
    textEdit: {
        userId: string;
        range: { start: number; end: number };
        text: string;
    };
    selection: {
        userId: string;
        range: { start: number; end: number };
    };
}

function CollaborativeEditor() {
    const [cursors, setCursors] = useState<
        Map<string, { x: number; y: number }>
    >(new Map());
    const [content, setContent] = useState('');

    const { post, tabId } = useBroadcastChannel<CollabEvents>(
        'collab-editor',
        {
            cursorMove: ({ userId, position }) => {
                setCursors((prev) => new Map(prev).set(userId, position));
            },

            textEdit: ({ userId, range, text }) => {
                if (userId === tabId) return; // 자신의 편집은 무시

                setContent(
                    (prev) =>
                        prev.slice(0, range.start) +
                        text +
                        prev.slice(range.end)
                );
            },

            selection: ({ userId, range }) => {
                highlightSelection(userId, range);
            },
        },
        {
            autoTabId: true,
            receiveSelfMessages: false,
        }
    );

    const handleTextChange = (text: string, start: number, end: number) => {
        setContent(text);
        post('textEdit', {
            userId: tabId,
            range: { start, end },
            text: text.slice(start, end),
        });
    };

    return (
        <div>
            <textarea
                value={content}
                onChange={(e) =>
                    handleTextChange(e.target.value, 0, e.target.value.length)
                }
            />
            {Array.from(cursors.entries()).map(([userId, pos]) => (
                <Cursor key={userId} userId={userId} position={pos} />
            ))}
        </div>
    );
}
```

### TypeScript 타입 안전성

완벽한 타입 추론:

```tsx
// 이벤트 타입 정의
interface MyEvents {
    userUpdate: { id: number; name: string };
    dataSync: { items: string[] };
    notification: { message: string; level: 'info' | 'warning' };
}

function TypeSafeExample() {
    const { post } = useBroadcastChannel<MyEvents>('my-channel', {
        // 핸들러는 정확한 페이로드 타입을 받음
        userUpdate: (data) => {
            // data: { id: number; name: string }
            console.log(data.id, data.name);
        },

        dataSync: (data) => {
            // data: { items: string[] }
            data.items.forEach((item) => console.log(item));
        },

        notification: (data) => {
            // data: { message: string; level: 'info' | 'warning' }
            if (data.level === 'warning') {
                alert(data.message);
            }
        },
    });

    // post는 타입 안전
    post('userUpdate', { id: 1, name: 'John' }); // ✅
    post('userUpdate', { id: '1', name: 'John' }); // ❌ 타입 에러
    post('dataSync', { items: ['a', 'b'] }); // ✅
    post('notification', { message: 'Hi', level: 'info' }); // ✅
    post('notification', { message: 'Hi', level: 'error' }); // ❌ 타입 에러
    post('unknownEvent', {}); // ❌ 타입 에러

    return null;
}
```

## 주요 기능

### 1. 타입 안전 메시지

제네릭을 통해 완벽한 타입 추론:

```tsx
interface Events {
    update: { count: number };
}

const { post } = useBroadcastChannel<Events>('ch', {
    update: (data) => console.log(data.count), // data는 { count: number }
});

post('update', { count: 42 }); // ✅
post('update', { count: 'wrong' }); // ❌ 타입 에러
```

### 2. 자동 직렬화

객체, 배열 등 모든 JavaScript 값을 자동으로 직렬화/역직렬화합니다.

### 3. 탭 ID 관리

각 탭에 고유 ID를 자동으로 할당하고 메시지에 포함할 수 있습니다:

```tsx
const { post, tabId } = useBroadcastChannel<Events>('ch', handlers, {
    autoTabId: true, // 메시지에 from: tabId 자동 추가
});
```

### 4. 자체 메시지 필터링

기본적으로 자신이 보낸 메시지는 수신하지 않습니다:

```tsx
// receiveSelfMessages: false (기본값)
post('update', data); // 자신은 핸들러가 호출되지 않음

// receiveSelfMessages: true
post('update', data); // 자신도 핸들러가 호출됨
```

## 언제 사용할까

✅ **다음과 같은 경우 사용하세요:**

-   **탭 간 상태 동기화**: 여러 탭에서 같은 상태 공유
-   **실시간 알림**: 한 탭의 액션을 다른 탭에 알림
-   **탭 간 통신**: 채팅, 협업 도구
-   **멀티 탭 조정**: 한 번에 하나의 탭만 특정 작업 수행
-   **브로드캐스트 이벤트**: 로그인/로그아웃 등을 모든 탭에 알림
-   **탭 감지**: 열린 탭 수 추적

✅ **장점:**

-   타입 안전한 메시지
-   자동 직렬화/역직렬화
-   같은 도메인 내 모든 탭/윈도우/iframe 통신
-   localStorage보다 빠름 (이벤트 기반)
-   핸들러 재실행 문제 해결 (handlersRef 사용)

## 언제 사용하지 말아야 할까

❌ **다음과 같은 경우 사용하지 마세요:**

-   **서버와 통신**: WebSocket이나 HTTP 사용
-   **다른 도메인과 통신**: postMessage 사용
-   **데이터 저장**: localStorage나 sessionStorage 사용
-   **크로스 브라우저 통신**: 불가능 (같은 브라우저 내에서만 작동)
-   **오래된 브라우저 지원**: IE는 미지원

## BroadcastChannel vs localStorage vs WebSocket

| 특성       | BroadcastChannel | localStorage Events      | WebSocket            |
| ---------- | ---------------- | ------------------------ | -------------------- |
| **목적**   | 탭 간 메시지     | 탭 간 저장소 동기화      | 서버-클라이언트 통신 |
| **속도**   | ⚡ 매우 빠름     | 🐢 느림 (storage에 쓰기) | ⚡ 빠름              |
| **범위**   | 같은 origin 탭들 | 같은 origin 탭들         | 서버와 클라이언트    |
| **지속성** | ❌ 메모리만      | ✅ 디스크에 저장         | ❌ 연결 중만         |
| **용도**   | 실시간 메시지    | 상태 저장 + 동기화       | 서버 통신            |

## 구현 세부사항

-   **handlersRef 사용**: handlers 변경 시 useEffect 재실행 방지
-   **useState로 tabId 생성**: 매 렌더링마다 불필요한 ID 생성 방지
-   **자동 클린업**: 컴포넌트 언마운트 시 채널 자동 종료
-   **타입 안전**: 제네릭으로 이벤트와 페이로드 타입 보장
-   **SSR 안전**: 브라우저 환경 체크

## 브라우저 지원

-   Chrome 54+
-   Firefox 38+
-   Safari 15.4+
-   Edge 79+
-   ❌ IE (미지원)
