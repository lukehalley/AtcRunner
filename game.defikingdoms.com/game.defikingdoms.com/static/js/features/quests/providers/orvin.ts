import { QuestProvider } from '../QuestProvider'
import { QuestKeys } from '../types'

export const orvin = new QuestProvider({
  name: 'Orvin',
  nameTag: 'Guard',
  description:
    "These lousy hunks that call themselves guards lack the mental fortitude of our great knight, Ser Deric. It's why he bested the Elrathians all those years ago! Train your mind and you'll be steps ahead of your opponent!",
  title: 'Puzzle Solving',
  npcImage: undefined,
  quests: [QuestKeys.PUZZLE_SOLVING],
  itemDialogueMap: {}
})
