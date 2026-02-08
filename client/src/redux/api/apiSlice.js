import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiBase } from "../../utils/getApiBase";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBase(), // dynamically fetched base URL
    prepareHeaders: (headers, { getState }) => {
      const state = getState();
      // Use token from auth state (admin/worker flows)
      const token = state?.auth?.token || state?.auth?.user?.token || null;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Admin", "Worker"],
  endpoints: () => ({}),
});
