import { useState } from 'react'
import { Button } from 'components/Buttons'
import FancyModal from 'components/_DeFiKingdoms/FancyModal'
import { Airdrop, setShowAirdropsModal } from 'features/airdrops'
import { handleClaimAirdrop } from 'features/airdrops/contracts'
import { useDispatch, useSelector } from 'features/hooks'
import { ItemKeys } from 'features/items/types'
import { useTransactionAdder } from 'features/transactions/hooks'
import styles from './index.module.scss'

const AirdropModal = () => {
  const dispatch = useDispatch()
  const addTransaction = useTransactionAdder()
  const [transactionProcessing, setTransactionProcessing] = useState()
  const { airdrops, showAirdropsModal } = useSelector(s => s.airdrops)
  const closeAirdropModal = () => {
    dispatch(setShowAirdropsModal(false))
  }
  const handleClaimAirdropLocal = (airdrop: Airdrop, quantity: number) => {
    handleClaimAirdrop(airdrop, quantity, addTransaction, setTransactionProcessing)
  }

  return (
    <FancyModal
      showModal={showAirdropsModal}
      closeModal={closeAirdropModal}
      contentClassName={styles.airdropModal}
      disableTrap
    >
      <h2>Claim Airdrops</h2>
      <div className={styles.airdropGrid}>
        <div className={styles.headingsRow}>
          <div>Item</div>
          <div>Quantity</div>
          <div>Drop Note</div>
          <div>Claim</div>
        </div>
        {airdrops.map((airdrop: Airdrop) => {
          if (!airdrop) return null
          let finalQuantity = airdrop.quantity
          if (airdrop.item?.key === ItemKeys.JEWEL_BAG || airdrop.item?.key === ItemKeys.CRYSTAL) {
            finalQuantity = Number((airdrop.quantity / 1000000000000000000).toFixed(2))
          }
          if (airdrop.item?.key === ItemKeys.GOLD_BAG) {
            finalQuantity = Number((airdrop.quantity / 1000).toFixed(3))
          }

          return (
            <div key={airdrop.id} className={styles.airdropRow}>
              <div className={styles.leftColumn}>
                {airdrop.item && <img src={airdrop.item.image} />}
                {airdrop.item && airdrop.item.name}
              </div>
              <div className={styles.itemQuantity}>{finalQuantity}</div>
              <div className={styles.airdropNote}>
                <p>{airdrop.note}</p>
              </div>
              <div className={styles.airdropClaim}>
                <Button
                  type="primary"
                  onClick={() => handleClaimAirdropLocal(airdrop, finalQuantity)}
                  disabled={transactionProcessing}
                >
                  Claim
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </FancyModal>
  )
}

export default AirdropModal
