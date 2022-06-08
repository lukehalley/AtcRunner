import { ChainId } from 'constants/sdk-extra'
import { Item } from '../Item'
import witCrystalImage from '../images/wit-crystal.gif'
import { ItemKeys, ItemType } from '../types'

export const witCrystal = new Item({
  key: ItemKeys.WIT_CRYSTAL,
  name: 'Wit Crystal',
  description:
    'Applies the following temporary modifiers when leveling:<ul><li>+10% to Primary Stat Growth roll for INT</li><li>+30% to Secondary Stat Growth roll for INT</li></ul>',
  image: witCrystalImage,
  type: ItemType.CRYSTAL,
  tokenSymbol: 'DFKWITCR',
  addresses: {
    [ChainId.HARMONY_MAINNET]: '0x3619fc2386FbBC19DDC39d29A72457e758CFAD69',
    [ChainId.HARMONY_TESTNET]: '0xC1bb514E55b861afEff2E9413Cd37638e3994186'
  }
})
