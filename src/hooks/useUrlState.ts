'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useDebouncedCallback } from './useDebouncedCallback';
import type {
    UseUrlStateOptions,
    UseUrlStateReturn,
    UrlStateRecord,
} from './url-state/types';
import {
    stateToSearchParams,
    searchParamsToState,
} from './url-state/serializer';
import { createFrameworkAdapter } from './url-state/framework-adapter';

/**
 * URL을 상태 관리 도구로 사용하는 훅
 *
 * URL의 search params를 React 상태처럼 관리합니다.
 * 공유 가능하고, 북마크 가능하며, 브라우저 히스토리가 자동으로 작동합니다.
 *
 * @template T - URL 파라미터 타입 (Record<string, UrlStateValue>)
 * @param options - 훅 옵션
 * @returns URL 상태 및 조작 메서드
 *
 * @example
 * ```tsx
 * interface SearchFilters {
 *   query: string;
 *   page: number;
 *   category: string;
 *   tags: string[];
 * }
 *
 * function SearchPage() {
 *   const { state, setState, reset } = useUrlState<SearchFilters>({
 *     defaultValues: {
 *       query: '',
 *       page: 1,
 *       category: 'all',
 *       tags: []
 *     }
 *   });
 *
 *   return (
 *     <div>
 *       <input
 *         value={state.query}
 *         onChange={(e) => setState({ query: e.target.value })}
 *       />
 *       <div>Page: {state.page}</div>
 *       <button onClick={reset}>초기화</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // 페이지네이션
 * const { state, push } = useUrlState({
 *   defaultValues: { page: 1, pageSize: 20 }
 * });
 *
 * <button onClick={() => push({ page: state.page + 1 })}>
 *   다음 페이지
 * </button>
 * ```
 *
 * @example
 * ```tsx
 * // 여러 필터 동시 관리
 * const { state, setState, remove } = useUrlState({
 *   defaultValues: {
 *     category: 'all',
 *     minPrice: 0,
 *     maxPrice: 1000,
 *     inStock: false
 *   }
 * });
 *
 * // 여러 필터 한 번에 업데이트
 * setState({
 *   category: 'electronics',
 *   minPrice: 100,
 *   inStock: true
 * });
 *
 * // 특정 필터 제거
 * remove('minPrice', 'maxPrice');
 * ```
 */
export function useUrlState<T extends UrlStateRecord>(
    options: UseUrlStateOptions<T> = {}
): UseUrlStateReturn<T> {
    const {
        defaultValues = {} as T,
        mode = 'push',
        debounce = 100,
        keepExistingParams = true,
    } = options;

    // SSR 안전성 체크
    const isClient = typeof window !== 'undefined';

    // 프레임워크 어댑터 생성 (한 번만)
    const adapter = useMemo(() => {
        if (!isClient) return null;
        return createFrameworkAdapter();
    }, [isClient]);

    // URL로부터 초기 상태 읽기
    const readState = useCallback((): T => {
        if (!isClient || !adapter) {
            return defaultValues;
        }

        const params = adapter.getSearchParams();
        return searchParamsToState(params, defaultValues);
    }, [isClient, adapter, defaultValues]);

    // 내부 상태
    const [state, setInternalState] = useState<T>(readState);
    const stateRef = useRef(state);

    // ref를 최신 상태로 유지
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // URL 업데이트 함수 (즉시 실행)
    const updateUrlImmediate = useCallback(
        (newState: T, updateMode: 'push' | 'replace') => {
            if (!isClient || !adapter) return;

            const currentParams = adapter.getSearchParams();
            const params = stateToSearchParams(
                newState,
                defaultValues,
                keepExistingParams,
                currentParams
            );

            adapter.updateUrl(params, updateMode);
        },
        [isClient, adapter, defaultValues, keepExistingParams]
    );

    // 디바운싱된 URL 업데이트
    const updateUrl = useDebouncedCallback(updateUrlImmediate, debounce, {
        leading: false,
        trailing: true,
    });

    // setState: 상태 병합 (디바운싱 적용)
    const setState = useCallback(
        (updates: Partial<T> | ((prev: T) => Partial<T>)) => {
            const updatesObj =
                typeof updates === 'function' ? updates(stateRef.current) : updates;

            const newState = { ...stateRef.current, ...updatesObj };
            setInternalState(newState);
            updateUrl(newState, mode);
        },
        [mode, updateUrl]
    );

    // push: 히스토리에 추가 (즉시 실행)
    const push = useCallback(
        (updates: Partial<T>) => {
            const newState = { ...stateRef.current, ...updates };
            setInternalState(newState);
            updateUrl.flush(); // 대기 중인 업데이트 취소
            updateUrlImmediate(newState, 'push');
        },
        [updateUrl, updateUrlImmediate]
    );

    // replace: 히스토리 대체 (즉시 실행)
    const replace = useCallback(
        (updates: Partial<T>) => {
            const newState = { ...stateRef.current, ...updates };
            setInternalState(newState);
            updateUrl.flush(); // 대기 중인 업데이트 취소
            updateUrlImmediate(newState, 'replace');
        },
        [updateUrl, updateUrlImmediate]
    );

    // reset: 기본값으로 복원
    const reset = useCallback(() => {
        setInternalState(defaultValues);
        updateUrl.flush();
        updateUrlImmediate(defaultValues, 'replace');
    }, [defaultValues, updateUrl, updateUrlImmediate]);

    // remove: 특정 키 제거
    const remove = useCallback(
        (...keys: (keyof T)[]) => {
            const newState = { ...stateRef.current };
            keys.forEach((key) => {
                delete newState[key];
            });
            setInternalState(newState);
            updateUrl.flush();
            updateUrlImmediate(newState, 'replace');
        },
        [updateUrl, updateUrlImmediate]
    );

    // 외부 URL 변경 감지 (뒤로/앞으로 버튼)
    useEffect(() => {
        if (!isClient || !adapter) return;

        const handleUrlChange = () => {
            const newState = readState();
            setInternalState(newState);
        };

        const unsubscribe = adapter.subscribe(handleUrlChange);

        return () => {
            unsubscribe();
            updateUrl.cancel(); // 언마운트 시 대기 중인 업데이트 취소
        };
    }, [isClient, adapter, readState, updateUrl]);

    return {
        state,
        setState,
        push,
        replace,
        reset,
        remove,
    };
}
