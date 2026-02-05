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
      // Support payload shapes: { user, token } or { name, token }
      const payload = action.payload || {};
      const userFromPayload =
        payload.user ||
        (payload.name ? { name: payload.name, fullName: payload.name } : null);
      const token = payload.token || null;

      state.user = userFromPayload
        ? { ...userFromPayload, role: "visitor" }
        : null;
      state.token = token;

      if (token) localStorage.setItem("visitorToken", token);
      if (userFromPayload) {
        localStorage.setItem("visitorData", JSON.stringify(userFromPayload));
        // keep legacy key used across the app
        localStorage.setItem(
          "visitorName",
          userFromPayload.name || userFromPayload.fullName || "",
        );
      }
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
