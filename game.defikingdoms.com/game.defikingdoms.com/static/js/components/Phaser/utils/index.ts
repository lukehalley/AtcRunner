import { useEffect } from 'react'

export const useBlockPropagation = (elementSelector: string) => {
  useEffect(() => {
    const element = document.querySelector(elementSelector)
    if (element) {
      for (const eventName of ['mouseup', 'mousedown', 'touchstart', 'touchmove', 'touchend', 'touchcancel']) {
        element.addEventListener(eventName, (e: any) => e.stopPropagation())
      }
    }
  }, [])
}

export const useBlockPropagationTrigger = (elementSelector: string, trigger: boolean) => {
  useEffect(() => {
    const element = document.querySelector(elementSelector)
    if (element) {
      for (const eventName of ['mouseup', 'mousedown', 'touchstart', 'touchmove', 'touchend', 'touchcancel']) {
        element.addEventListener(eventName, (e: any) => e.stopPropagation())
      }
    }
  }, [trigger])
}
