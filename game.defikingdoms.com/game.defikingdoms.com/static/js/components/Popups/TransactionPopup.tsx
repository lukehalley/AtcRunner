import { useContext } from 'react'
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'react-feather'
import { NotificationLevel } from 'features/notifications'
import { getChainId } from 'features/web3/utils'
import useBlockchain from 'hooks/useBlockchain'
import { ThemeContext } from 'styled-components'
import { getEtherscanLink } from 'utils'
import getExplorerName from 'utils/getExplorerName'
import PopupBody from './PopupBody'

export default function TransactionPopup({
  hash,
  success,
  summary,
  level
}: {
  hash: string
  success?: boolean
  summary?: string
  level?: NotificationLevel | undefined
}) {
  const chainId = getChainId()
  const theme = useContext(ThemeContext)
  const blockchain = useBlockchain()
  const explorerName = getExplorerName(blockchain)
  const getIcon = (level: NotificationLevel) => {
    switch (level) {
      case NotificationLevel.error:
        return <AlertTriangle color={theme.red1} size={24} />
      case NotificationLevel.warning:
        return <AlertCircle color={theme.yellow1} size={24} />
      case NotificationLevel.success:
        return <CheckCircle color={theme.green1} size={24} />
      case NotificationLevel.info:
      default:
        // default to info
        return <Info color={theme.blue1} size={24} />
    }
  }
  return (
    <PopupBody
      message={summary ?? 'Hash: ' + hash.slice(0, 8) + '...' + hash.slice(58, 65)}
      Icon={() => getIcon(level ? level : success ? NotificationLevel.success : NotificationLevel.error)}
      linkText={`View on ${explorerName}`}
      link={chainId && getEtherscanLink(chainId, hash, 'transaction')}
    />
  )
}
