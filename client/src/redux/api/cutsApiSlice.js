import { apiSlice } from "./apiSlice";
import { BASE_URL } from "../constants";

export const cutsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get all cuts (public)
    getCuts: builder.query({
      query: () => `${BASE_URL}/api/cuts`,
      providesTags: ["Cuts"],
    }),

    // ✅ Get my cuts (admin or worker)
    getMyCuts: builder.query({
      query: () => `${BASE_URL}/api/cuts/mycuts`,
      providesTags: ["Cuts"],
    }),

    // ✅ Upload / Create new cut
    createCut: builder.mutation({
      query: (formData) => ({
        url: `${BASE_URL}/api/cuts/upload`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Cuts"],
    }),

    // ✅ Update existing cut
    updateCut: builder.mutation({
      query: ({ id, formData }) => ({
        url: `${BASE_URL}/api/cuts/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Cuts"],
    }),

    // ✅ Delete a cut
    deleteCut: builder.mutation({
      query: (id) => ({
        url: `${BASE_URL}/api/cuts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cuts"],
    }),
  }),
});

export const {
  useGetCutsQuery,
  useGetMyCutsQuery,
  useCreateCutMutation,
  useUpdateCutMutation,
  useDeleteCutMutation,
} = cutsApiSlice;
