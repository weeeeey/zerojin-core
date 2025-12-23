import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * BroadcastChannel 메시지 타입
 */
export interface BroadcastMessage<T = unknown> {
    type: string;
    payload: T;
    timestamp?: number;
    from?: string;
}

/**
 * 이벤트 핸들러 맵 타입
 */
export type EventHandlers<T extends Record<string, unknown>> = {
    [K in keyof T]: (payload: T[K]) => void;
};

/**
 * useBroadcastChannel 옵션
 */
export interface UseBroadcastChannelOptions {
    /**
     * 메시지 전송 시 자동으로 timestamp 추가 여부
     * @default true
     */
    autoTimestamp?: boolean;

    /**
     * 메시지 전송 시 자동으로 탭 ID 추가 여부
     * @default false
     */
    autoTabId?: boolean;

    /**
     * 자신이 보낸 메시지도 수신할지 여부
     * @default false
     */
    receiveSelfMessages?: boolean;
}

/**
 * BroadcastChannel을 활용한 탭 간 데이터 동기화 훅
 *
 * @template T - 이벤트 타입과 페이로드를 정의하는 객체 타입
 * @param channelName - BroadcastChannel 이름
 * @param handlers - 이벤트 타입별 핸들러 함수 맵
 * @param options - 추가 옵션
 *
 * @example
 * ```tsx
 * interface MyEvents {
 *   counter: number
 *   message: { text: string; user: string }
 *   userJoined: { userId: string }
 * }
 *
 * const { post, close } = useBroadcastChannel<MyEvents>('my-channel', {
 *   counter: (count) => setCounter(count),
 *   message: (msg) => setMessages(prev => [...prev, msg]),
 *   userJoined: (data) => console.log('User joined:', data.userId)
 * })
 *
 * // 메시지 전송
 * post('counter', 42)
 * post('message', { text: 'Hello', user: 'John' })
 * ```
 */
export function useBroadcastChannel<T extends Record<string, unknown>>(
    channelName: string,
    handlers: EventHandlers<T>,
    options: UseBroadcastChannelOptions = {}
) {
    const {
        autoTimestamp = true,
        autoTabId = false,
        receiveSelfMessages = false,
    } = options;

    const channelRef = useRef<BroadcastChannel | null>(null);
    const handlersRef = useRef(handlers);
    const [tabId] = useState(() => Math.random().toString(36).substring(2, 11));
    const isClient = typeof window !== 'undefined';

    // handlers 최신 상태 유지
    useEffect(() => {
        handlersRef.current = handlers;
    }, [handlers]);

    /**
     * 메시지를 다른 탭으로 브로드캐스트
     */
    const post = useCallback(
        <K extends keyof T>(type: K, payload: T[K]) => {
            if (!channelRef.current) {
                console.warn('BroadcastChannel is not initialized');
                return;
            }

            const message: BroadcastMessage<T[K]> = {
                type: type as string,
                payload,
                ...(autoTimestamp && { timestamp: Date.now() }),
                ...(autoTabId && { from: tabId }),
            };

            channelRef.current.postMessage(message);
        },
        [autoTimestamp, autoTabId, tabId]
    );

    /**
     * BroadcastChannel 연결 종료
     */
    const close = useCallback(() => {
        if (channelRef.current) {
            channelRef.current.close();
            channelRef.current = null;
        }
    }, []);

    /**
     * 현재 탭 ID 반환
     */
    const getTabId = useCallback(() => tabId, [tabId]);

    /**
     * BroadcastChannel 초기화 및 메시지 리스닝
     */
    useEffect(() => {
        if (!isClient) {
            return;
        }

        // BroadcastChannel 생성
        channelRef.current = new BroadcastChannel(channelName);

        // 메시지 수신 핸들러
        channelRef.current.onmessage = (
            event: MessageEvent<BroadcastMessage>
        ) => {
            const { type, payload, from } = event.data;

            // 자신이 보낸 메시지 필터링
            if (!receiveSelfMessages && from === tabId) {
                return;
            }

            // 등록된 핸들러가 있으면 실행
            const handler = handlersRef.current[type as keyof T];
            if (handler) {
                handler(payload as T[keyof T]);
            }
        };

        // 에러 핸들러
        channelRef.current.onmessageerror = (event) => {
            console.error('BroadcastChannel message error:', event);
        };

        // 클린업
        return () => {
            close();
        };
    }, [channelName, isClient, receiveSelfMessages, tabId, close]);

    return {
        /**
         * 메시지를 다른 탭으로 브로드캐스트
         */
        post,

        /**
         * BroadcastChannel 연결 종료
         */
        close,

        /**
         * 현재 탭의 고유 ID
         */
        tabId,

        /**
         * 현재 탭 ID를 가져오는 함수
         */
        getTabId,
    };
}
