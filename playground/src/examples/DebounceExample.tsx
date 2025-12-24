import { useState } from 'react';
import { useDebouncedCallback } from 'zerojin';

export default function DebounceExample() {
    const [searchQuery, setSearchQuery] = useState('');
    const [logs, setLogs] = useState<string[]>([]);
    const [clickCount, setClickCount] = useState(0);

    const addLog = (message: string) => {
        const time = new Date().toLocaleTimeString();
        setLogs((prev) => [`[${time}] ${message}`, ...prev].slice(0, 10));
    };

    // 검색 입력 디바운스 (trailing)
    const debouncedSearch = useDebouncedCallback(
        (query: string) => {
            addLog(`🔍 검색 실행: "${query}"`);
            console.log('Search API called:', query);
        },
        500,
        { leading: false, trailing: true }
    );

    // 버튼 클릭 보호 (leading)
    const handleProtectedClick = useDebouncedCallback(
        () => {
            setClickCount((prev) => prev + 1);
            addLog(`✅ 버튼 클릭 처리됨 (${clickCount + 1}회)`);
        },
        2000,
        { leading: true, trailing: false }
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        addLog(`⌨️  입력: "${value}"`);
        debouncedSearch(value);
    };

    return (
        <div className="example">
            <h2>useDebouncedCallback</h2>
            <p className="example-description">
                사용자가 입력을 멈출 때까지 기다렸다가 실행하는 디바운스
                훅입니다. 검색 입력, 폼 유효성 검사, 버튼 연타 방지 등에
                사용됩니다.
            </p>

            <div className="demo-section">
                <h3>1. 검색 입력 (Trailing)</h3>
                <p style={{ marginBottom: '1rem', color: '#666' }}>
                    입력을 멈춘 후 500ms 뒤에 검색이 실행됩니다.
                </p>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="검색어를 입력하세요..."
                />
            </div>

            <div className="demo-section">
                <h3>2. 버튼 클릭 보호 (Leading)</h3>
                <p style={{ marginBottom: '1rem', color: '#666' }}>
                    첫 클릭만 즉시 실행되고, 2초 동안 추가 클릭은 무시됩니다.
                </p>
                <button className="demo-button" onClick={handleProtectedClick}>
                    클릭 보호 버튼 (실행 횟수: {clickCount})
                </button>
            </div>

            <div className="demo-section">
                <h3>3. 제어 메서드</h3>
                <div className="button-group">
                    <button
                        className="demo-button"
                        onClick={() => {
                            debouncedSearch.cancel();
                            addLog('❌ 대기 중인 검색 취소됨');
                        }}
                    >
                        Cancel (검색 취소)
                    </button>
                    <button
                        className="demo-button"
                        onClick={() => {
                            debouncedSearch.flush();
                            addLog('⚡ 즉시 검색 실행됨');
                        }}
                    >
                        Flush (즉시 실행)
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
    );
}
