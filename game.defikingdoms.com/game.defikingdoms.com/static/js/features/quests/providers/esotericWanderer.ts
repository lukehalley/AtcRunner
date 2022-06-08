import { QuestProvider } from '../QuestProvider'
import { QuestKeys } from '../types'

export const esotericWanderer = new QuestProvider({
  name: 'Esoteric Wanderer',
  description:
    "It is said that the sparkling waters of this well hold a magical connection to Gaia's will. At times, her Tears spring forth from the depths, and Heroes who commune here slowly grow in power...",
  title: 'Wishing Well',
  npcImage: undefined,
  quests: [QuestKeys.WISHING_WELL_0],
  itemDialogueMap: {}
})
