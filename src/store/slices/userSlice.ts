import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User, KycDetails } from '@/types'

interface UserState {
  profile: User | null
  kycDetails: KycDetails | null
  isUpdating: boolean
  error: string | null
}

const initialState: UserState = {
  profile: null,
  kycDetails: null,
  isUpdating: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<User>) => {
      state.profile = action.payload
    },
    setKycDetails: (state, action: PayloadAction<KycDetails>) => {
      state.kycDetails = action.payload
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload }
      }
    },
    setUpdating: (state, action: PayloadAction<boolean>) => {
      state.isUpdating = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearUser: (state) => {
      state.profile = null
      state.kycDetails = null
      state.error = null
    },
  },
})

export const { setProfile, setKycDetails, updateProfile, setUpdating, setError, clearUser } = userSlice.actions
export default userSlice.reducer
