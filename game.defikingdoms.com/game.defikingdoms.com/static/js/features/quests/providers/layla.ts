import { QuestProvider } from '../QuestProvider'
import { QuestKeys } from '../types'

export const layla = new QuestProvider({
  name: 'Layla',
  nameTag: 'Thief',
  description: 'Despite that annoying cat getting in my way, I love to come here and have an ale while playing darts!',
  title: 'Darts',
  npcImage: undefined,
  quests: [QuestKeys.DARTS],
  itemDialogueMap: {}
})
