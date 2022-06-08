import { QuestProvider } from '../QuestProvider'
import { QuestKeys } from '../types'

export const arnold = new QuestProvider({
  name: 'Arnold',
  nameTag: 'Assistant',
  description:
    "Potion making requires attention to detail, something I always remind Herbert of every time he blows off his beard! Perhaps if he was a little more organized he'd be able to see the warning labels?",
  title: 'Alchemist Assistance',
  npcImage: undefined,
  quests: [QuestKeys.ALCHEMIST_ASSISTANCE],
  itemDialogueMap: {}
})
