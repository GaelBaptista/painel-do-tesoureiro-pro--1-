import { AppData } from "../types"
import { APP_STORAGE_KEY, INITIAL_DATA } from "../constants"

export const loadData = (): AppData => {
  const saved = localStorage.getItem(APP_STORAGE_KEY)
  if (!saved) return INITIAL_DATA
  try {
    return JSON.parse(saved)
  } catch (e) {
    return INITIAL_DATA
  }
}

export const saveData = (data: AppData) => {
  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(data))
}
