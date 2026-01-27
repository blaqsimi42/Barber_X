import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegisterAdminMutation } from "../redux/features/admin/adminApiSlice";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/features/auth/authSlice";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const AdminRegister = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passkey, setPasskey] = useState("");

  const [registerAdmin, { isLoading }] = useRegisterAdminMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await registerAdmin({
        name,
        email,
        password,
        passkey,
      }).unwrap();
      dispatch(setUser(result));
      toast.success("Admin registered successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-2">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-2">
            <Shield size={22} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            Admin Register
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Create your admin account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Admin Passkey"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center gap-2 rounded-md bg-indigo-600 text-white py-1.5 text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-70`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Registering...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="text-xs text-center text-gray-500 mt-3">
          Already have an account?{" "}
          <Link
            to="/admin-login"
            className="text-indigo-600 font-medium hover:underline"
          >
            Login
          </Link>
        </p>

        <p className="text-xs text-center text-gray-500 mt-1">
          Not an admin?{" "}
          <Link
            to="/worker-login"
            className="text-indigo-600 font-medium hover:underline"
          >
            Go to Worker
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminRegister;
