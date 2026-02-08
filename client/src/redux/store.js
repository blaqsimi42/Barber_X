import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";

import { apiSlice } from "./api/apiSlice";
import { appointmentsApiSlice } from "./api/appointmentsApiSlice";

import authReducer from "./features/auth/authSlice";
import cutsReducer from "./features/cuts/cutsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    cuts: cutsReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [appointmentsApiSlice.reducerPath]: appointmentsApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    })
      .concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== "production",
});



setupListeners(store.dispatch);

export default store;
