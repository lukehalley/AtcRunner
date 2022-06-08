import { useDispatch, useSelector } from 'features/hooks'
import { setInventoryOpen } from 'features/items/state'
import FancyModal from '../FancyModal'
import GoldPile from '../GoldPile'
import InventoryBlock from './components/InventoryBlock'
import InventoryGrid from './components/InventoryGrid'
import styles from './index.module.scss'

const InventoryModal = () => {
  const { userItems, inventoryOpen } = useSelector(s => s.items)
  const dispatch = useDispatch()
  function closeModal() {
    dispatch(setInventoryOpen(false))
  }

  return (
    <FancyModal
      className={styles.inventoryModal}
      contentClassName={styles.inventoryContent}
      closeModal={closeModal}
      showModal={inventoryOpen}
      disableTrap
    >
      <div style={{ textAlign: 'center' }}>
        <div className={styles.goldWrapper}>
          <GoldPile />
        </div>
        <div className={styles.inventoryGrid}>
          <InventoryGrid enableConsumables={true} itemMap={userItems} inventoryBlock={InventoryBlock} />
        </div>
      </div>
    </FancyModal>
  )
}

export default InventoryModal
