import { QuestProvider } from '../QuestProvider'
import { QuestKeys } from '../types'

export const farmerQuill = new QuestProvider({
  name: 'Farmer Quill',
  nameTag: 'Farmer',
  description:
    'My family is one of the largest and oldest suppliers of produce for Serendale. I take pride in carrying the business through another generation. Ma and pa would be proud!',
  title: 'Helping the Farm',
  npcImage: undefined,
  quests: [QuestKeys.HELPING_THE_FARM],
  itemDialogueMap: {}
})
