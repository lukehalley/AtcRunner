import { ItemKeys } from 'features/items/types'
import miningNPC from 'assets/images/professions/profile-gren.png'
import { QuestProvider } from '../QuestProvider'
import { QuestKeys } from '../types'

export const quarrysmithGren = new QuestProvider({
  name: 'Quarrysmith Gren',
  description:
    "The tunnels run deep in Hollowberry Mines. Careful you mind your path or you'll be lost in the dark for good.",
  title: 'Mining Quests',
  npcImage: miningNPC,
  quests: [QuestKeys.JEWEL_MINING_0, QuestKeys.GOLD_MINING_0],
  itemDialogueMap: {
    [ItemKeys?.JEWEL_BAG]: "That's quite a haul today! You look exhausted, go rest up before you try to keep going.",
    [ItemKeys?.GOLD_BAG]: "That's a decent haul. But if you want more, you'll have to go deeper."
  }
})
