import { useState } from 'react'
import cx from 'classnames'
import FancyBlock from 'components/_DeFiKingdoms/FancyBlock'
import { Item } from 'features/items/Item'
import styles from './InventoryBlock.module.scss'
import ItemTooltip from './ItemTooltip'

interface InventoryBlockProps {
  disabled?: boolean
  item?: Item
  nonUserItem?: boolean
  enableConsumables?: boolean
}

const InventoryBlock = ({ disabled, item, nonUserItem, enableConsumables }: InventoryBlockProps) => {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <>
      <FancyBlock
        className={cx(styles.inventoryBlock, {
          [styles.disabled]: disabled
        })}
        onClick={() => (item ? setShowTooltip(!showTooltip) : null)}
        hoverEffect={typeof item !== 'undefined' && !disabled}
        tabIndex={item ? 0 : -1}
        focusable
      >
        {item && <img src={item.image} alt={item.name} />}
        {!nonUserItem && <p className={styles.quantity}>{item?.quantity}</p>}
        {showTooltip && item && (
          <ItemTooltip
            item={item}
            setShowTooltip={setShowTooltip}
            nonUserItem={nonUserItem}
            enableConsumables={enableConsumables}
          />
        )}
      </FancyBlock>
    </>
  )
}

export default InventoryBlock
