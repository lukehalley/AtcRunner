import { ItemKeys } from 'features/items/types'
import { QuestKeys } from './types'

export class QuestProvider {
  name: string
  nameTag?: string
  description: string
  title: string
  npcImage?: string
  quests: QuestKeys[]
  itemDialogueMap: { [key in ItemKeys]?: string }

  constructor(dataMap: {
    name: string
    nameTag?: string
    description: string
    title: string
    npcImage?: string
    quests: QuestKeys[]
    itemDialogueMap: { [key in ItemKeys]?: string }
  }) {
    this.name = dataMap.name
    this.nameTag = dataMap.nameTag
    this.description = dataMap.description
    this.title = dataMap.title
    this.npcImage = dataMap.npcImage
    this.quests = dataMap.quests
    this.itemDialogueMap = dataMap.itemDialogueMap
  }
}
