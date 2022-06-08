import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import swiftnessStoneImage from '../images/swiftness-stone.gif'
import { ItemKeys, ItemType } from '../types'

export const swiftnessStone = new Item({
  key: ItemKeys.SWIFTNESS_STONE,
  name: 'Swiftness Stone',
  description:
    'Applies bonus to new Hero when summoning:<ul><li>+6 AGI</li><li>+5% to Primary Stat Growth</li><li>+13% to Secondary Stat Growth</li></ul>',
  image: swiftnessStoneImage,
  type: ItemType.STONE,
  tokenSymbol: 'DFKSWFTST',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x08f362517aD4119d93bBCd20825c2E4119abB495',
    [ChainId.HARMONY_TESTNET]: '0xB33dD42899864a9C01f680f95Fb86C4bbC65e2FA'
  }
})
