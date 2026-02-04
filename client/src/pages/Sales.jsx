// src/pages/Sales.jsx
import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useGetAllAppointmentsQuery } from "../redux/api/appointmentsApiSlice";
import Layout from "../components/Layout";
import { Loader } from "lucide-react";

const Sales = () => {
  const { user } = useSelector((state) => state.auth);
  const {
    data: appointments = [],
    isLoading,
    isError,
  } = useGetAllAppointmentsQuery();

  // ✅ Hooks are at the top level
  const [selectedPeriod, setSelectedPeriod] = useState("All");
  const [showAll, setShowAll] = useState(false);

  // ✅ Group appointments and filter safely
  const today = new Date();

  // Completed appointments (and filtered by worker if necessary)
  const completedAppointments = useMemo(() => {
    let filtered = appointments.filter((a) => a.status === "completed");
    if (user.role === "worker") {
      filtered = filtered.filter((a) =>
        a.completedById
          ? String(a.completedById) === String(user._id)
          : a.workerName === user.name,
      );
    }
    return filtered;
  }, [appointments, user]);

  // Group appointments by year-month
  const groupedAppointments = useMemo(() => {
    const grouped = {};
    completedAppointments.forEach((appt) => {
      const date = new Date(appt.completedAt);
      const key = `${date.getFullYear()}-${date.toLocaleString("default", { month: "short" })}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(appt);
    });
    return grouped;
  }, [completedAppointments]);

  // Dropdown options: All, Today, This Month + monthly grouping
  const periodOptions = useMemo(() => {
    const baseOptions = ["All", "Today", "This Month"];
    const monthKeys = Object.keys(groupedAppointments)
      .sort((a, b) => {
        const [ay, am] = a.split("-");
        const [by, bm] = b.split("-");
        return new Date(`${by} ${bm}`) - new Date(`${ay} ${am}`);
      })
      .reverse();
    return [...baseOptions, ...monthKeys];
  }, [groupedAppointments]);

  // Filter appointments based on selectedPeriod (hook-safe)
  const filteredAppointments = useMemo(() => {
    switch (selectedPeriod) {
      case "Today":
        return completedAppointments.filter((appt) => {
          const d = new Date(appt.completedAt);
          return (
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()
          );
        });

      case "This Month":
        return completedAppointments.filter((appt) => {
          const d = new Date(appt.completedAt);
          return (
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()
          );
        });

      case "All":
        return completedAppointments;

      default:
        // monthly group like "2025-Jan"
        return groupedAppointments[selectedPeriod] || [];
    }
  }, [selectedPeriod, completedAppointments, groupedAppointments, today]);

  // Total and pagination
  const totalSales = filteredAppointments.reduce((sum, a) => sum + a.price, 0);
  const displayedAppointments = showAll
    ? filteredAppointments
    : filteredAppointments.slice(0, 10);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center text-indigo-600 space-y-3">
            <Loader className="animate-spin w-10 h-10" />
            <p className="text-lg font-medium">Loading Sales Data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <p className="text-center mt-10 text-red-600 text-lg font-medium">
          Error loading sales data
        </p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 md:mt-2 mt-12">
        <h2 className="text-3xl font-bold text-indigo-600">Sales Overview</h2>

        {/* Totals + Dropdown */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="text-xl font-semibold text-indigo-700">
            {user.role === "admin" ? "Total Sales" : "Your Sales"}: ₦
            {totalSales.toLocaleString()}
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => {
              setSelectedPeriod(e.target.value);
              setShowAll(false);
            }}
            className="border border-indigo-200 rounded-md px-3 py-2 text-sm text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {periodOptions.map((p) => (
              <option key={p} value={p}>
                {p === "All" ? "All Time" : p}
              </option>
            ))}
          </select>
        </div>

        {filteredAppointments.length === 0 ? (
          <p className="text-gray-500 mt-4">
            {user.role === "admin"
              ? "No completed appointments yet for this period."
              : "You haven't completed any appointments yet."}
          </p>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto mt-4">
              <table className="min-w-full divide-y divide-gray-200 shadow-lg rounded-lg border border-indigo-100 bg-white">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      Date Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      Completed By
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayedAppointments.map((appt) => (
                    <tr
                      key={appt._id}
                      className="hover:bg-indigo-50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                        {appt.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {appt.cutName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-semibold">
                        ₦{appt.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {new Date(appt.completedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {appt.appointmentTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {appt.workerName || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden grid grid-cols-1 gap-4 mt-4">
              {displayedAppointments.map((appt) => (
                <div
                  key={appt._id}
                  className="p-4 shadow-lg rounded-lg border border-indigo-100 bg-white"
                >
                  <p className="text-gray-700 font-medium">
                    <span className="font-semibold">Customer:</span>{" "}
                    {appt.fullName}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Service:</span>{" "}
                    {appt.cutName}
                  </p>
                  <p className="text-gray-700 font-semibold">
                    <span className="font-semibold">Price:</span> ₦
                    {appt.price.toLocaleString()}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Date:</span>{" "}
                    {new Date(appt.completedAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Time:</span>{" "}
                    {appt.appointmentTime}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Completed By:</span>{" "}
                    {appt.workerName || "-"}
                  </p>
                </div>
              ))}
            </div>

            {/* See More / View Less */}
            {filteredAppointments.length > 10 && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded hover:bg-indigo-200 transition"
                >
                  {showAll
                    ? "View Less"
                    : `See More (${filteredAppointments.length - 10} more)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Sales;
