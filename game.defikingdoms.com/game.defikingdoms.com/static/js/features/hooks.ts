import { TypedUseSelectorHook, useSelector as selector, useDispatch as dispatch } from 'react-redux'
import { AppState, AppDispatch } from '.'

export const useSelector: TypedUseSelectorHook<AppState> = selector
export const useDispatch = (): AppDispatch => dispatch<AppDispatch>()
