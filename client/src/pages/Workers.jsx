import React from "react";
import { useGetWorkersQuery } from "../redux/features/admin/adminApiSlice";
import Layout from "../components/Layout";
import { Loader } from "lucide-react";

const Workers = () => {
  const { data, isLoading, isError, error } = useGetWorkersQuery();

  if (isLoading)
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center text-indigo-600 space-y-3">
            <Loader className="animate-spin w-10 h-10" />
            <p className="text-lg font-medium">Loading Workers List...</p>
          </div>
        </div>
      </Layout>
    );

  if (isError)
    return (
      <Layout>
        <p className="text-center text-red-500 mt-10">
          {error?.data?.message || "Failed to fetch workers."}
        </p>
      </Layout>
    );

  const workers = data?.workers || data; // depending on how your API returns it

  return (
    <Layout>
      <div className="space-y-8 mt-10 md:mt-0">
        <h2 className="text-2xl font-bold text-indigo-600 text-center">
          All Registered Workers
        </h2>

        {!workers || workers.length === 0 ? (
          <p className="text-center text-gray-500">No workers found yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => {
              const initial = worker.name?.charAt(0)?.toUpperCase() || "?";

              return (
                <div
                  key={worker._id}
                  className="p-6 bg-white rounded-xl shadow border border-indigo-100 hover:shadow-lg transition text-center"
                >
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <div className="bg-indigo-100 text-indigo-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold shadow-sm">
                      {initial}
                    </div>
                  </div>

                  {/* Worker Info */}
                  <h3 className="text-lg font-semibold text-gray-800">
                    {worker.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-2">{worker.email}</p>

                  <div className="mt-3 text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-semibold text-gray-700">Role:</span>{" "}
                      {worker.role || "Worker"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-700">
                        Created:
                      </span>{" "}
                      {new Date(worker.createdAt).toLocaleDateString()}
                    </p>
                    {worker.phone && (
                      <p>
                        <span className="font-semibold text-gray-700">
                          Phone:
                        </span>{" "}
                        {worker.phone}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Workers;
