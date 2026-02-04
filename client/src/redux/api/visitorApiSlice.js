import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiBase } from "../../utils/getApiBase";

export const visitorApiSlice = createApi({
  reducerPath: "visitorApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getApiBase()}/api/visitors`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Visitor", "Appointments"],
  endpoints: (builder) => ({
    // Register Visitor
    registerVisitor: builder.mutation({
      query: (data) => ({
        url: "/register",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Visitor"],
    }),

    // Login Visitor
    loginVisitor: builder.mutation({
      query: (data) => ({
        url: "/login",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Visitor"],
    }),

    // Get Visitor Profile
    getVisitorProfile: builder.query({
      query: () => "/profile",
      providesTags: ["Visitor"],
    }),

    // Update Visitor Profile
    updateVisitorProfile: builder.mutation({
      query: (data) => ({
        url: "/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Visitor"],
    }),

    // Get Visitor Appointments
    getVisitorAppointments: builder.query({
      query: () => "/appointments",
      providesTags: ["Appointments"],
    }),

    // Cancel Appointment
    cancelVisitorAppointment: builder.mutation({
      query: (appointmentId) => ({
        url: `/cancel-appointment/${appointmentId}`,
        method: "PUT",
      }),
      invalidatesTags: ["Appointments"],
    }),

    // Get Bench Info (position on bench)
    getVisitorBenchInfo: builder.query({
      query: (appointmentId) => `/bench-info/${appointmentId}`,
      providesTags: ["Appointments"],
    }),
  }),
});

export const {
  useRegisterVisitorMutation,
  useLoginVisitorMutation,
  useGetVisitorProfileQuery,
  useUpdateVisitorProfileMutation,
  useGetVisitorAppointmentsQuery,
  useCancelVisitorAppointmentMutation,
  useGetVisitorBenchInfoQuery,
} = visitorApiSlice;
