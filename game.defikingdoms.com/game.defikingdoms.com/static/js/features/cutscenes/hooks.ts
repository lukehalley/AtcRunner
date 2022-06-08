import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch } from 'features/hooks'
import { setCutscenesMap } from './state'
import { CutsceneMap } from './types'

export function useInitCutscenes(cutscenesMap: CutsceneMap) {
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  useEffect(() => {
    if (cutscenesMap) {
      dispatch(setCutscenesMap({ cutscenesMap, pathname }))
    }
  }, [cutscenesMap, pathname])
}
