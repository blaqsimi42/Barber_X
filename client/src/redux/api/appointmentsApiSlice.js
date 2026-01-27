// src/redux/api/appointmentsApiSlice.js
import { apiSlice } from "./apiSlice.js"; // your base apiSlice
import { BASE_URL } from "../constants.js";

export const appointmentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ----------------------------
    // Book an appointment (visitor)
    bookAppointment: builder.mutation({
      query: (appointmentData) => ({
        url: `${BASE_URL}/api/appointments`,
        method: "POST",
        body: appointmentData,
      }),
      // ✅ After booking, invalidate visitor's appointments cache
      invalidatesTags: (result, error, arg) =>
        result?.appointment?.fullName
          ? [{ type: "Appointments", id: result.appointment.fullName }]
          : ["Appointments"],
    }),

    // ----------------------------
    // Get all appointments (admin)
    getAllAppointments: builder.query({
      query: () => `${BASE_URL}/api/appointments`,
      providesTags: ["Appointments"],
    }),

    // ----------------------------
    // Get appointments by customer name (visitor, admin, worker)
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
    // Cancel appointment (visitor/customer)
    cancelAppointment: builder.mutation({
      query: ({ id, fullName }) => ({
        url: `${BASE_URL}/api/appointments/${id}/cancel`,
        method: "PUT",
      }),
      // ✅ Invalidate only visitor's appointments cache
      invalidatesTags: (result, error, arg) =>
        arg?.fullName
          ? [{ type: "Appointments", id: arg.fullName }]
          : ["Appointments"],
    }),
  }),
});

export const {
  useBookAppointmentMutation,
  useGetAllAppointmentsQuery,
  useGetAppointmentsByNameQuery,
  useUpdateAppointmentStatusMutation,
  useCancelAppointmentMutation,
} = appointmentsApiSlice;
