import { createStorageHook } from './createStorageHook'

/**
 * localStorage에 상태를 동기화하는 React 훅
 *
 * @template T - 저장할 값의 타입
 * @param {string} key - localStorage 키
 * @param {T} initialValue - 초기값 (키가 존재하지 않을 때 사용)
 * @returns {[T, (value: T | ((prev: T) => T)) => void, () => void]} [현재값, 값 설정 함수, 값 제거 함수]
 *
 * @example
 * ```tsx
 * // 기본 사용법
 * function UserProfile() {
 *   const [name, setName, removeName] = useLocalStorage('userName', '')
 *
 *   return (
 *     <div>
 *       <input
 *         value={name}
 *         onChange={(e) => setName(e.target.value)}
 *       />
 *       <button onClick={removeName}>초기화</button>
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // 객체 저장
 * interface Settings {
 *   theme: 'light' | 'dark'
 *   notifications: boolean
 * }
 *
 * function AppSettings() {
 *   const [settings, setSettings] = useLocalStorage<Settings>('settings', {
 *     theme: 'light',
 *     notifications: true
 *   })
 *
 *   const toggleTheme = () => {
 *     setSettings(prev => ({
 *       ...prev,
 *       theme: prev.theme === 'light' ? 'dark' : 'light'
 *     }))
 *   }
 *
 *   return <button onClick={toggleTheme}>테마 변경</button>
 * }
 * ```
 *
 * @example
 * ```tsx
 * // 배열 저장
 * function TodoList() {
 *   const [todos, setTodos, clearTodos] = useLocalStorage<string[]>('todos', [])
 *
 *   const addTodo = (todo: string) => {
 *     setTodos(prev => [...prev, todo])
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={() => addTodo('새 할일')}>추가</button>
 *       <button onClick={clearTodos}>전체 삭제</button>
 *     </div>
 *   )
 * }
 * ```
 */
export const useLocalStorage = createStorageHook(
  typeof window !== 'undefined' ? window.localStorage : ({} as Storage)
)
