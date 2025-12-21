import { useEffect, useState } from 'react'

/**
 * Debounces a value by delaying updates until after a specified delay period.
 *
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [search, setSearch] = useState('')
 *   const debouncedSearch = useDebounce(search, 300)
 *
 *   useEffect(() => {
 *     // API call with debounced value
 *     fetchResults(debouncedSearch)
 *   }, [debouncedSearch])
 *
 *   return <input value={search} onChange={(e) => setSearch(e.target.value)} />
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
