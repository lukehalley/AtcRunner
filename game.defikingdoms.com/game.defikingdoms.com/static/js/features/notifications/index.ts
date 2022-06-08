import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const NOTIFICATION_STORAGE_KEY = 'defiKingdoms_NOTIFICATIONS'
export const PENDING_STORAGE_KEY = 'defiKingdoms_PENDING_NOTIFICATION'

export enum NotificationLevel {
  error = 'error',
  warning = 'warning',
  info = 'info',
  success = 'success'
}

export interface Notification {
  previousOwner: string;
  newOwner: string;
  message: string;
  level: NotificationLevel;
  read: boolean;
  addedTime?: number;
  blockNumber?: number;
  blockHash?: string;
  transactionIndex?: number;
  removed?: false;
  address?: string;
  data?: string;
  transactionHash?: string;
  logIndex?: number;
  event?: string;
  eventSignature?: string;
}

export interface PendingTransfer {
  address: string;
  contractAddress: string;
  tokenId: number;
  event: any;
}

interface NotificationState {
  notifications: Notification[];
  pendingTransfers: {
    [key: string]: PendingTransfer;
  };
}

const initialState: NotificationState = {
  notifications: [],
  pendingTransfers: {}
}

const store = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {}
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    initializeNotifications(state) {
      try {
        state.notifications = JSON.parse(localStorage.getItem(NOTIFICATION_STORAGE_KEY) || '[]')
        state.pendingTransfers = JSON.parse(localStorage.getItem(PENDING_STORAGE_KEY) || '{}')
      } catch (e) {
        console.error(e)
      }
    },
    addNotification(state, action: PayloadAction<Notification>) {
      if (state.notifications.find(n => (n as any).transactionHash === (action.payload as any).transactionHash)) {
        return
      }
      state.notifications = [...state.notifications, { ...action.payload, addedTime: new Date().getTime() }]
      store(NOTIFICATION_STORAGE_KEY, state.notifications)
    },
    removeNotification(state, action: PayloadAction<number>) {
      state.notifications = [...state.notifications.filter((n: Notification, i: number) => i !== action.payload)]
      store(NOTIFICATION_STORAGE_KEY, state.notifications)
    },
    markAllAsRead(state) {
      state.notifications = [...state.notifications.map((n: Notification) => ({ ...n, read: true }))]
      store(NOTIFICATION_STORAGE_KEY, state.notifications)
    },
    addPendingTransfer(state, action: PayloadAction<PendingTransfer>) {
      if (!state.pendingTransfers[`${action.payload.contractAddress}-${action.payload.tokenId}`]) {
        state.pendingTransfers[`${action.payload.contractAddress}-${action.payload.tokenId}`] = action.payload
        store(PENDING_STORAGE_KEY, state.pendingTransfers)
      }
    },
    removePendingTransfer(state, action: PayloadAction<string>) {
      if (state.pendingTransfers[action.payload]) {
        const pending = { ...state.pendingTransfers }
        delete pending[action.payload]
        state.pendingTransfers = pending
        store(PENDING_STORAGE_KEY, state.pendingTransfers)
      }
    }
  }
})

const { actions, reducer } = notificationsSlice
export const {
  initializeNotifications,
  addNotification,
  removeNotification,
  markAllAsRead,
  addPendingTransfer,
  removePendingTransfer
} = actions
export default reducer
