import React, { useState, useMemo } from "react";
import Layout from "../components/Layout";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetAllAppointmentsQuery,
  useCancelAppointmentMutation,
  useUpdateAppointmentStatusMutation,
} from "../redux/api/appointmentsApiSlice";
import {
  Loader,
  CalendarDays,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const AppointmentCard = ({ app, role, onCancel, onComplete }) => (
  <div className="p-5 bg-white rounded-lg shadow border border-indigo-100 hover:shadow-lg transition">
    <div className="flex justify-between items-start">
      <h4 className="text-lg font-semibold text-indigo-600">{app.cutName}</h4>
      <span
        className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
          app.status === "pending"
            ? "bg-yellow-100 text-yellow-800"
            : app.status === "completed"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
        }`}
      >
        {app.status}
      </span>
    </div>

    {app.categories && app.categories.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-2">
        {app.categories.map((cat, i) => (
          <span
            key={i}
            className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full border border-indigo-100 font-medium"
          >
            {cat}
          </span>
        ))}
      </div>
    )}

    <p className="text-gray-700 mt-2">
      <span className="font-semibold">Customer:</span> {app.fullName}
    </p>
    <p className="text-gray-700">
      <span className="font-semibold">Price:</span> ₦{app.price}
    </p>
    <p className="text-gray-700">
      <span className="font-semibold">Date:</span>{" "}
      {new Date(app.appointmentDate).toLocaleDateString()}
    </p>
    <p className="text-gray-700">
      <span className="font-semibold">Time:</span> {app.appointmentTime}
    </p>
    <p className="text-gray-700">
      <span className="font-semibold">Bench:</span> {app.benchNumber}
    </p>

    {app.status === "completed" && app.completedAt && (
      <p className="text-gray-700">
        <span className="font-semibold">Completed on:</span>{" "}
        {new Date(app.completedAt).toLocaleDateString()}
      </p>
    )}

    {app.status === "pending" && (
      <div className="flex items-center gap-2 mt-4">
        {role === "worker" && (
          <button
            onClick={() => onCancel(app)}
            className="flex items-center gap-1 text-red-600 hover:text-red-700 border border-red-200 px-3 py-1 rounded transition"
          >
            <Trash2 size={16} /> Cancel
          </button>
        )}
        {(role === "admin" || role === "worker") && (
          <button
            onClick={() => onComplete(app._id)}
            className="flex items-center gap-1 text-green-600 hover:text-green-700 border border-green-200 px-3 py-1 rounded transition"
          >
            <Check size={16} /> Complete
          </button>
        )}
      </div>
    )}
  </div>
);

const Appointments = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || "admin";

  const [selectedTab, setSelectedTab] = useState("All");
  const [selectedPeriod, setSelectedPeriod] = useState("All Time");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [cancelModal, setCancelModal] = useState({
    open: false,
    targetId: null,
    cutName: "",
  });

  const { data: allAppointments, isLoading: loadingAll } =
    useGetAllAppointmentsQuery(undefined);

  const [cancelAppointment] = useCancelAppointmentMutation();
  const [updateStatus] = useUpdateAppointmentStatusMutation();

  const handleCancel = (app) =>
    setCancelModal({ open: true, targetId: app._id, cutName: app.cutName });

  const handleCancelConfirmed = async () => {
    try {
      await cancelAppointment(cancelModal.targetId).unwrap();
      toast.success("Appointment cancelled successfully!");
    } catch {
      toast.error("Failed to cancel");
    } finally {
      setCancelModal({ open: false, targetId: null, cutName: "" });
    }
  };

  const handleComplete = async (id) => {
    try {
      await updateStatus({ id, status: "completed" }).unwrap();
      toast.success("Appointment marked as completed");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const appointments = allAppointments || [];

  const today = new Date();
  const filteredAppointments = useMemo(() => {
    let result = [...appointments];
    if (selectedTab !== "All") {
      result = result.filter((a) => a.status === selectedTab.toLowerCase());
    }

    return result.filter((a) => {
      const date = new Date(a.appointmentDate);
      if (selectedPeriod === "All Time") return true;
      if (
        selectedPeriod === "Today" &&
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      )
        return true;
      if (
        selectedPeriod === "This Month" &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      )
        return true;
      if (
        selectedPeriod === "This Year" &&
        date.getFullYear() === today.getFullYear()
      )
        return true;
      return false;
    });
  }, [appointments, selectedTab, selectedPeriod, today]);

  const counts = useMemo(() => {
    const all = appointments.length;
    const pending = appointments.filter((a) => a.status === "pending").length;
    const completed = appointments.filter(
      (a) => a.status === "completed",
    ).length;
    const cancelled = appointments.filter(
      (a) => a.status === "cancelled",
    ).length;
    return { all, pending, completed, cancelled };
  }, [appointments]);

  if (loadingAll)
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center text-indigo-600 space-y-3">
            <Loader className="animate-spin w-10 h-10" />
            <p className="text-lg font-medium">Loading Appointments Data...</p>
          </div>
        </div>
      </Layout>
    );

  const isMobile = window.innerWidth < 768;
  const visibleAppointments = showAll
    ? filteredAppointments
    : filteredAppointments.slice(0, isMobile ? 3 : 6);

  return (
    <Layout>
      <div className="space-y-8 md:mt-2 mt-12">
        <h2 className="text-3xl font-bold text-indigo-600">All Appointments</h2>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-100 pb-3">
          <div className="flex flex-wrap gap-3">
            {[
              { name: "All", count: counts.all },
              { name: "Pending", count: counts.pending },
              { name: "Completed", count: counts.completed },
              { name: "Cancelled", count: counts.cancelled },
            ].map((tab) => (
              <button
                key={tab.name}
                onClick={() => setSelectedTab(tab.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
                  selectedTab === tab.name
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                }`}
              >
                {tab.name}
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    selectedTab === tab.name
                      ? "bg-white text-indigo-600"
                      : "bg-indigo-200 text-indigo-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 border border-indigo-200 px-3 py-2 rounded-md text-sm text-indigo-700 hover:bg-indigo-50 transition"
            >
              {selectedPeriod}
              {dropdownOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-indigo-100 rounded-lg shadow-lg z-10">
                {["All Time", "Today", "This Month", "This Year"].map((p) => (
                  <div
                    key={p}
                    onClick={() => {
                      setSelectedPeriod(p);
                      setDropdownOpen(false);
                    }}
                    className={`px-4 py-2 cursor-pointer text-sm hover:bg-indigo-50 ${
                      selectedPeriod === p
                        ? "text-indigo-700 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {p}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <p className="text-gray-500 mt-4 text-sm">
            No {selectedTab.toLowerCase()} appointments for this period.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {visibleAppointments.map((app) => (
                <AppointmentCard
                  key={app._id}
                  app={app}
                  role={role}
                  onCancel={handleCancel}
                  onComplete={handleComplete}
                />
              ))}
            </div>
            {filteredAppointments.length > (isMobile ? 3 : 6) && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-indigo-600 font-medium hover:text-indigo-800 transition"
                >
                  {showAll ? "View Less" : "View More"}
                </button>
              </div>
            )}
          </>
        )}

        {/* Cancel Modal */}
        {cancelModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <p className="mb-4 text-gray-700">
                Are you sure you want to cancel the appointment for{" "}
                <strong>{cancelModal.cutName}</strong>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelConfirmed}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Confirm Cancel
                </button>
                <button
                  onClick={() =>
                    setCancelModal({ open: false, targetId: null, cutName: "" })
                  }
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Appointments;
