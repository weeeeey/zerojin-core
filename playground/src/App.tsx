import { useState, useEffect } from 'react';
import DebounceExample from './examples/DebounceExample';
import ThrottleExample from './examples/ThrottleExample';
import LocalStorageExample from './examples/LocalStorageExample';
import SessionStorageExample from './examples/SessionStorageExample';
import './App.css';
import DndGridExample from './examples/DndGridExample';

type Tab =
    | 'debounce'
    | 'throttle'
    | 'localStorage'
    | 'sessionStorage'
    | 'DndGrid';

export default function App() {
    // URL 쿼리 파라미터 읽기
    const searchParams = new URLSearchParams(window.location.search);
    const exampleParam = (searchParams.get('example') || 'DndGrid') as Tab;
    const isStandalone = searchParams.get('standalone') === 'true';

    const [activeTab, setActiveTab] = useState<Tab>(exampleParam);

    // URL 동기화 (탭 변경 시)
    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('example', activeTab);
        if (isStandalone) {
            url.searchParams.set('standalone', 'true');
        }
        window.history.replaceState({}, '', url.toString());
    }, [activeTab, isStandalone]);

    // Standalone 모드: 헤더/탭 없이 예제만 렌더링
    if (isStandalone) {
        return (
            <div className="standalone-mode">
                <main className="standalone-content">
                    {activeTab === 'DndGrid' && <DndGridExample />}
                    {activeTab === 'debounce' && <DebounceExample />}
                    {activeTab === 'throttle' && <ThrottleExample />}
                    {activeTab === 'localStorage' && <LocalStorageExample />}
                    {activeTab === 'sessionStorage' && (
                        <SessionStorageExample />
                    )}
                </main>
            </div>
        );
    }

    // 일반 모드: 전체 UI
    return (
        <div className="app">
            <header className="header">
                <h1>zerojin Playground</h1>
                <p>React 훅 실시간 테스트 환경</p>
            </header>

            <nav className="tabs">
                <button
                    className={activeTab === 'DndGrid' ? 'active' : ''}
                    onClick={() => setActiveTab('DndGrid')}
                >
                    DndGrid
                </button>
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
                {activeTab === 'DndGrid' && <DndGridExample />}
                {activeTab === 'debounce' && <DebounceExample />}
                {activeTab === 'throttle' && <ThrottleExample />}
                {activeTab === 'localStorage' && <LocalStorageExample />}
                {activeTab === 'sessionStorage' && <SessionStorageExample />}
            </main>
        </div>
    );
}
