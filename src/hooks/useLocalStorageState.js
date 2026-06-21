import { useEffect, useState } from 'react'

function readStoredValue(key, fallbackValue) {
  try {
    const rawValue = localStorage.getItem(key)
    return rawValue ? JSON.parse(rawValue) : fallbackValue
  } catch {
    return fallbackValue
  }
}

export function useLocalStorageState(key, fallbackValue) {
  const [value, setValue] = useState(() => readStoredValue(key, fallbackValue))

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
