import { useEffect, useMemo, useRef, useState } from 'react'
import { debounce } from 'throttle-debounce'

type DebouncePacking<T = unknown> = {
  (nextVal: T): void
  cancel: Function
}

export const useDebounceState = <T = any>(
  defaultValue: T,
  delay: number
): [T, (nextVal: T) => void] => {
  const [debouncedValue, setDebouncedValue] = useState(defaultValue)
  const cancelRef = useRef<DebouncePacking<T>>()

  useEffect(() => () => cancelRef.current?.cancel && cancelRef.current?.cancel(), [])

  const setValue = useMemo(
    () =>
      (cancelRef.current = (debounce(delay, false, (newValue: T) => {
        setDebouncedValue(newValue)
      })) as DebouncePacking<T>),
    [delay]
  )

  return [debouncedValue, setValue]
}
