import { useCallback, useEffect, useRef } from 'react'

/**
 * Options for throttle behavior
 */
export interface ThrottleOptions {
  /**
   * Execute callback on the leading edge (first call)
   * @default true
   */
  leading?: boolean
  /**
   * Execute callback on the trailing edge (after delay)
   * @default false
   */
  trailing?: boolean
}

/**
 * Throttled function with control methods
 */
export interface ThrottledFunction<T extends (...args: any[]) => any> {
  /**
   * Call the throttled function
   */
  (...args: Parameters<T>): ReturnType<T> | undefined
  /**
   * Cancel pending execution
   */
  cancel: () => void
  /**
   * Execute pending callback immediately
   */
  flush: () => void
}

/**
 * Creates a throttled function that only invokes callback at most once per delay period.
 *
 * @param callback - The function to throttle
 * @param delay - The delay in milliseconds (default: 500ms)
 * @param options - Throttle options for leading/trailing execution
 * @returns Throttled function with cancel and flush methods
 *
 * @example
 * ```tsx
 * function ScrollTracker() {
 *   const handleScroll = useThrottle(
 *     (scrollY: number) => {
 *       console.log('Scroll position:', scrollY)
 *       api.trackScrollPosition(scrollY)
 *     },
 *     200,
 *     { leading: true, trailing: false }
 *   )
 *
 *   useEffect(() => {
 *     const onScroll = () => handleScroll(window.scrollY)
 *     window.addEventListener('scroll', onScroll)
 *
 *     return () => {
 *       handleScroll.flush() // Send final position on unmount
 *       window.removeEventListener('scroll', onScroll)
 *     }
 *   }, [])
 *
 *   return <div>Tracking scroll...</div>
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Button click protection (prevent rapid clicks)
 * function SubmitButton() {
 *   const handleSubmit = useThrottle(
 *     () => api.submitForm(),
 *     2000,
 *     { leading: true, trailing: false }
 *   )
 *
 *   return <button onClick={handleSubmit}>Submit</button>
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Window resize handler with trailing execution
 * function ResizeHandler() {
 *   const handleResize = useThrottle(
 *     (width: number, height: number) => {
 *       console.log('Window resized:', width, height)
 *       updateLayout(width, height)
 *     },
 *     300,
 *     { leading: false, trailing: true }
 *   )
 *
 *   useEffect(() => {
 *     const onResize = () => handleResize(window.innerWidth, window.innerHeight)
 *     window.addEventListener('resize', onResize)
 *     return () => window.removeEventListener('resize', onResize)
 *   }, [])
 *
 *   return <div>...</div>
 * }
 * ```
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500,
  options: ThrottleOptions = { leading: true, trailing: false }
): ThrottledFunction<T> {
  // Keep reference to latest callback to prevent stale closure
  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // State management
  const lastCallTimeRef = useRef<number>(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const lastArgsRef = useRef<Parameters<T> | null>(null)

  // Throttled function
  const throttledFn = useCallback(
    (...args: Parameters<T>): ReturnType<T> | undefined => {
      const currentTime = Date.now()
      const timeSinceLastCall = currentTime - lastCallTimeRef.current
      lastArgsRef.current = args

      // Leading: execute immediately if enough time has passed
      if (options.leading && timeSinceLastCall >= delay) {
        lastCallTimeRef.current = currentTime
        return callbackRef.current(...args)
      }

      // Trailing: schedule execution for remaining time
      if (options.trailing) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        const remainingTime = delay - timeSinceLastCall
        timeoutRef.current = setTimeout(() => {
          lastCallTimeRef.current = Date.now()
          if (lastArgsRef.current) {
            callbackRef.current(...lastArgsRef.current)
          }
          timeoutRef.current = undefined
        }, remainingTime)
      }

      return undefined
    },
    [delay, options.leading, options.trailing]
  )

  // Cancel method: clear pending execution and reset timer
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
    lastCallTimeRef.current = 0
    lastArgsRef.current = null
  }, [])

  // Flush method: execute immediately and reset timer
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
    if (lastArgsRef.current) {
      callbackRef.current(...lastArgsRef.current)
      lastCallTimeRef.current = Date.now()
      lastArgsRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Attach methods to function
  const result = throttledFn as ThrottledFunction<T>
  result.cancel = cancel
  result.flush = flush

  return result
}
