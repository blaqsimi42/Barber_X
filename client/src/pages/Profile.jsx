import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Layout from "../components/Layout";
import { toast } from "react-toastify";
import { Clipboard } from "lucide-react";
import { useUpdateAdminProfileMutation } from "../redux/features/admin/adminApiSlice";
import { useUpdateWorkerProfileMutation } from "../redux/features/worker/workerApiSlice";
import { setUser } from "../redux/features/auth/authSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [updateAdminProfile, { isLoading: updatingAdmin }] =
    useUpdateAdminProfileMutation();
  const [updateWorkerProfile, { isLoading: updatingWorker }] =
    useUpdateWorkerProfileMutation();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
  });

  // 🔄 Keep form state in sync with updated Redux user
  useEffect(() => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      password: "",
    });
  }, [user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name: form.name,
        email: form.email,
        ...(form.password && { password: form.password }),
      };

      let updatedUser;

      if (user.role === "admin") {
        updatedUser = await updateAdminProfile(payload).unwrap();
      } else if (user.role === "worker") {
        updatedUser = await updateWorkerProfile(payload).unwrap();
      }

      // update auth state with fresh token + data
      dispatch(setUser(updatedUser));

      setForm({ ...form, password: "" });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  const handleCopyAdminCode = () => {
    if (user?.adminCode) {
      navigator.clipboard.writeText(user.adminCode);
      toast.success("Admin code copied successfully!");
    }
  };

  const getInitials = () => {
    if (form.name) {
      const parts = form.name.trim().split(" ");
      return parts.length >= 2
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : parts[0][0].toUpperCase();
    }
    return form.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <Layout>
      <div className="mt-12 md:mt-2">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600">Profile</h2>

        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          {/* Avatar */}
          <div className="flex justify-center">
            <div
              className={`w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md ${
                getInitials().length === 1 ? "text-5xl" : "text-3xl"
              }`}
            >
              {getInitials()}
            </div>
          </div>

          {/* Name */}
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Name"
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Email"
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="New Password (optional)"
          />

          {/* Admin Code */}
          {user?.role === "admin" && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={user.adminCode}
                readOnly
                className="w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
              />
              <button
                type="button"
                onClick={handleCopyAdminCode}
                className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              >
                <Clipboard size={16} />
                Copy
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={updatingAdmin || updatingWorker}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition disabled:opacity-70"
          >
            {updatingAdmin || updatingWorker ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Profile;
