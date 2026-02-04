import { createSlice } from "@reduxjs/toolkit";

// Load user from localStorage (admin/worker) or visitor
const storedUser = JSON.parse(localStorage.getItem("user"));
const visitorToken = localStorage.getItem("visitorToken");
const visitorData = JSON.parse(localStorage.getItem("visitorData"));

const initialState = {
  user:
    storedUser ||
    (visitorToken && visitorData ? { ...visitorData, role: "visitor" } : null),
  token: visitorToken || null,
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
    setVisitor: (state, action) => {
      // payload = { user: {...}, token }
      const { user, token } = action.payload;
      state.user = { ...user, role: "visitor" };
      state.token = token;
      localStorage.setItem("visitorToken", token);
      localStorage.setItem("visitorData", JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("visitorToken");
      localStorage.removeItem("visitorData");
    },
  },
});

export const { setUser, setVisitor, logout } = authSlice.actions;
export default authSlice.reducer;
