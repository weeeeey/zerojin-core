import { useState } from 'react'
import { useThrottle } from 'zerojin'

export default function ThrottleExample() {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString()
    setLogs((prev) => [`[${time}] ${message}`, ...prev].slice(0, 10))
  }

  // 스크롤 추적 (200ms마다 최대 1회)
  const handleScroll = useThrottle(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget
      const position = Math.round(target.scrollTop)
      setScrollPosition(position)
      addLog(`📜 스크롤 위치: ${position}px`)
    },
    200,
    { leading: true, trailing: false }
  )

  // 마우스 이동 추적 (100ms마다 최대 1회)
  const handleMouseMove = useThrottle(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const x = e.clientX
      const y = e.clientY
      setMousePosition({ x, y })
      addLog(`🖱️  마우스: (${x}, ${y})`)
    },
    100,
    { leading: true, trailing: false }
  )

  return (
    <div className="example">
      <h2>useThrottle</h2>
      <p className="example-description">
        일정 시간마다 최대 한 번만 실행되는 스로틀 훅입니다. 스크롤 이벤트,
        마우스 추적, 윈도우 리사이즈 등 연속적인 이벤트에서 실행 빈도를
        제한합니다.
      </p>

      <div className="demo-section">
        <h3>1. 스크롤 위치 추적</h3>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          스크롤할 때 200ms마다 최대 한 번씩 위치가 업데이트됩니다.
        </p>
        <div className="scroll-box" onScroll={handleScroll}>
          <div className="position-indicator">
            현재 스크롤: {scrollPosition}px
          </div>
          <div className="scroll-content">
            <p style={{ marginBottom: '1rem' }}>
              ⬇️ 아래로 스크롤해보세요
            </p>
            {Array.from({ length: 50 }, (_, i) => (
              <p key={i} style={{ padding: '0.5rem 0' }}>
                라인 {i + 1}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>2. 마우스 위치 추적</h3>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          박스 안에서 마우스를 움직이면 100ms마다 위치가 추적됩니다.
        </p>
        <div
          onMouseMove={handleMouseMove}
          style={{
            height: '200px',
            background: 'linear-gradient(135deg, #667eea22 0%, #764ba222 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'crosshair',
            position: 'relative',
          }}
        >
          <div style={{ textAlign: 'center', fontSize: '1.2rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              🖱️ 마우스를 움직여보세요
            </div>
            <div style={{ color: '#667eea', fontWeight: 'bold' }}>
              X: {mousePosition.x}px, Y: {mousePosition.y}px
            </div>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h3>3. 제어 메서드</h3>
        <div className="button-group">
          <button
            className="demo-button"
            onClick={() => {
              handleScroll.cancel()
              addLog('❌ 대기 중인 스크롤 업데이트 취소됨')
            }}
          >
            Cancel (업데이트 취소)
          </button>
          <button
            className="demo-button"
            onClick={() => {
              handleScroll.flush()
              addLog('⚡ 즉시 스크롤 업데이트 실행됨')
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
  )
}
