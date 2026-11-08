import { configureStore } from '@reduxjs/toolkit'
import { userSlice } from '../modules/user/slices/userSlice'
import { drugPresentationSlice } from '../modules/drugPresentation/slices/drugPresentationSlice'
import { confiscationSlice } from '../modules/confiscation/slices/confiscationSlice'
import { drugConfiscationSlice } from '../modules/drugConfiscation/slices/drugConfiscationSlice'
import { weaponConfiscationSlice } from '../modules/weaponConfiscation/slices/weaponConfiscationSlice'
import { ammunitionConfiscationSlice } from '../modules/ammunitionConfiscation/slices/ammunitionConfiscationSlice'
import { activitySlice } from '../modules/activity/slices/activitySlice'
import { ammunitionSlice } from '../modules/ammunition/slices/ammunitionSlice'
import { authSlice } from '../modules/auth/slices/authSlice'
import { drugSlice } from '../modules/drug/slices/drugSlice'
import { resourceSlice } from '../modules/resouce/slices/resourceSlice'
import { graphSlice } from '../modules/graph/slices/graphSlice'
import { mapSlice } from '../modules/map/slices/mapSlice'
import { roleSlice } from '../modules/rol/slices/rolSlice'
import { permissionSlice } from '../modules/permission/slices/permissionSlice'
import { weaponSlice } from '../modules/weapon/slices/weaponSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    user: userSlice.reducer,
    resource:resourceSlice.reducer,
    role:roleSlice.reducer,
    permission:permissionSlice.reducer,
    activity:activitySlice.reducer,
    ammunition:ammunitionSlice.reducer,
    drug:drugSlice.reducer,
    weapon:weaponSlice.reducer,
    drugPresentation:drugPresentationSlice.reducer,
    confiscation:confiscationSlice.reducer,
    drugConfiscation:drugConfiscationSlice.reducer,
    weaponConfiscation:weaponConfiscationSlice.reducer,
    ammunitionConfiscation:ammunitionConfiscationSlice.reducer,
    graph:graphSlice.reducer,
    map:mapSlice.reducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch