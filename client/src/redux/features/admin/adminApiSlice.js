import { apiSlice } from "../../api/apiSlice";
import { ADMIN_URL } from "../../constants";

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create Admin
    registerAdmin: builder.mutation({
      query: (data) => ({
        url: `${ADMIN_URL}/create`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Admin"],
    }),

    // Login Admin
    loginAdmin: builder.mutation({
      query: (data) => ({
        url: `${ADMIN_URL}/login`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Admin"],
    }),

    // Fetch Workers for logged-in Admin
    getWorkers: builder.query({
      query: () => `${ADMIN_URL}/workers`,
      providesTags: ["Worker"],
    }),

    // ✅ NEW: Update Admin Profile
    updateAdminProfile: builder.mutation({
      query: (data) => ({
        url: `${ADMIN_URL}/profile`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Admin", "Appointments"],
    }),
  }),
});

export const {
  useRegisterAdminMutation,
  useLoginAdminMutation,
  useGetWorkersQuery,
  useUpdateAdminProfileMutation, // 👈 ADDITION
} = adminApiSlice;
