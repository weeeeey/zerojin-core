import type { UrlStateValue, UrlStateRecord } from './types';

/**
 * 값을 URL 문자열로 직렬화
 * @param value - 직렬화할 값
 * @returns URL 문자열 또는 null (제거를 의미)
 */
export function serializeValue(value: UrlStateValue): string | null {
    if (value === null || value === undefined) {
        return null;
    }

    if (Array.isArray(value)) {
        // 빈 배열은 빈 문자열로
        if (value.length === 0) {
            return '';
        }
        // 쉼표로 구분된 배열: ['a', 'b'] → "a,b"
        return value.map((v) => encodeURIComponent(String(v))).join(',');
    }

    if (typeof value === 'boolean') {
        // 불리언을 문자열로: true → "true", false → "false"
        return value ? 'true' : 'false';
    }

    // 숫자와 문자열은 인코딩하여 반환
    return encodeURIComponent(String(value));
}

/**
 * URL 문자열을 타입 값으로 역직렬화
 * @param value - URL 문자열
 * @param defaultValue - 타입 추론을 위한 기본값
 * @returns 역직렬화된 값
 */
export function deserializeValue(
    value: string,
    defaultValue?: UrlStateValue
): UrlStateValue {
    if (!value && value !== '0' && value !== 'false') {
        // 빈 문자열이면서 0이나 false가 아닌 경우
        if (Array.isArray(defaultValue)) {
            return []; // 빈 배열
        }
        return defaultValue ?? '';
    }

    // defaultValue로부터 타입 추론
    if (Array.isArray(defaultValue)) {
        // 배열 처리
        const parts =
            value === '' ? [] : value.split(',').map((v) => decodeURIComponent(v));

        // 배열 요소 타입 추론
        if (defaultValue.length > 0) {
            const elementType = typeof defaultValue[0];

            if (elementType === 'number') {
                return parts.map((v) => Number(v)).filter((n) => !isNaN(n));
            }

            if (elementType === 'boolean') {
                return parts.map((v) => v === 'true');
            }
        }

        // 기본: 문자열 배열
        return parts;
    }

    if (typeof defaultValue === 'number') {
        const num = Number(decodeURIComponent(value));
        return isNaN(num) ? defaultValue : num;
    }

    if (typeof defaultValue === 'boolean') {
        return decodeURIComponent(value) === 'true';
    }

    // 기본: 문자열
    return decodeURIComponent(value);
}

/**
 * 상태 객체를 URLSearchParams로 변환
 * @param state - 상태 객체
 * @param defaultValues - 기본값 (타입 추론용)
 * @param keepExisting - 기존 파라미터 유지 여부
 * @param currentParams - 현재 URLSearchParams
 * @returns URLSearchParams 객체
 */
export function stateToSearchParams<T extends UrlStateRecord>(
    state: T,
    defaultValues: T,
    keepExisting: boolean,
    currentParams?: URLSearchParams
): URLSearchParams {
    const params = new URLSearchParams(
        keepExisting && currentParams ? currentParams : undefined
    );

    // state의 각 키-값 쌍을 URL params로 변환
    Object.entries(state).forEach(([key, value]) => {
        const serialized = serializeValue(value);

        if (serialized === null) {
            // null이면 URL에서 제거
            params.delete(key);
        } else {
            params.set(key, serialized);
        }
    });

    return params;
}

/**
 * URLSearchParams를 상태 객체로 변환
 * @param params - URLSearchParams 객체
 * @param defaultValues - 기본값 (타입 추론용)
 * @returns 상태 객체
 */
export function searchParamsToState<T extends UrlStateRecord>(
    params: URLSearchParams,
    defaultValues: T
): T {
    const state = { ...defaultValues } as T;

    // URL params를 순회하며 상태 객체로 변환
    params.forEach((value, key) => {
        if (key in defaultValues) {
            state[key as keyof T] = deserializeValue(
                value,
                defaultValues[key]
            ) as T[keyof T];
        }
    });

    return state;
}
