import { AppData } from "../types"
import { APP_STORAGE_KEY, INITIAL_DATA } from "../constants"

const getStorageKey = (userId?: string) =>
  userId ? `${APP_STORAGE_KEY}:${userId}` : APP_STORAGE_KEY

const cloneInitialData = (): AppData =>
  JSON.parse(JSON.stringify(INITIAL_DATA)) as AppData

export const loadData = (userId?: string): AppData => {
  const userKey = getStorageKey(userId)
  const saved = localStorage.getItem(userKey)

  // Backward compatibility: if old global cache exists, use it once for this user.
  const legacySaved =
    !saved && userId ? localStorage.getItem(APP_STORAGE_KEY) : null

  const raw = saved || legacySaved
  if (!raw) return cloneInitialData()

  try {
    const parsed = JSON.parse(raw) as AppData

    if (!saved && legacySaved && userId) {
      localStorage.setItem(userKey, JSON.stringify(parsed))
    }

    return parsed
  } catch (e) {
    return cloneInitialData()
  }
}

export const saveData = (data: AppData, userId?: string) => {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(data))
}

export const clearData = (userId?: string) => {
  localStorage.removeItem(getStorageKey(userId))
}
