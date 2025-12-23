import { useState, useEffect, useCallback } from 'react'

/**
 * Storage 이벤트를 위한 커스텀 이벤트 디스패처
 * 같은 탭 내에서 스토리지 변경사항을 동기화하기 위해 사용
 */
function dispatchStorageEvent(key: string, newValue: string | null, storage: Storage) {
  window.dispatchEvent(
    new StorageEvent('storage', {
      key,
      newValue,
      storageArea: storage,
      url: window.location.href,
    })
  )
}

/**
 * 제네릭 스토리지 훅을 생성하는 팩토리 함수
 * localStorage와 sessionStorage 모두에서 재사용 가능
 */
export function createStorageHook(storage: Storage) {
  return function useStorageHook<T>(
    key: string,
    initialValue: T
  ): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    // SSR 환경 체크
    const isClient = typeof window !== 'undefined'

    /**
     * 스토리지에서 초기값을 읽어오는 함수
     */
    const readValue = useCallback((): T => {
      if (!isClient) {
        return initialValue
      }

      try {
        const item = storage.getItem(key)
        if (item === null) {
          return initialValue
        }
        return JSON.parse(item) as T
      } catch (error) {
        console.warn(`Error reading ${key} from storage:`, error)
        return initialValue
      }
    }, [key, initialValue, isClient])

    // 초기 상태 설정
    const [storedValue, setStoredValue] = useState<T>(readValue)

    /**
     * 값을 업데이트하고 스토리지에 저장하는 함수
     */
    const setValue = useCallback(
      (value: T | ((prev: T) => T)) => {
        if (!isClient) {
          console.warn('Cannot set value in non-client environment')
          return
        }

        try {
          // 함수형 업데이트 지원
          const newValue = value instanceof Function ? value(storedValue) : value

          // 스토리지에 저장
          storage.setItem(key, JSON.stringify(newValue))

          // 상태 업데이트
          setStoredValue(newValue)

          // 같은 탭 내 다른 컴포넌트에 알림
          dispatchStorageEvent(key, JSON.stringify(newValue), storage)
        } catch (error) {
          console.error(`Error setting ${key} in storage:`, error)
        }
      },
      [key, storedValue, isClient]
    )

    /**
     * 스토리지에서 값을 제거하는 함수
     */
    const removeValue = useCallback(() => {
      if (!isClient) {
        console.warn('Cannot remove value in non-client environment')
        return
      }

      try {
        storage.removeItem(key)
        setStoredValue(initialValue)
        dispatchStorageEvent(key, null, storage)
      } catch (error) {
        console.error(`Error removing ${key} from storage:`, error)
      }
    }, [key, initialValue, isClient])

    /**
     * 다른 탭이나 같은 탭 내에서 스토리지 변경 감지
     */
    useEffect(() => {
      if (!isClient) {
        return
      }

      const handleStorageChange = (e: StorageEvent) => {
        // 같은 키에 대한 변경만 처리
        if (e.key !== key) {
          return
        }

        // 값이 삭제된 경우
        if (e.newValue === null) {
          setStoredValue(initialValue)
          return
        }

        try {
          const newValue = JSON.parse(e.newValue) as T
          setStoredValue(newValue)
        } catch (error) {
          console.error(`Error parsing storage event for ${key}:`, error)
        }
      }

      // storage 이벤트 리스너 등록 (다른 탭 + 같은 탭 모두 감지)
      window.addEventListener('storage', handleStorageChange)

      return () => {
        window.removeEventListener('storage', handleStorageChange)
      }
    }, [key, initialValue, isClient])

    return [storedValue, setValue, removeValue]
  }
}
