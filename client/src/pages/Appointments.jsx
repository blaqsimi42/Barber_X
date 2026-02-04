import React, { useState, useMemo, useRef, useEffect } from "react";
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { setVisitor } from "../redux/features/auth/authSlice";

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

const BookingForm = ({
  cuts,
  formData,
  handleChange,
  handleBook,
  isBooking,
}) => (
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
  const [selectedTab, setSelectedTab] = useState("All");
  const [selectedPeriod, setSelectedPeriod] = useState("All Time");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const [showTicket, setShowTicket] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [cancelModal, setCancelModal] = useState({
    open: false,
    targetId: null,
    cutName: "",
  });
  const ticketRef = useRef(null);

  useEffect(() => {
    if (!user && role === "visitor") {
      const token = localStorage.getItem("visitorToken");
      const name = localStorage.getItem("visitorName");
      if (token && name) dispatch(setVisitor({ name, token }));
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

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
        navigate("/visitor-dashboard");
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

  const appointments =
    role === "admin" || role === "worker"
      ? allAppointments || []
      : myAppointments || [];

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

  const isMobile = window.innerWidth < 768;
  const visibleAppointments = showAll
    ? filteredAppointments
    : filteredAppointments.slice(0, isMobile ? 3 : 6);

  return (
    <Layout>
      <div className="space-y-8 md:mt-2 mt-12">
        <h2 className="text-3xl font-bold text-indigo-600">
          {role === "admin" || role === "worker"
            ? "All Appointments"
            : "My Appointments"}
        </h2>

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

        {role === "visitor" && (
          <BookingForm
            cuts={cuts}
            formData={formData}
            handleChange={handleChange}
            handleBook={handleBook}
            isBooking={isBooking}
          />
        )}

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
      </div>
    </Layout>
  );
};

export default Appointments;
