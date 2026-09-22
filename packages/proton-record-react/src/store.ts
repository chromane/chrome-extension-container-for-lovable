import { configureStore } from '@reduxjs/toolkit'
import recorderReducer from './features/recorder/recorderSlice'

export const store = configureStore({
  reducer: {
    recorder: recorderReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
