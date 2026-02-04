import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import {
  useGetVisitorProfileQuery,
  useGetVisitorAppointmentsQuery,
  useCancelVisitorAppointmentMutation,
  useGetVisitorBenchInfoQuery,
} from "../redux/api/visitorApiSlice";
import {
  Loader,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

const VisitorDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  // Redirect if not logged in as visitor
  useEffect(() => {
    if (!user || user.role !== "visitor") {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch visitor data
  const { data: profileData, isLoading: profileLoading } =
    useGetVisitorProfileQuery(undefined, {
      skip: !token || user?.role !== "visitor",
    });

  const { data: appointmentsData, isLoading: appointmentsLoading } =
    useGetVisitorAppointmentsQuery(undefined, {
      skip: !token || user?.role !== "visitor",
    });

  const { data: benchData } = useGetVisitorBenchInfoQuery(
    selectedAppointmentId,
    {
      skip: !selectedAppointmentId || !token,
    },
  );

  const [cancelAppointment] = useCancelVisitorAppointmentMutation();

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await cancelAppointment(appointmentId).unwrap();
        alert("Appointment cancelled successfully");
      } catch (error) {
        alert("Error cancelling appointment: " + error.data?.message);
      }
    }
  };

  const handleRebook = (appointment) => {
    // Navigate to booking page with appointment details
    navigate("/cuts", { state: { rebook: appointment } });
  };

  if (profileLoading || appointmentsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center text-indigo-600 space-y-3">
            <Loader className="animate-spin w-10 h-10" />
            <p className="text-lg font-medium">Loading Dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const visitor = profileData?.visitor;
  const appointments = appointmentsData?.appointments || [];
  const upcomingAppointments = appointments.filter((a) =>
    ["pending", "completed"].includes(a.status),
  );
  const cancelledAppointments = appointments.filter(
    (a) => a.status === "cancelled",
  );

  return (
    <Layout>
      <div className="p-4 sm:p-6 space-y-8 mt-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {visitor?.fullName}!
          </h1>
          <p className="text-indigo-100">
            Manage your appointments and track your queue position
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600">
            <p className="text-gray-600 text-sm">Total Appointments</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {appointments.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
            <p className="text-gray-600 text-sm">Completed</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {appointments.filter((a) => a.status === "completed").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-600">
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {appointments.filter((a) => a.status === "pending").length}
            </p>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div>
          <h2 className="text-2xl font-bold text-indigo-600 mb-4">
            Your Appointments
          </h2>

          {upcomingAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No upcoming appointments</p>
              <button
                onClick={() => navigate("/cuts")}
                className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Book Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        {appointment.cutName}
                      </h3>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(
                            appointment.appointmentDate,
                          ).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {appointment.appointmentTime}
                        </div>
                        <div className="text-gray-700 font-medium">
                          Price: ${appointment.price}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="mt-3">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            appointment.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {appointment.status === "pending" ? (
                            <AlertCircle className="w-3 h-3" />
                          ) : (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Bench Position */}
                    {appointment.status === "pending" && (
                      <div className="bg-indigo-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600 mb-2">
                          Queue Position
                        </p>
                        <div
                          onMouseEnter={() =>
                            setSelectedAppointmentId(appointment._id)
                          }
                          className="text-3xl font-bold text-indigo-600"
                        >
                          {benchData?.benchPosition || "—"}
                        </div>
                        {benchData && (
                          <p className="text-xs text-gray-500 mt-2">
                            of {benchData.totalOnBench} in queue
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {appointment.status === "pending" && (
                        <button
                          onClick={() =>
                            handleCancelAppointment(appointment._id)
                          }
                          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => handleRebook(appointment)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm"
                      >
                        Book Again
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cancelled Appointments */}
        {cancelledAppointments.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-600 mb-4">
              Cancelled Appointments
            </h2>
            <div className="space-y-4">
              {cancelledAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="bg-gray-50 rounded-lg shadow p-6 opacity-75"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-600">
                        {appointment.cutName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(
                          appointment.appointmentDate,
                        ).toLocaleDateString()}{" "}
                        at {appointment.appointmentTime}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                      <XCircle className="w-3 h-3" />
                      Cancelled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-indigo-600 mb-4">
            Profile Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <p className="mt-1 text-lg text-gray-900">{visitor?.fullName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="mt-1 text-lg text-gray-900">{visitor?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <p className="mt-1 text-lg text-gray-900">{visitor?.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Member Since
              </label>
              <p className="mt-1 text-lg text-gray-900">
                {new Date(visitor?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VisitorDashboard;
