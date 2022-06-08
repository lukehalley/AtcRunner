import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import antiblindnessPotionImage from '../images/blindness-potion.png'
import { ItemKeys, ItemType } from '../types'

export const antiblindnessPotion = new Item({
  key: ItemKeys.BLINDNESS_POTION,
  name: 'Anti-blinding Potion',
  description:
    'Interacts with the magical energies that cause blinding, rendering them powerless and restoring sight. Grants immunity to blindness while the effects linger.',
  image: antiblindnessPotionImage,
  type: ItemType.POTION,
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x1771dEc8D9A29F30d82443dE0a69e7b6824e2F53',
    [ChainId.HARMONY_TESTNET]: '0x9D2C253a10738A8b2762b4cd17F3F98F39F86167'
  },
  tokenSymbol: 'DFKANTBLND',
  marketPrice: 3000,
  craftingIngredients: [
    {
      item: ItemKeys.LANTERNEYE,
      quantity: 2
    },
    {
      item: ItemKeys.DARKWEED,
      quantity: 7
    },
    {
      item: ItemKeys.MILKWEED,
      quantity: 2
    },
    {
      item: ItemKeys.GAIASTEARS,
      quantity: 5
    },
    {
      item: ItemKeys.GOLD_PILE,
      quantity: 300
    }
  ]
})
