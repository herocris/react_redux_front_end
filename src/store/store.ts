import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { isSessionBoundary, sessionMiddleware } from './sessionMiddleware'
import { confiscationSlice } from '../modules/confiscation/slices/confiscationSlice'
import { drugConfiscationSlice } from '../modules/drugConfiscation/slices/drugConfiscationSlice'
import { weaponConfiscationSlice } from '../modules/weaponConfiscation/slices/weaponConfiscationSlice'
import { ammunitionConfiscationSlice } from '../modules/ammunitionConfiscation/slices/ammunitionConfiscationSlice'
import { authSlice } from '../modules/auth/slices/authSlice'
import { graphSlice } from '../modules/graph/slices/graphSlice'
import { mapSlice } from '../modules/map/slices/mapSlice'

const appReducer = combineReducers({
    auth: authSlice.reducer,
    confiscation:confiscationSlice.reducer,
    drugConfiscation:drugConfiscationSlice.reducer,
    weaponConfiscation:weaponConfiscationSlice.reducer,
    ammunitionConfiscation:ammunitionConfiscationSlice.reducer,
    graph:graphSlice.reducer,
    map:mapSlice.reducer,
})

export const rootReducer: typeof appReducer = (state, action) => {
  if (isSessionBoundary(action)) {
    // Reset every legacy remote domain, including options, maps and graphs.
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
