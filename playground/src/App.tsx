import { useState } from 'react'
import DebounceExample from './examples/DebounceExample'
import ThrottleExample from './examples/ThrottleExample'
import LocalStorageExample from './examples/LocalStorageExample'
import SessionStorageExample from './examples/SessionStorageExample'
import './App.css'

type Tab = 'debounce' | 'throttle' | 'localStorage' | 'sessionStorage'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('debounce')

  return (
    <div className="app">
      <header className="header">
        <h1>zerojin Playground</h1>
        <p>React 훅 실시간 테스트 환경</p>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'debounce' ? 'active' : ''}
          onClick={() => setActiveTab('debounce')}
        >
          useDebounce
        </button>
        <button
          className={activeTab === 'throttle' ? 'active' : ''}
          onClick={() => setActiveTab('throttle')}
        >
          useThrottle
        </button>
        <button
          className={activeTab === 'localStorage' ? 'active' : ''}
          onClick={() => setActiveTab('localStorage')}
        >
          useLocalStorage
        </button>
        <button
          className={activeTab === 'sessionStorage' ? 'active' : ''}
          onClick={() => setActiveTab('sessionStorage')}
        >
          useSessionStorage
        </button>
      </nav>

      <main className="content">
        {activeTab === 'debounce' && <DebounceExample />}
        {activeTab === 'throttle' && <ThrottleExample />}
        {activeTab === 'localStorage' && <LocalStorageExample />}
        {activeTab === 'sessionStorage' && <SessionStorageExample />}
      </main>
    </div>
  )
}
