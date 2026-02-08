import { createSlice } from "@reduxjs/toolkit";

// Load user from localStorage (admin/worker)
const storedUser = JSON.parse(localStorage.getItem("user"));

const initialState = {
  user: storedUser || null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.token = action.payload?.token || null;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("user");
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
