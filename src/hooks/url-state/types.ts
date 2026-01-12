/**
 * URL에서 지원하는 값 타입
 */
export type UrlStateValue =
    | string
    | number
    | boolean
    | string[]
    | number[]
    | boolean[]
    | null
    | undefined;

/**
 * URL 상태 객체 타입 (평면 구조)
 */
export type UrlStateRecord = Record<string, UrlStateValue>;

/**
 * useUrlState 훅 옵션
 */
export interface UseUrlStateOptions<T extends UrlStateRecord> {
    /**
     * 기본값 (타입 추론에도 사용됨)
     * @default {}
     */
    defaultValues?: T;

    /**
     * URL 업데이트 모드
     * - 'push': 히스토리 스택에 새 엔트리 추가
     * - 'replace': 현재 엔트리 대체
     * @default 'push'
     */
    mode?: 'push' | 'replace';

    /**
     * setState 호출 시 디바운스 지연 시간 (ms)
     * 0으로 설정하면 디바운싱 비활성화
     * @default 100
     */
    debounce?: number;

    /**
     * 커스텀 직렬화 함수
     * serializeValue의 기본 동작을 오버라이드
     */
    serializer?: (key: string, value: UrlStateValue) => string;

    /**
     * 커스텀 역직렬화 함수
     * deserializeValue의 기본 동작을 오버라이드
     */
    deserializer?: (key: string, value: string) => UrlStateValue;

    /**
     * defaultValues에 없는 기존 URL 파라미터 유지 여부
     * @default true
     */
    keepExistingParams?: boolean;
}

/**
 * useUrlState 반환 타입
 */
export interface UseUrlStateReturn<T extends UrlStateRecord> {
    /**
     * 현재 URL 상태
     */
    state: T;

    /**
     * 상태 업데이트 (디바운싱 적용)
     * 객체 또는 업데이트 함수를 받을 수 있음
     */
    setState: (updates: Partial<T> | ((prev: T) => Partial<T>)) => void;

    /**
     * 히스토리 스택에 추가하며 즉시 업데이트 (디바운싱 무시)
     */
    push: (updates: Partial<T>) => void;

    /**
     * 현재 히스토리 엔트리를 대체하며 즉시 업데이트 (디바운싱 무시)
     */
    replace: (updates: Partial<T>) => void;

    /**
     * defaultValues로 리셋
     */
    reset: () => void;

    /**
     * 특정 키 제거
     */
    remove: (...keys: (keyof T)[]) => void;
}

/**
 * 프레임워크 어댑터 인터페이스
 * Next.js, React Router, Native History API를 추상화
 */
export interface FrameworkAdapter {
    /**
     * 현재 URL의 search params를 가져옴
     */
    getSearchParams: () => URLSearchParams;

    /**
     * URL 업데이트 (push 또는 replace)
     */
    updateUrl: (params: URLSearchParams, mode: 'push' | 'replace') => void;

    /**
     * URL 변경 감지 (뒤로/앞으로 버튼)
     * unsubscribe 함수 반환
     */
    subscribe: (callback: () => void) => () => void;

    /**
     * 감지된 프레임워크
     */
    framework: 'nextjs-app' | 'nextjs-pages' | 'react-router' | 'native';
}
