import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiBase } from "../../utils/getApiBase";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBase(), // dynamically fetched base URL
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.user?.token || null;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Admin", "Worker"],
  endpoints: () => ({}),
});
