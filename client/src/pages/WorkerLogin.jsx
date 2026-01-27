import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLoginWorkerMutation } from "../redux/features/worker/workerApiSlice";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/features/auth/authSlice";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const WorkerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginWorker, { isLoading }] = useLoginWorkerMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await loginWorker({ email, password }).unwrap();
      dispatch(setUser(result));
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-2">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-2">
            <Loader2 size={22} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Worker Login</h2>
          <p className="text-xs text-gray-500 mt-1">Access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
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

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center gap-2 rounded-md bg-indigo-600 text-white py-1.5 text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-70`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-xs text-center text-gray-500 mt-3">
          No account?{" "}
          <Link
            to="/worker-register"
            className="text-indigo-600 font-medium hover:underline"
          >
            Register
          </Link>
        </p>

        <p className="text-xs text-center text-gray-500 mt-1">
          Not a worker?{" "}
          <Link
            to="/admin-login"
            className="text-indigo-600 font-medium hover:underline"
          >
            Go to Admin
          </Link>
        </p>
      </div>
    </div>
  );
};

export default WorkerLogin;
