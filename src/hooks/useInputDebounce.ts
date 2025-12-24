import { useState, useEffect, useCallback } from 'react';
import { useDebouncedCallback } from './useDebouncedCallback';

/**
 * Creates a debounced input value with immediate state updates.
 * Returns both the immediate value (for input binding) and the debounced value (for API calls).
 *
 * @param initialValue - Initial value for the input
 * @param delay - Debounce delay in milliseconds (default: 500ms)
 * @returns Tuple of [value, debouncedValue, setValue]
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [query, debouncedQuery, setQuery] = useInputDebounce('', 500)
 *
 *   // Use debouncedQuery for API calls
 *   useEffect(() => {
 *     if (debouncedQuery) {
 *       api.search(debouncedQuery)
 *     }
 *   }, [debouncedQuery])
 *
 *   return (
 *     <input
 *       value={query}
 *       onChange={(e) => setQuery(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Form validation
 * function EmailInput() {
 *   const [email, debouncedEmail, setEmail] = useInputDebounce('', 300)
 *   const [error, setError] = useState('')
 *
 *   useEffect(() => {
 *     if (debouncedEmail && !debouncedEmail.includes('@')) {
 *       setError('Invalid email')
 *     } else {
 *       setError('')
 *     }
 *   }, [debouncedEmail])
 *
 *   return (
 *     <div>
 *       <input
 *         value={email}
 *         onChange={(e) => setEmail(e.target.value)}
 *       />
 *       {error && <span>{error}</span>}
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Auto-save
 * function DraftEditor() {
 *   const [content, debouncedContent, setContent] = useInputDebounce('', 1000)
 *
 *   useEffect(() => {
 *     if (debouncedContent) {
 *       localStorage.setItem('draft', debouncedContent)
 *       console.log('Draft saved!')
 *     }
 *   }, [debouncedContent])
 *
 *   return (
 *     <textarea
 *       value={content}
 *       onChange={(e) => setContent(e.target.value)}
 *       placeholder="Your content will be auto-saved..."
 *     />
 *   )
 * }
 * ```
 */
export function useInputDebounce<T>(
    initialValue: T,
    delay: number = 500
): [T, T, (value: T) => void] {
    const [value, setValue] = useState<T>(initialValue);
    const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

    // Create debounced update function using useDebounce
    const updateDebouncedValue = useCallback((newValue: T) => {
        setDebouncedValue(newValue);
    }, []);

    const debouncedUpdate = useDebouncedCallback(updateDebouncedValue, delay);

    // Update debounced value when value changes
    useEffect(() => {
        debouncedUpdate(value);
    }, [value, debouncedUpdate]);

    return [value, debouncedValue, setValue];
}
