import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { BigNumber } from 'ethers'
import { AppState } from 'features'
import errorHandler from 'utils/errorHandler'
import { getPets, getPetsCatalog } from './api'
import { defaultPetFilters } from './constants'
import {
  ActiveIncubation,
  ActiveViewerTab,
  BasicFilters,
  BasicFilterKeys,
  FilterMap,
  FilterType,
  PetData,
  ValueMap
} from './types'
import { GetPetsPayload, GetUserPetsPayload } from './types'
import { createUpdatedValueMap, getParams, isValueMap } from './utils'

interface PetsSliceState {
  showAnimations: boolean
  showPetViewer: boolean
  petViewerTitle: string
  hatchedPet: PetData | null
  showHatchedPetModal: boolean
  petViewerModalPet: PetData | null
  petViewerModalTitle: string
  allFlipped: boolean
  allAnimated: boolean
  sellAmount: number
  loading: boolean
  userPetsLoading: boolean
  petCatalog: PetData[]
  petFilters: FilterMap
  totalPetCatalog: number
  userPets: PetData[]
  totalUserPets: number
  selectedPet: PetData | null
  activeViewerTab: ActiveViewerTab
  showSellModal: boolean
  showSendModal: boolean
  showBuyModal: boolean
  showPetDetailsModal: boolean
  activeIncubations: ActiveIncubation[]
}

const initialState: PetsSliceState = {
  showAnimations: true,
  showPetViewer: false,
  petViewerTitle: '',
  hatchedPet: null,
  showHatchedPetModal: false,
  petViewerModalPet: null,
  petViewerModalTitle: '',
  allFlipped: false,
  allAnimated: true,
  sellAmount: 0,
  loading: false,
  userPetsLoading: false,
  petCatalog: [],
  petFilters: defaultPetFilters,
  totalPetCatalog: 0,
  userPets: [],
  totalUserPets: 0,
  selectedPet: null,
  activeViewerTab: ActiveViewerTab.PET_CATALOG,
  showSellModal: false,
  showSendModal: false,
  showBuyModal: false,
  showPetDetailsModal: false,
  activeIncubations: []
}

export const fetchPetCatalog = createAsyncThunk(
  'pets/fetchPetCatalog',
  async ({ offset, order }: GetPetsPayload, { getState }) => {
    const state = getState() as AppState
    const params = getParams(state.pets.petFilters)
    const petCatalog = await getPetsCatalog({ params, offset, order })
    return petCatalog
  }
)

export const fetchUserPets = createAsyncThunk(
  'pets/fetchUserPets',
  async ({ account, offset, order, chainId }: GetUserPetsPayload, { getState }) => {
    if (account) {
      const state = getState() as AppState
      const params = getParams(state.pets.petFilters)
      const userPets = await getPets(
        {
          params: { ...params, limit: 1000, owner: account },
          offset,
          order
        },
        chainId
      )

      return userPets
    }
    return { data: [], length: 0 }
  }
)

const petViewerSlice = createSlice({
  name: 'pets',
  initialState,
  reducers: {
    setShowPetViewer(state, action: { payload: boolean }) {
      state.showPetViewer = action.payload
    },
    setPetViewerTitle(state, action: { payload: string }) {
      state.petViewerTitle = action.payload
    },
    setShowPetDetailsModal(state, action: { payload: boolean }) {
      state.showPetDetailsModal = action.payload
    },
    setPetViewerModalPet(state, action: { payload: PetData }) {
      state.petViewerModalPet = action.payload
    },
    setPetViewerModalTitle(state, action: { payload: string }) {
      state.petViewerModalTitle = action.payload
    },
    setAllFlipped(state, action: { payload: boolean }) {
      state.allFlipped = action.payload
    },
    setAllAnimated(state, action: { payload: boolean }) {
      state.allAnimated = action.payload
    },
    setSellAmount(state, action: { payload: number }) {
      state.sellAmount = action.payload
    },
    setActiveIncubations(state, action: { payload: ActiveIncubation[] }) {
      state.activeIncubations = action.payload
    },
    removeActiveIncubation(state, action: { payload: number }) {
      const incubationId = action.payload
      const updatedIncubations = state.activeIncubations.filter(incubation => incubation.id !== incubationId)
      state.activeIncubations = updatedIncubations
    },
    setHatchedPet(state, action: { payload: PetData | null }) {
      state.hatchedPet = action.payload
    },
    setShowHatchedPetModal(state, action: { payload: boolean }) {
      state.showHatchedPetModal = action.payload
    },
    setSelectedPet(state, action: { payload: PetData }) {
      state.selectedPet = action.payload
    },
    setActiveViewerTab(state, action: { payload: ActiveViewerTab }) {
      state.activeViewerTab = action.payload
    },
    setPetFilter(state, action: { payload: { [key in FilterType]: Partial<BasicFilters> } }) {
      console.log(action.payload)
      const [filterType, filterValue] = Object.entries(action.payload)[0] as [FilterType, Partial<BasicFilters>]
      const key = Object.keys(filterValue)[0] as BasicFilterKeys
      const prevValue = state.petFilters[filterType][key]
      const newValue = action.payload[filterType][key]
      state.petFilters = {
        ...state.petFilters,
        [filterType]: {
          ...state.petFilters[filterType],
          [key]: isValueMap(prevValue) ? createUpdatedValueMap(prevValue, newValue as ValueMap) : newValue
        }
      }
    },
    setPetFilterDefaults(state) {
      state.petFilters = initialState.petFilters
    },
    setShowSellModal(state, action: { payload: boolean }) {
      state.showSellModal = action.payload
    },
    setShowSendModal(state, action: { payload: boolean }) {
      state.showSendModal = action.payload
    },
    setShowBuyModal(state, action: { payload: boolean }) {
      state.showBuyModal = action.payload
    },
    setShowAnimations(state, action: { payload: boolean }) {
      state.showAnimations = action.payload
    },
    removeUserPet(state, action: { payload: string | number | BigNumber }) {
      const petId = action.payload
      const updatedPets = state.userPets.filter(pet => pet.id !== petId)
      state.userPets = updatedPets
    },
    updateUserPet(state, action: { payload: PetData }) {
      const updatedPet = action.payload
      const newPets = state.userPets.concat([])
      const updatedIndex = newPets.findIndex(obj => obj.id === updatedPet.id)
      newPets[updatedIndex] = updatedPet
      state.userPets = newPets
    },
    updateCatalogPet(state, action: { payload: PetData }) {
      const updatedPet = action.payload
      const newPets = state.petCatalog.concat([])
      const updatedIndex = newPets.findIndex(obj => obj.id === updatedPet.id)
      newPets[updatedIndex] = updatedPet
      state.petCatalog = newPets
    },
    addCatalogPets(state, action: { payload: PetData[] }) {
      const newPets = state.petCatalog.concat(action.payload)
      state.petCatalog = newPets
    },
    addUserPet(state, action: { payload: PetData }) {
      const petId = action.payload.id
      const petIndex = state.userPets.findIndex(obj => obj.id === petId)

      if (petIndex === -1) {
        state.userPets.push(action.payload)
      }
    },
    setPetDefaults() {
      return initialState
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchPetCatalog.pending, state => {
        state.loading = true
      })
      .addCase(fetchPetCatalog.fulfilled, (state, action) => {
        const { data, length } = action.payload
        state.loading = false
        state.petCatalog = data
        state.totalPetCatalog = length
        if (data.length > 0) {
          state.selectedPet = data[0]
        }
      })
      .addCase(fetchPetCatalog.rejected, (state, action) => {
        state.loading = false
        errorHandler(action.error.message)
      })

      .addCase(fetchUserPets.pending, state => {
        state.userPetsLoading = true
      })
      .addCase(fetchUserPets.fulfilled, (state, action) => {
        const { data, length } = action.payload
        state.userPetsLoading = false
        state.userPets = data
        state.totalUserPets = length
      })
      .addCase(fetchUserPets.rejected, (state, action) => {
        state.userPetsLoading = false
        errorHandler(action.error.message)
      })
  }
})

export const {
  setShowPetViewer,
  setPetViewerTitle,
  setShowPetDetailsModal,
  setPetViewerModalPet,
  setPetViewerModalTitle,
  setAllFlipped,
  setAllAnimated,
  setSellAmount,
  setActiveIncubations,
  removeActiveIncubation,
  setHatchedPet,
  setShowHatchedPetModal,
  setSelectedPet,
  setActiveViewerTab,
  setPetFilter,
  setPetFilterDefaults,
  setShowSellModal,
  setShowSendModal,
  setShowBuyModal,
  setShowAnimations,
  removeUserPet,
  updateUserPet,
  updateCatalogPet,
  addCatalogPets,
  addUserPet,
  setPetDefaults
} = petViewerSlice.actions
export default petViewerSlice.reducer
