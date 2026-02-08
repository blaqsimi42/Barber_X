// src/redux/api/appointmentsApiSlice.js
import { apiSlice } from "./apiSlice.js"; // your base apiSlice
import { BASE_URL } from "../constants.js";

export const appointmentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ----------------------------
    // Get all appointments (admin)
    getAllAppointments: builder.query({
      query: () => `${BASE_URL}/api/appointments`,
      providesTags: ["Appointments"],
    }),

    // ----------------------------
    // Get appointments by customer name (admin/worker)
    getAppointmentsByName: builder.query({
      query: (name) => `${BASE_URL}/api/appointments/my/${name}`,
      // ✅ Provide tag per customer name for targeted invalidation
      providesTags: (result, error, name) => [
        { type: "Appointments", id: name },
      ],
    }),

    // ----------------------------
    // Update appointment status (admin/worker)
    updateAppointmentStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `${BASE_URL}/api/appointments/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Appointments"],
    }),

    // ----------------------------
    // Cancel appointment (admin/worker)
    cancelAppointment: builder.mutation({
      query: ({ id }) => ({
        url: `${BASE_URL}/api/appointments/${id}/cancel`,
        method: "PUT",
      }),
      invalidatesTags: ["Appointments"],
    }),
  }),
});

export const {
  useGetAllAppointmentsQuery,
  useGetAppointmentsByNameQuery,
  useUpdateAppointmentStatusMutation,
  useCancelAppointmentMutation,
} = appointmentsApiSlice;
