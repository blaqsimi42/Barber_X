
import React, { useState } from "react";
import { useSelector } from "react-redux";
import Layout from "../components/Layout";
import { toast } from "react-toastify";
import { Clipboard } from "lucide-react";

const Profile = () => {
  const user = useSelector((state) => state.auth.user);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: call API to update profile
    toast.success("Profile updated successfully!");
  };

  const handleCopyAdminCode = () => {
    if (user?.adminCode) {
      navigator.clipboard.writeText(user.adminCode);
      toast.success("Admin code copied successfully!");
    }
  };

  return (
    <Layout>
      <>
      <div className="mt-12 md:mt-2">
              <h2 className="text-2xl font-bold mb-4 text-indigo-600">Profile</h2>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Name"
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Email"
        />

        {/* Admin code section - only show if user is admin */}
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

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Update Profile
        </button>
      </form>
      </div>

      </>
    </Layout>
  );
};

export default Profile;
