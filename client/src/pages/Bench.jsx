// src/pages/Bench.jsx
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Layout from "../components/Layout";
import { useGetAllAppointmentsQuery } from "../redux/api/appointmentsApiSlice";
import { X } from "lucide-react";

const Bench = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || "visitor";

  const [filterStatus, setFilterStatus] = useState("All");
  const [searchName, setSearchName] = useState("");
  const [modalData, setModalData] = useState(null);

  const { data: allAppointments = [], isLoading } = useGetAllAppointmentsQuery(
    undefined,
    { skip: role === "visitor" },
  );

  // Filter and sort appointments
  const benchAppointments = useMemo(() => {
    let apps = allAppointments.filter(
      (a) =>
        a.status === "pending" ||
        a.status === "completed" ||
        a.status === "cancelled",
    );

    if (filterStatus !== "All") {
      apps = apps.filter((a) => a.status === filterStatus.toLowerCase());
    }

    if (searchName.trim() !== "") {
      apps = apps.filter((a) =>
        a.fullName.toLowerCase().includes(searchName.toLowerCase()),
      );
    }

    return apps.sort(
      (a, b) =>
        new Date(a.appointmentDate + " " + a.appointmentTime) -
        new Date(b.appointmentDate + " " + b.appointmentTime),
    );
  }, [allAppointments, filterStatus, searchName]);

  if (isLoading)
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <p className="text-indigo-600 text-lg font-semibold animate-pulse">
            Loading Bench Data...
          </p>
        </div>
      </Layout>
    );

  const statusOptions = ["All", "Pending", "Completed", "Cancelled"];

  return (
    <Layout>
      <div className="p-6 space-y-6 mt-6">
        <h1 className="text-3xl font-bold text-indigo-600">
          Bench ({benchAppointments.length})
        </h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="border border-indigo-200 rounded px-3 py-2 w-full md:w-1/2"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-indigo-200 rounded px-3 py-2 w-full md:w-1/4"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {benchAppointments.length === 0 ? (
          <p className="text-gray-500 mt-4 text-sm">
            No appointments on the bench.
          </p>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto bg-white shadow rounded-lg border border-indigo-100">
              <table className="min-w-full divide-y divide-indigo-100">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                      Appointment Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100">
                  {benchAppointments.map((app, index) => (
                    <tr
                      key={app._id}
                      className="hover:bg-indigo-50 transition cursor-pointer"
                      onClick={() => setModalData(app)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="w-6 h-6 flex items-center justify-center bg-indigo-600 text-white rounded-full">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {app.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {app.appointmentTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(app.appointmentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                            app.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : app.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {benchAppointments.map((app, index) => (
                <div
                  key={app._id}
                  className="bg-white shadow rounded-lg border border-indigo-100 p-4 space-y-2 cursor-pointer"
                  onClick={() => setModalData(app)}
                >
                  <div className="flex justify-between items-center">
                    <div className="w-6 h-6 flex items-center justify-center bg-indigo-600 text-white rounded-full text-sm font-semibold">
                      {index + 1}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
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
                  <p className="text-gray-700">
                    <span className="font-semibold">Name:</span> {app.fullName}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Time:</span>{" "}
                    {app.appointmentTime}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Date:</span>{" "}
                    {new Date(app.appointmentDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modal */}
        {modalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 p-6 relative">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                onClick={() => setModalData(null)}
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold text-indigo-600 mb-4">
                {modalData.fullName}
              </h2>
              <p className="text-gray-700">
                <span className="font-semibold">Time:</span>{" "}
                {modalData.appointmentTime}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Date:</span>{" "}
                {new Date(modalData.appointmentDate).toLocaleDateString()}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Status:</span>{" "}
                {modalData.status}
              </p>
              {modalData.benchNumber && (
                <p className="text-gray-700">
                  <span className="font-semibold">Bench:</span>{" "}
                  {modalData.benchNumber}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Bench;
