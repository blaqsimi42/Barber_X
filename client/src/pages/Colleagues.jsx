// src/pages/Colleagues.jsx
import React from "react";
import Layout from "../components/Layout";
import { useGetColleaguesQuery } from "../redux/features/worker/workerApiSlice";
import { toast } from "react-toastify";
import { Loader } from "lucide-react";

const Colleagues = () => {
  const { data, isLoading, isError } = useGetColleaguesQuery();

  if (isLoading)
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center text-indigo-600 space-y-3">
            <Loader className="animate-spin w-10 h-10" />
            <p className="text-lg font-medium">Loading Colleagues...</p>
          </div>
        </div>
      </Layout>
    );

  if (isError) {
    toast.error("Failed to load colleagues");
    return (
      <Layout>
        <p className="text-center text-red-500 mt-10">
          Failed to load colleagues.
        </p>
      </Layout>
    );
  }

  const colleagues = data?.colleagues || [];

  return (
    <Layout>
      <div className="space-y-8 md:mt-2 mt-10">
        <h2 className="text-2xl font-bold text-indigo-600 mb-4">
          Your Colleagues
        </h2>
        {colleagues.length === 0 ? (
          <p className="text-gray-500">No colleagues found yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {colleagues.map((colleague) => (
              <div
                key={colleague._id}
                className="p-4 bg-white rounded-xl border border-indigo-100 shadow hover:shadow-lg transition flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                  {colleague.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-indigo-600">
                    {colleague.name}
                  </h3>
                  <p className="text-sm text-gray-500">{colleague.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Colleagues;
