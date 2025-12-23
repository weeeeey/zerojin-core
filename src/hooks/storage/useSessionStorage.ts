import { createStorageHook } from './createStorageHook';

/**
 * sessionStorage에 상태를 동기화하는 React 훅
 *
 * @template T - 저장할 값의 타입
 * @param {string} key - sessionStorage 키
 * @param {T} initialValue - 초기값 (키가 존재하지 않을 때 사용)
 * @returns {[T, (value: T | ((prev: T) => T)) => void, () => void]} [현재값, 값 설정 함수, 값 제거 함수]
 *
 * @example
 * ```tsx
 * // 기본 사용법 - 세션 동안만 유지되는 인증 토큰
 * function AuthProvider() {
 *   const [token, setToken, removeToken] = useSessionStorage('authToken', '')
 *
 *   const login = async (credentials) => {
 *     const response = await api.login(credentials)
 *     setToken(response.token)
 *   }
 *
 *   const logout = () => {
 *     removeToken()
 *   }
 *
 *   return <AuthContext.Provider value={{ token, login, logout }} />
 * }
 * ```
 *
 * @example
 * ```tsx
 * // 폼 임시 저장 (탭을 닫으면 사라짐)
 * interface FormData {
 *   email: string
 *   message: string
 * }
 *
 * function ContactForm() {
 *   const [formData, setFormData] = useSessionStorage<FormData>('contactForm', {
 *     email: '',
 *     message: ''
 *   })
 *
 *   const updateField = (field: keyof FormData, value: string) => {
 *     setFormData(prev => ({ ...prev, [field]: value }))
 *   }
 *
 *   return (
 *     <form>
 *       <input
 *         value={formData.email}
 *         onChange={(e) => updateField('email', e.target.value)}
 *       />
 *       <textarea
 *         value={formData.message}
 *         onChange={(e) => updateField('message', e.target.value)}
 *       />
 *     </form>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // 위저드 스텝 저장 (새로고침해도 유지, 탭 닫으면 사라짐)
 * function MultiStepWizard() {
 *   const [currentStep, setCurrentStep] = useSessionStorage('wizardStep', 0)
 *   const [wizardData, setWizardData] = useSessionStorage('wizardData', {})
 *
 *   const nextStep = () => setCurrentStep(prev => prev + 1)
 *   const prevStep = () => setCurrentStep(prev => prev - 1)
 *
 *   return (
 *     <div>
 *       <Step number={currentStep} data={wizardData} />
 *       <button onClick={prevStep}>이전</button>
 *       <button onClick={nextStep}>다음</button>
 *     </div>
 *   )
 * }
 * ```
 */
export const useSessionStorage = createStorageHook(
    typeof window !== 'undefined' ? window.sessionStorage : ({} as Storage)
);
