import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { isSessionBoundary, sessionMiddleware } from './sessionMiddleware'
import { authSlice, onSessionRefreshed } from '../modules/auth/slices/authSlice'
import { analysisFiltersSlice } from '../modules/analysisFilters/slices/analysisFiltersSlice'

const appReducer = combineReducers({
    auth: authSlice.reducer,
    analysisFilters: analysisFiltersSlice.reducer,
})

export const rootReducer: typeof appReducer = (state, action) => {
  const changedUser = onSessionRefreshed.match(action) && state?.auth?.status === 'authenticated' &&
    state.auth.user.correo !== action.payload.correo;
  if (isSessionBoundary(action) || changedUser) {
    // Reset applied filters at every session boundary.
    // Preserve auth until its own reducer applies the requested transition.
    const initial = appReducer(undefined, { type: '@@session/reset' })
    return appReducer({ ...initial, auth: state?.auth ?? initial.auth }, action)
  }
  return appReducer(state, action)
}

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(sessionMiddleware),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
