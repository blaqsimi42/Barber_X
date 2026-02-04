import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";

import { apiSlice } from "./api/apiSlice";
import { appointmentsApiSlice } from "./api/appointmentsApiSlice";
import { visitorApiSlice } from "./api/visitorApiSlice";

import authReducer, { setVisitor } from "./features/auth/authSlice";
import cutsReducer from "./features/cuts/cutsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    cuts: cutsReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [appointmentsApiSlice.reducerPath]: appointmentsApiSlice.reducer,
    [visitorApiSlice.reducerPath]: visitorApiSlice.reducer, // ✅ add visitor slice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    })
      .concat(apiSlice.middleware)
      .concat(visitorApiSlice.middleware), // ✅ concat visitor middleware
  devTools: process.env.NODE_ENV !== "production",
});

// Hydrate Redux for visitor if token + name exist
const visitorToken = localStorage.getItem("visitorToken");
const visitorName = localStorage.getItem("visitorName");

if (visitorToken && visitorName) {
  store.dispatch(setVisitor({ name: visitorName, token: visitorToken }));
}

setupListeners(store.dispatch);

export default store;
