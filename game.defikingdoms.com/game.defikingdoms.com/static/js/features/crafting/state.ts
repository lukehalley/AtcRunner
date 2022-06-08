import { createSlice } from '@reduxjs/toolkit'
import { Item } from 'features/items/Item'
import { healthPotion } from 'features/items/instances/health-potion'
import { DateTime } from 'luxon'
import { CraftedItem } from './types'

type CraftingSliceState = {
  craftingItem: Item
  craftedItems: CraftedItem | null
  showCraftingConfirmationModal: boolean
  craftingModalTitle: string
  workingUntil: DateTime | null
  awayUntil: DateTime | null
}

const initialState: CraftingSliceState = {
  craftingItem: healthPotion,
  craftedItems: null,
  showCraftingConfirmationModal: false,
  craftingModalTitle: 'Crafting Complete',
  workingUntil: null,
  awayUntil: null
}

const craftingSlice = createSlice({
  name: 'crafting',
  initialState,
  reducers: {
    setCraftingItem(state, action) {
      state.craftingItem = action.payload
    },
    setCraftedItems(state, action) {
      state.craftedItems = action.payload
    },
    setShowCraftingConfirmationModal(state, action: { payload: boolean }) {
      state.showCraftingConfirmationModal = action.payload
    },
    setCraftingModalTitle(state, action: { payload: string }) {
      state.craftingModalTitle = action.payload
    },
    setAwayUntil(state, action: { payload: DateTime | null }) {
      state.awayUntil = action.payload
    },
    setWorkingUntil(state, action: { payload: DateTime | null }) {
      state.workingUntil = action.payload
    }
  }
})

const { actions, reducer } = craftingSlice
export const {
  setCraftingItem,
  setCraftedItems,
  setShowCraftingConfirmationModal,
  setCraftingModalTitle,
  setAwayUntil,
  setWorkingUntil
} = actions
export default reducer
