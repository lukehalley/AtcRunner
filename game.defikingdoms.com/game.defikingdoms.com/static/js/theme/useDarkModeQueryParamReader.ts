import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch } from 'features/hooks'
import { updateUserDarkMode } from 'features/user/actions'
import { parse } from 'qs'

export default function useDarkModeQueryParamReader() {
  const { search } = useLocation()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!search) return
    if (search.length < 2) return

    const parsed = parse(search, {
      parseArrays: false,
      ignoreQueryPrefix: true
    })

    const theme = parsed.theme

    if (typeof theme !== 'string') return

    // if (theme.toLowerCase() === 'light') {
    //   dispatch(updateUserDarkMode({ userDarkMode: false }))
    // } else if (theme.toLowerCase() === 'dark') {
    //   dispatch(updateUserDarkMode({ userDarkMode: true }))
    // }

    // Force dark theme
    if (theme.toLowerCase() === 'light') {
      dispatch(updateUserDarkMode({ userDarkMode: true }))
    } else if (theme.toLowerCase() === 'dark') {
      dispatch(updateUserDarkMode({ userDarkMode: true }))
    }
  }, [dispatch, search])
}
