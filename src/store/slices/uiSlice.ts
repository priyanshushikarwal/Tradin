import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  isSidebarOpen: boolean
  isMobileMenuOpen: boolean
  isOrderPanelOpen: boolean
  activeModal: string | null
  theme: 'dark' | 'light'
  notifications: Notification[]
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  isRead: boolean
}

const initialState: UIState = {
  isSidebarOpen: true,
  isMobileMenuOpen: false,
  isOrderPanelOpen: false,
  activeModal: null,
  theme: 'dark',
  notifications: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload
    },
    toggleOrderPanel: (state) => {
      state.isOrderPanelOpen = !state.isOrderPanelOpen
    },
    setOrderPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.isOrderPanelOpen = action.payload
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload
    },
    closeModal: (state) => {
      state.activeModal = null
    },
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'isRead'>>) => {
      state.notifications.unshift({
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        isRead: false,
      })
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        notification.isRead = true
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(n => {
        n.isRead = true
      })
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  toggleOrderPanel,
  setOrderPanelOpen,
  openModal,
  closeModal,
  setTheme,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
} = uiSlice.actions

export default uiSlice.reducer
