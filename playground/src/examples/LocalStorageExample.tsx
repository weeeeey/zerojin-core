import { useState } from 'react'
import { useLocalStorage } from 'zerojin'

interface UserSettings {
  theme: 'light' | 'dark'
  notifications: boolean
  language: string
}

export default function LocalStorageExample() {
  const [name, setName, removeName] = useLocalStorage('userName', '')
  const [settings, setSettings, removeSettings] = useLocalStorage<UserSettings>(
    'userSettings',
    {
      theme: 'light',
      notifications: true,
      language: 'ko',
    }
  )
  const [todos, setTodos, removeTodos] = useLocalStorage<string[]>('todos', [])
  const [newTodo, setNewTodo] = useState('')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString()
    setLogs((prev) => [`[${time}] ${message}`, ...prev].slice(0, 10))
  }

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      setTodos((prev) => [...prev, newTodo])
      addLog(`➕ Todo 추가: "${newTodo}"`)
      setNewTodo('')
    }
  }

  const handleRemoveTodo = (index: number) => {
    const todo = todos[index]
    setTodos((prev) => prev.filter((_, i) => i !== index))
    addLog(`❌ Todo 삭제: "${todo}"`)
  }

  return (
    <div className="example">
      <h2>useLocalStorage</h2>
      <p className="example-description">
        localStorage에 상태를 동기화하는 훅입니다. 브라우저를 닫아도 데이터가
        유지되며, 사용자 설정, 테마, 장바구니 등에 사용됩니다. 다른 탭과도
        자동으로 동기화됩니다.
      </p>

      <div className="demo-section">
        <h3>1. 문자열 저장</h3>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          입력한 이름이 localStorage에 저장됩니다.
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            addLog(`💾 이름 저장: "${e.target.value}"`)
          }}
          placeholder="이름을 입력하세요"
        />
        <div className="button-group">
          <button
            className="demo-button"
            onClick={() => {
              removeName()
              addLog('🗑️  이름 삭제됨')
            }}
          >
            이름 초기화
          </button>
        </div>
      </div>

      <div className="demo-section">
        <h3>2. 객체 저장 (사용자 설정)</h3>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          복잡한 객체도 JSON으로 자동 저장됩니다.
        </p>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            테마:
            <select
              value={settings.theme}
              onChange={(e) => {
                const newTheme = e.target.value as 'light' | 'dark'
                setSettings((prev) => ({ ...prev, theme: newTheme }))
                addLog(`🎨 테마 변경: ${newTheme}`)
              }}
              style={{ marginLeft: '1rem', padding: '0.5rem' }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => {
                setSettings((prev) => ({
                  ...prev,
                  notifications: e.target.checked,
                }))
                addLog(`🔔 알림: ${e.target.checked ? 'ON' : 'OFF'}`)
              }}
            />
            알림 활성화
          </label>
        </div>
        <div className="storage-display">
          <strong>현재 설정:</strong>
          <pre>{JSON.stringify(settings, null, 2)}</pre>
        </div>
        <div className="button-group">
          <button
            className="demo-button"
            onClick={() => {
              removeSettings()
              addLog('🗑️  설정 초기화됨')
            }}
          >
            설정 초기화
          </button>
        </div>
      </div>

      <div className="demo-section">
        <h3>3. 배열 저장 (Todo 리스트)</h3>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          배열 데이터도 쉽게 저장하고 관리할 수 있습니다.
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
            placeholder="할 일을 입력하세요"
            style={{ flex: 1 }}
          />
          <button className="demo-button" onClick={handleAddTodo}>
            추가
          </button>
        </div>
        <div>
          {todos.length === 0 ? (
            <p style={{ color: '#999' }}>할 일이 없습니다.</p>
          ) : (
            <ul style={{ listStyle: 'none' }}>
              {todos.map((todo, index) => (
                <li
                  key={index}
                  style={{
                    padding: '0.75rem',
                    background: '#f9f9f9',
                    marginBottom: '0.5rem',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>{todo}</span>
                  <button
                    onClick={() => handleRemoveTodo(index)}
                    style={{
                      background: '#ff4444',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="button-group">
          <button
            className="demo-button"
            onClick={() => {
              removeTodos()
              addLog('🗑️  Todo 리스트 초기화됨')
            }}
          >
            전체 삭제
          </button>
        </div>
      </div>

      <div className="demo-section">
        <h3>실행 로그</h3>
        <div className="log-container">
          {logs.length === 0 ? (
            <div style={{ color: '#858585' }}>
              로그가 여기에 표시됩니다...
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="log-item">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
