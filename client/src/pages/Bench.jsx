import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Layout from "../components/Layout";
import { useGetAllAppointmentsQuery } from "../redux/api/appointmentsApiSlice";
import { Loader } from "lucide-react";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* -----------------------------
   Sortable Row
----------------------------- */
const SortableRow = ({ app, index }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: app._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="hover:bg-indigo-50 cursor-grab active:cursor-grabbing"
    >
      <td className="px-6 py-4">
        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm">
          {index + 1}
        </div>
      </td>
      <td className="px-6 py-4">{app.fullName}</td>
      <td className="px-6 py-4">{app.appointmentTime}</td>
      <td className="px-6 py-4">
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
  );
};

/* -----------------------------
   Bench Page
----------------------------- */
const Bench = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || "admin";

  const audioRef = useRef(null);
  const prevPendingIdsRef = useRef(new Set());
  const [timeFilter, setTimeFilter] = useState("today");

  const { data: allAppointments = [], isLoading } = useGetAllAppointmentsQuery(
    undefined,
    {
      skip: !user,
      pollingInterval: 5000,
    },
  );

  /* -----------------------------
     Filter appointments by time period
  ----------------------------- */
  const getFilteredAppointments = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const parseDateOnly = (dateInput) => {
      if (!dateInput) return new Date(NaN);
      const s = String(dateInput).split("T")[0];
      const parts = s.split("-");
      if (parts.length === 3) {
        const [y, m, d] = parts.map(Number);
        return new Date(y, m - 1, d);
      }
      const dObj = new Date(dateInput);
      return new Date(dObj.getFullYear(), dObj.getMonth(), dObj.getDate());
    };

    return allAppointments.filter((app) => {
      if (!["pending", "completed", "cancelled"].includes(app.status)) {
        return false;
      }

      const appDateOnly = parseDateOnly(app.appointmentDate);

      switch (timeFilter) {
        case "today":
          return appDateOnly.getTime() === today.getTime();
        case "month":
          return (
            appDateOnly.getFullYear() === now.getFullYear() &&
            appDateOnly.getMonth() === now.getMonth()
          );
        case "year":
          return appDateOnly.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  }, [allAppointments, timeFilter]);

  /* -----------------------------
     Group Appointments by Date
  ----------------------------- */
  const groupedByDate = useMemo(() => {
    const grouped = getFilteredAppointments.reduce((acc, app) => {
      const date = new Date(app.appointmentDate).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(app);
      return acc;
    }, {});

    const now = new Date();
    const todayStr = now.toLocaleDateString();
    const sorted = {};

    if (grouped[todayStr]) {
      sorted[todayStr] = grouped[todayStr];
    }

    Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .forEach((date) => {
        if (date !== todayStr) {
          sorted[date] = grouped[date];
        }
      });

    return sorted;
  }, [getFilteredAppointments]);

  const [expandedDates, setExpandedDates] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("benchExpandedDates")) || {};
    } catch {
      return {};
    }
  });

  const [localQueue, setLocalQueue] = useState({});

  /* -----------------------------
     Initialize localQueue SAFELY (NO LOOP)
  ----------------------------- */
  useEffect(() => {
    setLocalQueue((prev) => {
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(groupedByDate);

      if (prevKeys.length === nextKeys.length) {
        return prev;
      }

      return groupedByDate;
    });
  }, [groupedByDate]);

  /* -----------------------------
     Sound Notification (ONLY NEW pending)
  ----------------------------- */
  useEffect(() => {
    const pending = allAppointments.filter((a) => a.status === "pending");
    const pendingIds = new Set(pending.map((a) => a._id));

    const hasNewPending = pending.some(
      (a) => !prevPendingIdsRef.current.has(a._id),
    );

    if (hasNewPending) {
      audioRef.current?.play().catch(() => {});
    }

    prevPendingIdsRef.current = pendingIds;
  }, [allAppointments]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center text-indigo-600 space-y-3">
            <Loader className="animate-spin w-10 h-10" />
            <p className="text-lg font-medium">Loading Bench List...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <audio ref={audioRef} src="/sounds/bench-notify.mp3" />

      <div className="p-4 sm:p-6 space-y-8 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600">
            Bench ({getFilteredAppointments.length})
          </h1>

          {/* Time Filter Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            {[
              { label: "Today", value: "today" },
              { label: "This Month", value: "month" },
              { label: "This Year", value: "year" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setTimeFilter(filter.value)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition ${
                  timeFilter === filter.value
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {Object.keys(groupedByDate).length === 0 && (
          <p className="text-gray-500">No bench appointments.</p>
        )}

        {Object.entries(groupedByDate).map(([date, apps]) => {
          const isExpanded = expandedDates[date];
          const visibleApps = isExpanded ? localQueue[date] : apps.slice(0, 4);

          return (
            <div key={date} className="space-y-4">
              <h2 className="text-lg font-semibold text-indigo-700">{date}</h2>

              {/* Desktop */}
              <div className="hidden lg:block bg-white rounded-lg shadow border border-indigo-100 overflow-x-auto">
                {isExpanded ? (
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={({ active, over }) => {
                      if (!over || active.id === over.id) return;

                      setLocalQueue((prev) => {
                        const oldIndex = prev[date].findIndex(
                          (i) => i._id === active.id,
                        );
                        const newIndex = prev[date].findIndex(
                          (i) => i._id === over.id,
                        );

                        return {
                          ...prev,
                          [date]: arrayMove(prev[date], oldIndex, newIndex),
                        };
                      });
                    }}
                  >
                    <table className="min-w-full">
                      <thead className="bg-indigo-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700">
                            No.
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700">
                            Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <SortableContext
                        items={visibleApps.map((a) => a._id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <tbody>
                          {visibleApps.map((app, index) => (
                            <SortableRow
                              key={app._id}
                              app={app}
                              index={index}
                            />
                          ))}
                        </tbody>
                      </SortableContext>
                    </table>
                  </DndContext>
                ) : (
                  <table className="min-w-full">
                    <tbody>
                      {visibleApps.map((app, index) => (
                        <SortableRow key={app._id} app={app} index={index} />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Mobile */}
              <div className="lg:hidden space-y-3">
                {visibleApps.map((app, index) => (
                  <div
                    key={app._id}
                    className="bg-white border border-indigo-100 rounded-lg shadow p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm">
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

                    <p className="text-gray-700 font-medium">{app.fullName}</p>
                    <p className="text-sm text-gray-500">
                      {app.appointmentTime}
                    </p>
                  </div>
                ))}
              </div>

              {/* View More / Less */}
              {apps.length > 4 && (
                <div className="flex justify-center">
                  <button
                    onClick={() =>
                      setExpandedDates((prev) => ({
                        ...prev,
                        [date]: !prev[date],
                      }))
                    }
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-100 transition"
                  >
                    {isExpanded ? "View Less" : "View More"}
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Layout>
  );
};

export default Bench;
