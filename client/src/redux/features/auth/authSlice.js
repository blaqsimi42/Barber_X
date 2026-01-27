import { createSlice } from "@reduxjs/toolkit";

// Load user from localStorage (admin/worker) or visitor
const storedUser = JSON.parse(localStorage.getItem("user"));
const visitorToken = localStorage.getItem("visitorToken");
const visitorName = localStorage.getItem("visitorName");

const initialState = {
  user:
    storedUser ||
    (visitorToken && visitorName
      ? { role: "visitor", name: visitorName, token: visitorToken }
      : null),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    setVisitor: (state, action) => {
      // payload = { name, token }
      state.user = { role: "visitor", ...action.payload };
      localStorage.setItem("visitorToken", action.payload.token);
      localStorage.setItem("visitorName", action.payload.name);
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("user");
      localStorage.removeItem("visitorToken");
      localStorage.removeItem("visitorName");
    },
  },
});

export const { setUser, setVisitor, logout } = authSlice.actions;
export default authSlice.reducer;
