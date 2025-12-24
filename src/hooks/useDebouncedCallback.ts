import { useCallback, useEffect, useRef } from 'react';

/**
 * Options for debounce behavior
 */
export interface DebounceOptions {
    /**
     * Execute callback on the leading edge (first call)
     * @default false
     */
    leading?: boolean;
    /**
     * Execute callback on the trailing edge (after delay)
     * @default true
     */
    trailing?: boolean;
}

/**
 * Debounced function with control methods
 */
export interface DebouncedFunction<T extends (...args: any[]) => any> {
    /**
     * Call the debounced function
     */
    (...args: Parameters<T>): ReturnType<T> | undefined;
    /**
     * Cancel pending execution
     */
    cancel: () => void;
    /**
     * Execute pending callback immediately
     */
    flush: () => void;
}

/**
 * Creates a debounced function that delays invoking callback until after delay milliseconds
 * have elapsed since the last time the debounced function was invoked.
 *
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds (default: 500ms)
 * @param options - Debounce options for leading/trailing execution
 * @returns Debounced function with cancel and flush methods
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const handleSearch = useDebouncedCallback(
 *     (query: string) => {
 *       console.log('Searching:', query)
 *       api.search(query)
 *     },
 *     500,
 *     { leading: false, trailing: true }
 *   )
 *
 *   return (
 *     <input
 *       onChange={(e) => handleSearch(e.target.value)}
 *       onBlur={() => handleSearch.flush()} // Search immediately on blur
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Button click protection (leading edge)
 * function SubmitButton() {
 *   const handleSubmit = useDebouncedCallback(
 *     () => api.submitForm(),
 *     1000,
 *     { leading: true, trailing: false }
 *   )
 *
 *   return <button onClick={handleSubmit}>Submit</button>
 * }
 * ```
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number = 500,
    options: DebounceOptions = { leading: false, trailing: true }
): DebouncedFunction<T> {
    // Keep reference to latest callback to prevent stale closure
    const callbackRef = useRef(callback);
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // State management
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined
    );
    const lastArgsRef = useRef<Parameters<T> | null>(null);

    // Debounced function
    const debouncedFn = useCallback(
        (...args: Parameters<T>): ReturnType<T> | undefined => {
            lastArgsRef.current = args;

            // Leading: execute immediately if no pending timer
            if (options.leading && !timeoutRef.current) {
                const result = callbackRef.current(...args);

                // Set timer to prevent subsequent calls during delay
                timeoutRef.current = setTimeout(() => {
                    timeoutRef.current = undefined;
                }, delay);

                return result;
            }

            // Clear existing timer
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Trailing: schedule execution after delay
            if (options.trailing) {
                timeoutRef.current = setTimeout(() => {
                    if (lastArgsRef.current) {
                        callbackRef.current(...lastArgsRef.current);
                    }
                    timeoutRef.current = undefined;
                }, delay);
            }

            return undefined;
        },
        [delay, options.leading, options.trailing]
    );

    // Cancel method: clear pending execution
    const cancel = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
        }
        lastArgsRef.current = null;
    }, []);

    // Flush method: execute immediately
    const flush = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
        }
        if (lastArgsRef.current) {
            callbackRef.current(...lastArgsRef.current);
            lastArgsRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Attach methods to function
    const result = debouncedFn as DebouncedFunction<T>;
    result.cancel = cancel;
    result.flush = flush;

    return result;
}
