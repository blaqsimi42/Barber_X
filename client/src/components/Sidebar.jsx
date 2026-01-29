// src/components/Sidebar.jsx
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  Users,
  Scissors,
  Calendar,
  LayoutDashboard,
  UsersRound,
  DollarSign,
  X,
  Armchair,
} from "lucide-react";
import { logout } from "../redux/features/auth/authSlice";
import {
  useGetAllAppointmentsQuery,
  useGetAppointmentsByNameQuery,
} from "../redux/api/appointmentsApiSlice";
import { useGetWorkersQuery } from "../redux/features/admin/adminApiSlice";

const Sidebar = ({ onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.role;

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("visitorToken");
    localStorage.removeItem("visitorName");
    navigate("/admin-login");
  };

  // ------------------------
  // LIVE DATA (Polling)
  // ------------------------

  const { data: allAppointments = [] } = useGetAllAppointmentsQuery(undefined, {
    skip: !user || role === "visitor",
    pollingInterval: 5000, // 🔥 LIVE
  });

  const visitorName =
    role === "visitor" ? localStorage.getItem("visitorName") || "" : "";

  const { data: myAppointments = [] } = useGetAppointmentsByNameQuery(
    visitorName,
    {
      skip: role !== "visitor",
      pollingInterval: 5000, // 🔥 LIVE
    },
  );

  const { data: workersData } = useGetWorkersQuery(undefined, {
    skip: role !== "admin",
    pollingInterval: 10000, // Workers don’t change often
  });

  // ------------------------
  // COUNTS (LIVE)
  // ------------------------

  const totalWorkers = workersData?.workers?.length || 0;

  const benchCount =
    role === "admin" || role === "worker"
      ? allAppointments.filter(
          (a) =>
            a.status === "pending" ||
            a.status === "completed" ||
            a.status === "cancelled",
        ).length
      : 0;

  let newAppointments = 0;
  let totalSales = 0;

  if (role === "admin") {
    newAppointments = allAppointments.filter(
      (a) => a.status === "pending",
    ).length;

    totalSales = allAppointments.filter((a) => a.status === "completed").length;
  }

  if (role === "worker") {
    newAppointments = allAppointments.filter(
      (a) => a.status === "pending" && a.workerName === user?.name,
    ).length;

    totalSales = allAppointments.filter(
      (a) => a.status === "completed" && a.workerName === user?.name,
    ).length;
  }

  if (role === "visitor") {
    newAppointments = myAppointments.filter(
      (a) => a.status === "pending",
    ).length;
  }

  // ------------------------
  // ACTIVE LINK STYLE
  // ------------------------

  const isActive = (path) =>
    location.pathname === path
      ? "bg-indigo-50 text-indigo-600 font-semibold"
      : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600";

  // ------------------------
  // MENU ITEMS
  // ------------------------

  const menuItems = [];

  if (role === "admin") {
    menuItems.push(
      { label: "Dashboard", icon: LayoutDashboard, link: "/dashboard" },
      {
        label: "Workers",
        icon: Users,
        link: "/dashboard/workers",
        badge: totalWorkers,
      },
      {
        label: "Bench",
        icon: Armchair,
        link: "/dashboard/bench",
        badge: benchCount,
      },
      { label: "Cuts", icon: Scissors, link: "/dashboard/cuts" },
      {
        label: "Appointments",
        icon: Calendar,
        link: "/dashboard/appointments",
        badge: newAppointments,
      },
      {
        label: "Sales",
        icon: DollarSign,
        link: "/dashboard/sales",
        badge: totalSales,
      },
    );
  }

  if (role === "worker") {
    menuItems.push(
      { label: "Dashboard", icon: LayoutDashboard, link: "/dashboard" },
      {
        label: "Colleagues",
        icon: UsersRound,
        link: "/dashboard/colleagues",
        badge: totalWorkers,
      },
      {
        label: "Bench",
        icon: Armchair,
        link: "/dashboard/bench",
        badge: benchCount,
      },
      { label: "Cuts", icon: Scissors, link: "/dashboard/cuts" },
      {
        label: "Appointments",
        icon: Calendar,
        link: "/dashboard/appointments",
        badge: newAppointments,
      },
      {
        label: "Sales",
        icon: DollarSign,
        link: "/dashboard/sales",
        badge: totalSales,
      },
    );
  }

  if (role === "visitor") {
    menuItems.push({
      label: "My Appointments",
      icon: Calendar,
      link: "/appointments",
      badge: newAppointments,
    });
  }

  // ------------------------
  // RENDER
  // ------------------------

  return (
    <div className="flex flex-col justify-between h-full">
      {/* Mobile Close */}
      <div className="flex justify-end p-4 md:hidden">
        <button onClick={onClose} className="text-indigo-600">
          <X size={24} />
        </button>
      </div>

      {/* Profile */}
      <div className="flex flex-col items-center p-4 bg-gray-50">
        <Link to="/profile">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold mb-2">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
        </Link>
        <p className="text-sm font-medium text-gray-700">{user?.name}</p>
        <p className="text-xs text-gray-400 capitalize">{role}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 px-3">
        <div className="rounded-2xl bg-white shadow-sm border border-indigo-50 overflow-hidden">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.link}
              onClick={onClose}
              className={`flex items-center justify-between px-5 py-3 transition border-b border-indigo-100 last:border-b-0 ${isActive(
                item.link,
              )}`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                <span>{item.label}</span>
              </div>

              {item.badge > 0 && (
                <span className="ml-auto text-xs font-semibold bg-indigo-600 text-white rounded-full px-2 py-0.5">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 bg-gray-50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full text-red-600 hover:text-red-700 transition"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
