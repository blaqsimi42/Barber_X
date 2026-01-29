import { apiSlice } from "../../api/apiSlice";
import { WORKER_URL } from "../../constants";

export const workerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * 🧍 Register Worker (with Admin Code)
     * POST /api/workers/register
     */
    registerWorker: builder.mutation({
      query: (data) => ({
        url: `${WORKER_URL}/register`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Worker"],
    }),

    /**
     * 🔑 Login Worker
     * POST /api/workers/login
     */
    loginWorker: builder.mutation({
      query: (data) => ({
        url: `${WORKER_URL}/login`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Worker"],
    }),

    /**
     * 📅 Get Worker Appointments (optional future use)
     */
    getWorkerAppointments: builder.query({
      query: () => `${WORKER_URL}/appointments`,
      providesTags: ["Appointments"],
    }),

    /**
     * 👥 Get All Colleagues
     * GET /api/workers/colleagues
     * (Requires Worker Auth)
     */
    getColleagues: builder.query({
      query: () => ({
        url: `${WORKER_URL}/colleagues`,
        method: "GET",
      }),
      providesTags: ["Colleagues"],
    }),

    // ✅ NEW: Update Worker Profile
    updateWorkerProfile: builder.mutation({
      query: (data) => ({
        url: `${WORKER_URL}/profile`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Worker"],
    }),
  }),
});

export const {
  useRegisterWorkerMutation,
  useLoginWorkerMutation,
  useGetWorkerAppointmentsQuery,
  useGetColleaguesQuery,
  useUpdateWorkerProfileMutation, // 👈 ADDITION
} = workerApiSlice;
