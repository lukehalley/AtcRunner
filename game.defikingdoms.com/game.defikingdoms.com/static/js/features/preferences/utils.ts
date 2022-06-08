import store from 'features'
import serendaleClickCursor from 'assets/images/gui/click-cursor-2x.png'
import serendaleDefaultCursor from 'assets/images/gui/default-cursor-2x.png'

export const getClickCursor = (): string => {
  return serendaleClickCursor
}

export const getDefaultCursor = (): string => {
  return serendaleDefaultCursor
}

export const getDefaultCursorFull = (important?: boolean): string => {
  const showCustomCursor = store.getState().preferences.customCursor
  return showCustomCursor ? `url(${serendaleDefaultCursor}), auto${important ? ' !important' : ''}` : 'auto'
}

export const getClickCursorFull = (important?: boolean): string => {
  const showCustomCursor = store.getState().preferences.customCursor
  return showCustomCursor ? `url(${serendaleClickCursor}), pointer${important ? ' !important' : ''}` : 'pointer'
}
