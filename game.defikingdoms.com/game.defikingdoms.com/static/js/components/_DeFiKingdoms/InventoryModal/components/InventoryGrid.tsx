import { ItemType } from 'features/items/types'

interface InventoryGridProps {
  approval?: any
  approvalCallback?: any
  approvalAddress?: string
  enableConsumables?: boolean
  inventoryBlock: any
  itemMap: any
  itemWhitelist?: Array<string>
  minBlocks?: number
  onSelect?: Function
  whitelistType?: ItemType
}

const InventoryGrid = ({
  approval,
  approvalCallback,
  approvalAddress,
  enableConsumables,
  inventoryBlock,
  itemMap,
  itemWhitelist,
  minBlocks,
  onSelect,
  whitelistType
}: InventoryGridProps) => {
  const InventoryBlock = inventoryBlock
  const generateInventoryBlocks = () => {
    const minimumBlocks = typeof minBlocks !== 'undefined' ? minBlocks : 30
    const itemLength = Object.entries(itemMap).length
    if (itemMap && itemLength > 0) {
      const blockDiff = minimumBlocks - itemLength
      const mappedItems = Object.entries(itemMap).map(([key, item]: any) => {
        return (
          <InventoryBlock
            key={key}
            item={item}
            approval={approval}
            approvalCallback={approvalCallback}
            approvalAddress={approvalAddress}
            enableConsumables={enableConsumables}
            onSelect={onSelect}
            itemWhitelist={itemWhitelist}
            whitelistType={whitelistType}
          />
        )
      })

      if (blockDiff > 0) {
        const emptyBlocks = [...Array(blockDiff)].map((_, index) => <InventoryBlock key={index} />)
        return mappedItems.concat(emptyBlocks)
      } else {
        return mappedItems
      }
    } else {
      return [...Array(minimumBlocks)].map((_, index) => <InventoryBlock key={index} />)
    }
  }

  return <>{generateInventoryBlocks()}</>
}

export default InventoryGrid
