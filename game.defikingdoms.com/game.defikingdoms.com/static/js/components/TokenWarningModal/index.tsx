import { useCallback } from 'react'
import { ImportToken } from 'components/SearchModal/ImportToken'
import { Token } from 'constants/sdk-extra'
import Modal from '../Modal'

export default function TokenWarningModal({
  isOpen,
  tokens,
  onConfirm
}: {
  isOpen: boolean
  tokens: Token[]
  onConfirm: () => void
}) {
  const handleDismiss = useCallback(() => null, [])

  return (
    <Modal isOpen={isOpen} onDismiss={handleDismiss} maxHeight={90}>
      <ImportToken tokens={tokens} handleCurrencySelect={onConfirm} />
    </Modal>
  )
}
