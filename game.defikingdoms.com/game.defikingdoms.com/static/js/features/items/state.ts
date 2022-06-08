import { createSlice } from '@reduxjs/toolkit'
import { ApprovalState } from 'hooks/useApproveCallback'
import { Item } from './Item'
import { itemMap } from './constants'
import { ItemKeys } from './types'
import { ConsumedItemReward } from './types'

interface ItemSliceState {
  userItems: any
  salesItems: any
  itemApprovalMap: any
  goldBalance: number
  inventoryOpen: boolean
  loading: boolean
  consumableItem: Item | null
  consumedItemReward: ConsumedItemReward | null
  consumedItemRewardModalOpen: boolean
  showLorePageModal: boolean
  selectedLorePageIndex: number
}

const initialState: ItemSliceState = {
  userItems: {},
  salesItems: {},
  itemApprovalMap: {},
  goldBalance: 0,
  inventoryOpen: false,
  loading: false,
  consumableItem: null,
  consumedItemReward: null,
  consumedItemRewardModalOpen: false,
  showLorePageModal: false,
  selectedLorePageIndex: 0
}

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    setUserItemMap(state, action) {
      state.userItems = action.payload
    },
    updateItemQuantity(state, action) {
      const itemKey = action.payload.itemKey
      const quantity = action.payload.quantity
      const newItems = Object.assign({}, state.userItems)

      if (newItems[itemKey]) {
        if (quantity <= 0) {
          delete newItems[itemKey]
        } else {
          newItems[itemKey].quantity = quantity
        }
      } else if (quantity > 0) {
        newItems[itemKey] = { ...itemMap[itemKey as ItemKeys], quantity }
      }
      state.userItems = newItems
    },
    setInventoryOpen(state, action) {
      state.inventoryOpen = action.payload
    },
    setItemsLoading(state, action) {
      state.loading = action.payload
    },
    setSalesItemMap(state, action) {
      state.salesItems = action.payload
    },
    setGoldBalance(state, action) {
      state.goldBalance = action.payload
    },
    updateGoldBalance(state, action) {
      const diff = action.payload
      state.goldBalance += diff
    },
    updateItemApprovalMap(
      state,
      action: {
        payload: { key: ItemKeys; itemTokenApproval: ApprovalState }
      }
    ) {
      const itemKey = action.payload.key
      const newApprovals = Object.assign(state.itemApprovalMap, {})

      newApprovals[itemKey] = action.payload.itemTokenApproval
      state.itemApprovalMap = newApprovals
    },
    setConsumableItem(state, action: { payload: Item | null }) {
      state.consumableItem = action.payload
    },
    setConsumedItemReward(state, action: { payload: any }) {
      state.consumedItemReward = action.payload
    },
    setConsumedItemRewardModalOpen(state, action: { payload: boolean }) {
      state.consumedItemRewardModalOpen = action.payload
    },
    setShowLorePageModal(state, action: { payload: boolean }) {
      state.showLorePageModal = action.payload
    },
    setSelectedLorePageIndex(state, action: { payload: number }) {
      state.selectedLorePageIndex = action.payload
    },
    setItemDefaults() {
      return initialState
    }
  }
})

const { actions, reducer } = itemsSlice
export const {
  setUserItemMap,
  setSalesItemMap,
  setInventoryOpen,
  setItemsLoading,
  updateItemQuantity,
  setGoldBalance,
  updateGoldBalance,
  updateItemApprovalMap,
  setConsumableItem,
  setConsumedItemReward,
  setConsumedItemRewardModalOpen,
  setShowLorePageModal,
  setSelectedLorePageIndex,
  setItemDefaults
} = actions
export default reducer
