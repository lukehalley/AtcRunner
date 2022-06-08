import ClickAwayListener from 'react-click-away-listener'
import { Button } from 'components/Buttons'
import { addToken } from 'components/_DeFiKingdoms/_helpers/tokens'
import defaultTokenList from 'constants/tokenLists/defikingdoms-default.tokenlist.json'
import { setSelectedHeroHub } from 'features/heroHub/state'
import { ActiveModalType } from 'features/heroHub/types'
import { useDispatch } from 'features/hooks'
import { Item } from 'features/items/Item'
import { setConsumableItem } from 'features/items/state'
import { CustomEvent, CustomEventMethod } from 'features/items/types'
import { getChainId } from 'features/web3/utils'
import styles from './ItemTooltip.module.scss'

interface ItemTooltipProps {
  setShowTooltip: Function
  item: Item
  nonUserItem?: boolean
  enableConsumables?: boolean
}

interface Token {
  chainId: number
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI: string
}

const ItemTooltip = ({ item, setShowTooltip, nonUserItem, enableConsumables }: ItemTooltipProps) => {
  const dispatch = useDispatch()
  const chainId = getChainId()
  const { tokens } = defaultTokenList
  const tokenListMatch: Token | undefined = tokens.find((token: Token) => token.address === item?.addresses[chainId])

  const handleAddTokenClick = () => {
    addToken(item, tokenListMatch)
  }

  const handleConsumableFunction = () => {
    dispatch(setSelectedHeroHub({ modalKey: ActiveModalType.applyItem }))
    dispatch(setConsumableItem(item))
  }

  const handleCustomEventMapping = (eventMapping: CustomEvent) => {
    eventMapping.methods.forEach((eventMethod: CustomEventMethod) => {
      dispatch(eventMethod.func(...eventMethod.args))
    })
  }

  return (
    <ClickAwayListener onClickAway={() => setShowTooltip(false)}>
      <div className={styles.itemTooltip}>
        <h4>{item?.name}</h4>
        {typeof item !== 'undefined' && (
          <p className={styles.itemDescription} dangerouslySetInnerHTML={{ __html: item.description }} />
        )}
        {item.isConsumable && enableConsumables && (
          <Button type="ghost" containerStyle={{ margin: '6px 0' }} fullWidth onClick={handleConsumableFunction}>
            Use Potion
          </Button>
        )}
        {item.customEvents?.map(eventMapping => (
          <Button
            key={eventMapping.label}
            type="ghost"
            containerStyle={{ margin: '6px 0' }}
            fullWidth
            onClick={() => handleCustomEventMapping(eventMapping)}
          >
            {eventMapping.label}
          </Button>
        ))}
        {!nonUserItem && tokenListMatch && (
          <Button type="ghost" containerStyle={{ margin: '6px 0' }} fullWidth onClick={handleAddTokenClick}>
            Add Token
          </Button>
        )}
      </div>
    </ClickAwayListener>
  )
}

export default ItemTooltip
