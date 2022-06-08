import { useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import cx from 'classnames'
import { Button } from 'components/Buttons'
import { ChainId } from 'constants/sdk-extra'
import { setupNetworkByChain } from 'utils/setupNetwork'
import dfkCrystalvaleLogo from 'assets/images/dfk-crystalvale-logo.png'
import dfkSerendaleLogo from 'assets/images/dfk-serendale-logo.png'
import dfkLogo from 'assets/images/dfk_landing_logo.png'
import ConnectModal from './components/ConnectModal'
import styles from './index.module.scss'

export default function Connect() {
  const { account } = useWeb3React()
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [selectedRealm, setSelectedRealm] = useState('serendale')

  const tourLink = () => {
    window.open('https://defikingdoms.com/tutorial.html', '_blank')
  }

  const cvTourLink = () => {
    window.open('https://defikingdoms.com/crystalvaletour.html', '_blank')
  }

  const renderConnect = () => {
    if (account) {
      return (
        <>
          {selectedRealm === 'serendale' ? (
            <>
              <img src={dfkSerendaleLogo} alt="DefiKingdom Serendale Logo" />
              <Button
                onClick={() => setupNetworkByChain(ChainId.HARMONY_MAINNET)}
                type="new"
                containerStyle={{ marginTop: 12, maxWidth: 420 }}
                fullWidth
              >
                Enter Serendale
              </Button>
              <Button onClick={tourLink} type="new" containerStyle={{ marginTop: 12, maxWidth: 420 }} fullWidth>
                Take the Tour
              </Button>
              <Button
                onClick={() => setSelectedRealm('crystalvale')}
                type="new"
                containerStyle={{ marginTop: 12, maxWidth: 420 }}
                fullWidth
              >
                Check out Crystalvale
              </Button>
            </>
          ) : (
            <>
              <img className={styles.crystalvaleLogo} src={dfkCrystalvaleLogo} alt="DefiKingdom Crystalvale Logo" />
              <Button
                onClick={() => setupNetworkByChain(ChainId.AVALANCHE_C_CHAIN)}
                type="newblue"
                containerStyle={{ marginTop: 12, maxWidth: 420 }}
                fullWidth
              >
                Enter Crystalvale
              </Button>
              <Button onClick={cvTourLink} type="newblue" containerStyle={{ marginTop: 12, maxWidth: 420 }} fullWidth>
                Take the Tour
              </Button>
              <Button
                onClick={() => setSelectedRealm('serendale')}
                type="newblue"
                containerStyle={{ marginTop: 12, maxWidth: 420 }}
                fullWidth
              >
                Check out Serendale
              </Button>
            </>
          )}
        </>
      )
    } else {
      return (
        <>
          <img src={dfkLogo} alt="DefiKingdom Logo" />
          <Button
            onClick={() => setShowConnectModal(true)}
            type="new"
            containerStyle={{ marginTop: 48, maxWidth: 360 }}
            fullWidth
          >
            Play
          </Button>
        </>
      )
    }
  }

  return (
    <>
      <section className={cx(styles.loginPage, { [styles.cvBg]: selectedRealm !== 'serendale' })}>
        <div className={styles.overlay} />
        <div className={styles.contentWrapper}>{renderConnect()}</div>
      </section>
      <ConnectModal showModal={showConnectModal} dismissModal={() => setShowConnectModal(false)} />
    </>
  )
}
