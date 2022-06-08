import { useContext } from 'react'
import { AlertTriangle } from 'react-feather'
import { ThemeContext } from 'styled-components'
import PopupBody from './PopupBody'

export default function ErrorPopup({ error }: { error: string }) {
  const theme = useContext(ThemeContext)
  return <PopupBody message={error} Icon={() => <AlertTriangle color={theme.red1} size={24} />} />
}
