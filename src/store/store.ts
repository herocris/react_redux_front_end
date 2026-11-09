import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { isSessionBoundary, sessionMiddleware } from './sessionMiddleware'
import { authSlice } from '../modules/auth/slices/authSlice'
import { graphSlice } from '../modules/graph/slices/graphSlice'
import { mapSlice } from '../modules/map/slices/mapSlice'
import { analysisFiltersSlice } from '../modules/analysisFilters/slices/analysisFiltersSlice'

const appReducer = combineReducers({
    auth: authSlice.reducer,
    graph:graphSlice.reducer,
    map:mapSlice.reducer,
    analysisFilters: analysisFiltersSlice.reducer,
})

export const rootReducer: typeof appReducer = (state, action) => {
  if (isSessionBoundary(action)) {
    // Reset legacy remote domains and applied filters at every session boundary.
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
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
