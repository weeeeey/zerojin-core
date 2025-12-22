import { useState } from 'react'
import { useSessionStorage } from 'zerojin'

interface FormData {
  email: string
  message: string
}

export default function SessionStorageExample() {
  const [token, setToken, removeToken] = useSessionStorage('authToken', '')
  const [formData, setFormData, removeFormData] = useSessionStorage<FormData>(
    'contactForm',
    {
      email: '',
      message: '',
    }
  )
  const [wizardStep, setWizardStep] = useSessionStorage('wizardStep', 0)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString()
    setLogs((prev) => [`[${time}] ${message}`, ...prev].slice(0, 10))
  }

  const handleLogin = () => {
    const fakeToken = `token_${Math.random().toString(36).substr(2, 9)}`
    setToken(fakeToken)
    addLog(`🔐 로그인됨: ${fakeToken}`)
  }

  const handleLogout = () => {
    removeToken()
    addLog('👋 로그아웃됨')
  }

  return (
    <div className="example">
      <h2>useSessionStorage</h2>
      <p className="example-description">
        sessionStorage에 상태를 동기화하는 훅입니다. 탭을 닫으면 데이터가
        사라지며, 인증 토큰, 임시 폼 데이터, 위저드 스텝 등 세션 동안만 유지할
        데이터에 사용됩니다.
      </p>

      <div className="demo-section">
        <h3>1. 인증 토큰 (세션 동안만 유지)</h3>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          탭을 닫으면 토큰이 자동으로 삭제됩니다.
        </p>
        {token ? (
          <div>
            <div
              style={{
                padding: '1rem',
                background: '#e8f5e9',
                borderRadius: '4px',
                marginBottom: '1rem',
              }}
            >
              <strong>로그인 상태</strong>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  marginTop: '0.5rem',
                  wordBreak: 'break-all',
                }}
              >
                토큰: {token}
              </div>
            </div>
            <button className="demo-button" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        ) : (
          <div>
            <div
              style={{
                padding: '1rem',
                background: '#fff3e0',
                borderRadius: '4px',
                marginBottom: '1rem',
              }}
            >
              로그인되지 않음
            </div>
            <button className="demo-button" onClick={handleLogin}>
              로그인 (가상)
            </button>
          </div>
        )}
      </div>

      <div className="demo-section">
        <h3>2. 폼 임시 저장</h3>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          새로고침해도 입력 내용이 유지되지만, 탭을 닫으면 사라집니다.
        </p>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            이메일:
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, email: e.target.value }))
              addLog(`📧 이메일 입력: ${e.target.value}`)
            }}
            placeholder="email@example.com"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            메시지:
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, message: e.target.value }))
              addLog(`💬 메시지 입력`)
            }}
            placeholder="메시지를 입력하세요"
            rows={4}
          />
        </div>
        <div className="storage-display">
          <strong>저장된 폼 데이터:</strong>
          <pre>{JSON.stringify(formData, null, 2)}</pre>
        </div>
        <div className="button-group">
          <button
            className="demo-button"
            onClick={() => {
              removeFormData()
              addLog('🗑️  폼 데이터 초기화됨')
            }}
          >
            폼 초기화
          </button>
        </div>
      </div>

      <div className="demo-section">
        <h3>3. 위저드 스텝 관리</h3>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          새로고침해도 현재 스텝이 유지되어 계속 진행할 수 있습니다.
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.5rem',
            background: '#f5f5f5',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}
        >
          <div>
            <strong style={{ fontSize: '1.2rem' }}>
              스텝 {wizardStep + 1} / 5
            </strong>
            <div style={{ marginTop: '0.5rem', color: '#666' }}>
              {
                [
                  '개인정보 입력',
                  '주소 입력',
                  '결제 정보',
                  '확인',
                  '완료',
                ][wizardStep]
              }
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="demo-button"
              onClick={() => {
                if (wizardStep > 0) {
                  setWizardStep((prev) => prev - 1)
                  addLog(`⬅️  이전 스텝으로`)
                }
              }}
              disabled={wizardStep === 0}
              style={{ opacity: wizardStep === 0 ? 0.5 : 1 }}
            >
              이전
            </button>
            <button
              className="demo-button"
              onClick={() => {
                if (wizardStep < 4) {
                  setWizardStep((prev) => prev + 1)
                  addLog(`➡️  다음 스텝으로`)
                }
              }}
              disabled={wizardStep === 4}
              style={{ opacity: wizardStep === 4 ? 0.5 : 1 }}
            >
              다음
            </button>
          </div>
        </div>
        <button
          className="demo-button"
          onClick={() => {
            setWizardStep(0)
            addLog('🔄 위저드 초기화됨')
          }}
        >
          처음부터 시작
        </button>
      </div>

      <div className="demo-section">
        <h3>💡 LocalStorage vs SessionStorage</h3>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '1rem',
          }}
        >
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>특징</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                LocalStorage
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                SessionStorage
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '0.75rem', borderTop: '1px solid #e0e0e0' }}>
                유지 기간
              </td>
              <td style={{ padding: '0.75rem', borderTop: '1px solid #e0e0e0' }}>
                영구 (명시적 삭제 전까지)
              </td>
              <td style={{ padding: '0.75rem', borderTop: '1px solid #e0e0e0' }}>
                탭/창을 닫으면 삭제
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0.75rem', borderTop: '1px solid #e0e0e0' }}>
                사용 예시
              </td>
              <td style={{ padding: '0.75rem', borderTop: '1px solid #e0e0e0' }}>
                사용자 설정, 테마, 장바구니
              </td>
              <td style={{ padding: '0.75rem', borderTop: '1px solid #e0e0e0' }}>
                인증 토큰, 임시 데이터, 위저드
              </td>
            </tr>
          </tbody>
        </table>
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
