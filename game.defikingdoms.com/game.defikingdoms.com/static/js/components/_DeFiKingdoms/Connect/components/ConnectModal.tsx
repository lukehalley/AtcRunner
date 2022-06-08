import { useState } from 'react'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { Button } from 'components/Buttons'
import FancyModal from 'components/_DeFiKingdoms/FancyModal'
import { injected } from '../../../../connectors'
import styles from './ConnectModal.module.scss'

interface ConnectModalProps {
  dismissModal: Function
  showModal: boolean
}

const ConnectModal = ({ dismissModal, showModal }: ConnectModalProps) => {
  const { activate } = useWeb3React()
  const [pendingConnect, setPendingConnect] = useState(false)

  const handleInstallMetamask = () => {
    window.open('https://metamask.io/', '_blank')
  }

  const handleInstallCoinbase = () => {
    window.open('https://www.coinbase.com/wallet', '_blank')
  }

  const tryActivation = () => {
    setPendingConnect(true)

    activate(injected, undefined, true)
      .then(() => {
        setPendingConnect(false)
        dismissModal()
      })
      .catch(error => {
        setPendingConnect(false)
        if (error instanceof UnsupportedChainIdError) {
          activate(injected) // a little janky...can't use setError because the connector isn't set
        }
      })
  }

  function generateConnection() {
    if (!(window.web3 || window.ethereum)) {
      return (
        <>
          <Button type="new" onClick={handleInstallMetamask} fullWidth>
            Install MetaMask
          </Button>
          <Button type="new" onClick={handleInstallCoinbase} fullWidth>
            Install Coinbase Wallet
          </Button>
        </>
      )
    } else {
      return (
        <Button type="new" onClick={tryActivation} loading={pendingConnect} disabled={pendingConnect} fullWidth>
          Connect Wallet
        </Button>
      )
    }
  }

  return (
    <FancyModal
      className={styles.connectModal}
      wrapperClassName={styles.connectModalWrapper}
      contentClassName={styles.connectModalContent}
      title="Connect to a Wallet"
      closeModal={dismissModal}
      showModal={showModal}
      showTitle
      disableTrap
    >
      <div className={styles.connectTextContent}>
        {generateConnection()}
        <h3>New to DeFi Kingdoms?</h3>
        <div className={styles.tutorialRow}>
          <Button type="ghostDark" style={{ padding: 0 }} fullWidth>
            <a
              style={{ display: 'block', padding: '8px 20px' }}
              href="https://defikingdoms.com/tutorial.html"
              target="__blank"
            >
              <div style={{ color: '#744e45', fontSize: '13px' }}>Read the DFK tutorial</div>
            </a>
          </Button>
          <Button type="ghostDark" style={{ padding: 0 }} fullWidth>
            <a
              style={{ display: 'block', padding: '8px 20px' }}
              href="https://docs.harmony.one/home/network/wallets/browser-extensions-wallets/metamask-wallet"
              target="__blank"
            >
              <div style={{ color: '#744e45', fontSize: '13px' }}>Learn about wallets</div>
            </a>
          </Button>
        </div>
      </div>
    </FancyModal>
  )
}

export default ConnectModal
