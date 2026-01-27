// src/pages/Appointments.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import * as htmlToImage from "html-to-image";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetAllAppointmentsQuery,
  useGetAppointmentsByNameQuery,
  useBookAppointmentMutation,
  useCancelAppointmentMutation,
  useUpdateAppointmentStatusMutation,
} from "../redux/api/appointmentsApiSlice";
import { useGetMyCutsQuery } from "../redux/api/cutsApiSlice";
import { useNavigate } from "react-router-dom";
import {
  Loader,
  Loader2,
  CalendarDays,
  Trash2,
  Check,
  XCircle,
} from "lucide-react";
import { setVisitor } from "../redux/features/auth/authSlice";

// ---------------- Appointment Card ----------------
const AppointmentCard = ({ app, role, onCancel, onComplete }) => {
  return (
    <div className="p-5 bg-white rounded-lg shadow border border-indigo-100 hover:shadow-lg transition">
      <div className="flex justify-between items-start">
        <h4 className="text-lg font-semibold text-indigo-600">{app.cutName}</h4>
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            app.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : app.status === "completed"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {app.status === "completed"
            ? `Completed by ${app.workerName || "Unknown"}`
            : app.status}
        </span>
      </div>

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
          {role === "visitor" && (
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
};

// ---------------- Appointment Group ----------------
const AppointmentGroup = ({
  title,
  appointments,
  role,
  onCancel,
  onComplete,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="space-y-4">
      <h3
        className="text-xl font-bold text-indigo-600 cursor-pointer select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        {title} ({appointments.length}) {collapsed ? "(show)" : "(hide)"}
      </h3>
      {!collapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((app) => (
            <AppointmentCard
              key={app._id}
              app={app}
              role={role}
              onCancel={onCancel}
              onComplete={onComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------- Booking Form ----------------
const BookingForm = ({
  cuts,
  formData,
  handleChange,
  handleBook,
  isBooking,
}) => {
  return (
    <form
      onSubmit={handleBook}
      className="bg-white p-6 rounded-lg shadow border border-indigo-100 space-y-4 max-w-md"
    >
      <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
        <CalendarDays size={18} className="text-indigo-600" /> Book New
        Appointment
      </h3>

      <div>
        <label className="text-sm text-gray-600 font-semibold mb-1 block">
          Choose a Cut
        </label>
        {cuts?.data?.length ? (
          <select
            name="cutId"
            value={formData.cutId}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2"
          >
            <option value="">Select Cut</option>
            {cuts.data.map((cut) => (
              <option key={cut._id} value={cut._id}>
                {cut.name} — ₦{cut.price}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-gray-500">No cuts available</p>
        )}
      </div>

      <input
        type="date"
        name="appointmentDate"
        value={formData.appointmentDate}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      <input
        type="time"
        name="appointmentTime"
        value={formData.appointmentTime}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      <button
        type="submit"
        disabled={isBooking}
        className="w-full bg-indigo-600 text-white py-2 rounded flex justify-center gap-2"
      >
        {isBooking ? (
          <Loader2 className="animate-spin w-4 h-4" />
        ) : (
          "Book Appointment"
        )}
      </button>
    </form>
  );
};

// ---------------- Main Appointments Page ----------------
const Appointments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || "visitor";
  const fullName = user?.name || user?.fullName || "";

  const [formData, setFormData] = useState({
    cutId: "",
    appointmentDate: "",
    appointmentTime: "",
  });
  const [showTicket, setShowTicket] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const ticketRef = useRef(null);
  const [cancelModal, setCancelModal] = useState({
    open: false,
    targetId: null,
    cutName: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Visitor auto-login
  useEffect(() => {
    if (!user && role === "visitor") {
      const token = localStorage.getItem("visitorToken");
      const name = localStorage.getItem("visitorName");
      if (token && name) {
        dispatch(setVisitor({ name, token }));
      }
    }
  }, [user, dispatch, role]);

  const { data: cuts, isLoading: isCutsLoading } = useGetMyCutsQuery();
  const { data: allAppointments, isLoading: loadingAll } =
    useGetAllAppointmentsQuery(undefined, { skip: role === "visitor" });
  const visitorName =
    role === "visitor" ? localStorage.getItem("visitorName") || fullName : "";
  const { data: myAppointments, isLoading: loadingMine } =
    useGetAppointmentsByNameQuery(visitorName, { skip: role !== "visitor" });

  const [bookAppointment, { isLoading: isBooking }] =
    useBookAppointmentMutation();
  const [cancelAppointment] = useCancelAppointmentMutation();
  const [updateStatus] = useUpdateAppointmentStatusMutation();

  const handleBook = async (e) => {
    e.preventDefault();
    const { cutId, appointmentDate, appointmentTime } = formData;
    if (!fullName || !cutId || !appointmentDate || !appointmentTime) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      const response = await bookAppointment({
        fullName,
        cutId,
        appointmentDate,
        appointmentTime,
      }).unwrap();
      if (response.tempToken) {
        localStorage.setItem("visitorToken", response.tempToken);
        localStorage.setItem("visitorName", fullName);
        dispatch(setVisitor({ name: fullName, token: response.tempToken }));
      }
      setFormData({ cutId: "", appointmentDate: "", appointmentTime: "" });
      setTicketData(response.appointment);
      setShowTicket(true);
      toast.success("Appointment booked successfully!");
      setTimeout(() => {
        setShowTicket(false);
        navigate("/appointments");
      }, 3000);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to book appointment");
    }
  };

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

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(ticketRef.current);
      const link = document.createElement("a");
      link.download = "appointment-ticket.png";
      link.href = dataUrl;
      link.click();
    } catch {
      toast.error("Failed to download ticket");
    }
  };

  const appointments =
    role === "admin" || role === "worker"
      ? allAppointments || []
      : myAppointments || [];

  // ---------------- Grouping Appointments ----------------
  const groupedAppointments = useMemo(() => {
    const today = [];
    const month = [];
    const year = [];
    const now = new Date();
    appointments.forEach((app) => {
      const date = new Date(app.appointmentDate);
      if (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
      ) {
        today.push(app);
      } else if (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      ) {
        month.push(app);
      } else if (date.getFullYear() === now.getFullYear()) {
        year.push(app);
      }
    });
    // Sort each group descending by date
    const sortDesc = (a, b) =>
      new Date(b.appointmentDate) - new Date(a.appointmentDate);
    return {
      Today: today.sort(sortDesc),
      "This Month": month.sort(sortDesc),
      "This Year": year.sort(sortDesc),
    };
  }, [appointments]);

  const isLoadingPage = isCutsLoading || loadingAll || loadingMine || isBooking;

  if (isLoadingPage)
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

  return (
    <Layout>
      <div className="space-y-10 md:mt-2 mt-10">
        <h2 className="text-2xl font-bold text-indigo-600">
          {role === "admin" || role === "worker"
            ? "All Appointments"
            : "My Appointments"}
        </h2>

        {/* Booking Form */}
        {role === "visitor" && (
          <BookingForm
            cuts={cuts}
            formData={formData}
            handleChange={handleChange}
            handleBook={handleBook}
            isBooking={isBooking}
          />
        )}

        {/* Grouped Appointments */}
        {Object.entries(groupedAppointments).map(([groupTitle, apps]) =>
          apps.length > 0 ? (
            <AppointmentGroup
              key={groupTitle}
              title={groupTitle}
              appointments={apps}
              role={role}
              onCancel={handleCancel}
              onComplete={handleComplete}
            />
          ) : null,
        )}
      </div>

      {/* Ticket Modal */}
      <AnimatePresence>
        {showTicket && ticketData && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={ticketRef}
              className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h3 className="text-xl font-bold text-indigo-600 mb-2">
                Your Ticket
              </h3>
              <p className="text-gray-700 mb-1">Cut: {ticketData.cutName}</p>
              <p className="text-gray-700 mb-1">
                Date:{" "}
                {new Date(ticketData.appointmentDate).toLocaleDateString()}
              </p>
              <p className="text-gray-700 mb-1">
                Time: {ticketData.appointmentTime}
              </p>
              <p className="text-gray-700 mb-3">
                Bench: {ticketData.benchNumber}
              </p>
              {ticketData.status === "completed" && ticketData.completedAt && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Completed by:</span>{" "}
                  {ticketData.workerName || "Unknown"} on{" "}
                  {new Date(ticketData.completedAt).toLocaleDateString()}
                </p>
              )}
              <button
                onClick={handleDownload}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Download Ticket
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {cancelModal.open && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <XCircle className="text-red-500 mx-auto mb-3" size={48} />
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Cancel Appointment?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Are you sure you want to cancel{" "}
                <span className="font-semibold">{cancelModal.cutName}</span>?
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() =>
                    setCancelModal({ open: false, targetId: null, cutName: "" })
                  }
                  className="px-4 py-2 rounded bg-gray-100"
                >
                  No, Go Back
                </button>
                <button
                  onClick={handleCancelConfirmed}
                  className="px-4 py-2 rounded bg-red-600 text-white flex items-center gap-2"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Appointments;
