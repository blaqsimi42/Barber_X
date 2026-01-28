// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useGetWorkersQuery } from "../redux/features/admin/adminApiSlice";
import { useGetColleaguesQuery } from "../redux/features/worker/workerApiSlice";
import {
  useGetAllAppointmentsQuery,
  useGetAppointmentsByNameQuery,
} from "../redux/api/appointmentsApiSlice";
import {
  CheckCircle,
  Clock,
  XCircle,
  Users,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Loader,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || "visitor";
  const isAdmin = role === "admin";
  const isWorker = role === "worker";
  const isVisitor = role === "visitor";

  const [activeTab, setActiveTab] = useState("pending");
  const [showTeam, setShowTeam] = useState(false);
  const [showAppointments, setShowAppointments] = useState(true);
  const [expandedAppointments, setExpandedAppointments] = useState(false);
  const [expandedTeam, setExpandedTeam] = useState(false);

  // ----------------------------
  // Queries
  // ----------------------------
  const {
    data: workersData,
    isLoading: workersLoading,
    isError: workersError,
  } = useGetWorkersQuery(undefined, { skip: !isAdmin });

  const {
    data: colleaguesData,
    isLoading: colleaguesLoading,
    isError: colleaguesError,
  } = useGetColleaguesQuery(undefined, { skip: isAdmin || isVisitor });

  const {
    data: allAppointments,
    isLoading: allAppointmentsLoading,
    isError: appointmentsError,
  } = useGetAllAppointmentsQuery(undefined, { skip: isVisitor });

  const visitorName = isVisitor
    ? localStorage.getItem("visitorName") || user?.name || ""
    : "";
  const {
    data: visitorAppointments,
    isLoading: visitorAppointmentsLoading,
    isError: visitorAppointmentsError,
  } = useGetAppointmentsByNameQuery(visitorName, {
    skip: !isVisitor || !visitorName,
  });

  // ----------------------------
  // Error Handling
  // ----------------------------
  useEffect(() => {
    if (workersError || colleaguesError)
      toast.error("Failed to load team data");
    if (appointmentsError || visitorAppointmentsError)
      toast.error("Failed to load appointments");
  }, [
    workersError,
    colleaguesError,
    appointmentsError,
    visitorAppointmentsError,
  ]);

  // ----------------------------
  // Loading State
  // ----------------------------
  const isLoading =
    workersLoading ||
    colleaguesLoading ||
    allAppointmentsLoading ||
    visitorAppointmentsLoading;

  if (isLoading)
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

  // ----------------------------
  // Data Handling
  // ----------------------------
  let appointments = isVisitor
    ? visitorAppointments || []
    : allAppointments || [];

  // Sort completed on top for admins/workers
  if (!isVisitor) {
    appointments = [
      ...appointments.filter((a) => a.status === "completed"),
      ...appointments.filter((a) => a.status === "pending"),
      ...appointments.filter((a) => a.status === "cancelled"),
    ];
  }

  const team = isAdmin
    ? workersData?.workers || []
    : isWorker
      ? colleaguesData?.colleagues || []
      : [];

  const pending = appointments.filter((a) => a.status === "pending");
  const completed = appointments.filter((a) => a.status === "completed");
  const cancelled = appointments.filter((a) => a.status === "cancelled");

  const totalTeam = team.length;
  const totalAppointments = appointments.length;

  // ----------------------------
  // Helpers
  // ----------------------------
  const statusBadge = (status) => {
    const base = "px-2 py-1 rounded text-xs font-medium";
    switch (status) {
      case "pending":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-800`}>
            Pending
          </span>
        );
      case "completed":
        return (
          <span className={`${base} bg-green-100 text-green-800`}>
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className={`${base} bg-red-100 text-red-800`}>Cancelled</span>
        );
      default:
        return (
          <span className={`${base} bg-gray-100 text-gray-800`}>{status}</span>
        );
    }
  };

  const tabs = [
    {
      key: "pending",
      label: "Pending",
      icon: <Clock size={16} />,
      count: pending.length,
      color: "text-yellow-600 border-yellow-300 hover:bg-yellow-50",
    },
    {
      key: "completed",
      label: "Completed",
      icon: <CheckCircle size={16} />,
      count: completed.length,
      color: "text-green-600 border-green-300 hover:bg-green-50",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      icon: <XCircle size={16} />,
      count: cancelled.length,
      color: "text-red-600 border-red-300 hover:bg-red-50",
    },
  ];

  const activeList =
    activeTab === "pending"
      ? pending
      : activeTab === "completed"
        ? completed
        : cancelled;

  // ----------------------------
  // Render Appointment Card (Completed with green badge)
  // ----------------------------
  const renderAppointmentCard = (appt) => (
    <motion.div
      key={appt._id}
      className="p-4 shadow-lg rounded-lg border border-indigo-100 hover:shadow-xl transition bg-white flex flex-col justify-between"
    >
      <div>
        <h3 className="font-bold text-indigo-600">{appt.fullName}</h3>
        <p className="text-gray-600">Service: {appt.cutName}</p>
        <p className="text-gray-600">
          Date: {new Date(appt.appointmentDate).toLocaleDateString()}{" "}
          {appt.appointmentTime}
        </p>
        {!isVisitor && appt.status === "completed" && appt.completedAt && (
          <p className="text-gray-700">
            Completed on: {new Date(appt.completedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Bottom Section */}
      <div className="mt-2 flex flex-col gap-1">
        {statusBadge(appt.status)}
        {!isVisitor && appt.status === "completed" && (
          <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
            Completed by: {appt.workerName || "-"}
          </span>
        )}
      </div>
    </motion.div>
  );

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <Layout>
      <div className="space-y-10 md:mt-2 mt-12">
        {/* 🔹 Summary */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {!isVisitor && (
            <motion.div className="flex items-center gap-4 p-5 bg-white shadow-md border border-indigo-100 rounded-lg hover:shadow-lg transition">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                <Users size={24} />
              </div>
              <div>
                <h4 className="text-gray-500 text-sm font-medium">
                  {isAdmin ? "Total Workers" : "Total Colleagues"}
                </h4>
                <p className="text-2xl font-bold text-indigo-700">
                  {totalTeam}
                </p>
              </div>
            </motion.div>
          )}

          <motion.div className="flex items-center gap-4 p-5 bg-white shadow-md border border-indigo-100 rounded-lg hover:shadow-lg transition">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
              <CalendarDays size={24} />
            </div>
            <div>
              <h4 className="text-gray-500 text-sm font-medium">
                {isVisitor ? "My Total Appointments" : "Total Appointments"}
              </h4>
              <p className="text-2xl font-bold text-indigo-700">
                {totalAppointments}
              </p>
            </div>
          </motion.div>
        </section>

        {/* 🔹 Appointments Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-indigo-600">
              {isVisitor ? "My Appointments Overview" : "Appointments Overview"}{" "}
              ({totalAppointments})
            </h2>
            <button
              onClick={() => setShowAppointments(!showAppointments)}
              className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
            >
              {showAppointments ? (
                <>
                  Hide <ChevronUp size={18} />
                </>
              ) : (
                <>
                  Show <ChevronDown size={18} />
                </>
              )}
              <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                {activeList.length}
              </span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-3 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setExpandedAppointments(false);
                }}
                className={`flex items-center gap-2 border px-4 py-2 rounded-full text-sm font-medium transition ${tab.color} ${activeTab === tab.key ? "bg-opacity-80 ring-2 ring-offset-1 ring-indigo-200" : "bg-white"}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className="ml-2 px-2 py-0.5 bg-indigo-50 rounded-full text-indigo-700 text-xs font-semibold">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Appointment Cards */}
          <AnimatePresence>
            {showAppointments && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeList.length === 0 ? (
                  <p className="text-gray-500">
                    No {activeTab} appointments yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(expandedAppointments
                      ? activeList
                      : activeList.slice(0, 3)
                    ).map(renderAppointmentCard)}
                  </div>
                )}

                {activeList.length > 3 && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() =>
                        setExpandedAppointments(!expandedAppointments)
                      }
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      {expandedAppointments ? "View Less" : "See More"}{" "}
                      <ChevronDown size={18} />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </Layout>
  );
};

export default Dashboard;
