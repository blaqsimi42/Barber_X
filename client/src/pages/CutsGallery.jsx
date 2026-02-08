import React, { useState } from "react";
import { useGetCutsQuery } from "../redux/api/cutsApiSlice";
import Layout from "../components/Layout";
import { toast } from "react-toastify";
import { Calendar } from "lucide-react";
import Navbar from "./Navbar";

const CutsGallery = () => {
  const { data, isLoading, isError } = useGetCutsQuery();

  const [selectedCut, setSelectedCut] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    appointmentDate: "",
    appointmentTime: "",
  });

  // Handle input changes
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Handle booking submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.appointmentDate || !form.appointmentTime) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      toast.success("Appointment booked successfully!");
      setSelectedCut(null);
      setForm({
        fullName: "",
        appointmentDate: "",
        appointmentTime: "",
      });
    } catch (err) {
      toast.error("We couldn't book the appointment. Please try again.");
    }
  };

  if (isLoading)
    return <p className="text-center text-indigo-600">Loading cuts...</p>;
  if (isError)
    return <p className="text-center text-red-500">Failed to load cuts.</p>;

  return (
    <Layout>
      <div className="space-y-10">
        <h2 className="text-2xl font-bold text-indigo-600 text-center">
          Browse Cuts & Book Appointment
        </h2>

        {/* Cuts Grid */}
        {data?.data?.length === 0 ? (
          <p className="text-center text-gray-500">No cuts available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data?.map((cut) => (
              <div
                key={cut._id}
                className="bg-white shadow-lg rounded-lg border border-indigo-100 overflow-hidden hover:shadow-xl transition"
              >
                <img
                  src={cut.imageUrl}
                  alt={cut.name}
                  className="h-52 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-indigo-600">
                    {cut.name}
                  </h3>
                  <p className="text-gray-700 mb-2">${cut.price}</p>
                  <button
                    onClick={() => setSelectedCut(cut)}
                    className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Modal */}
        {selectedCut && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative border border-indigo-100 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedCut(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>

              <h3 className="text-xl font-semibold text-indigo-600 mb-4 flex items-center gap-2">
                <Calendar size={18} /> Book Appointment
              </h3>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Appointment Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className="w-full border rounded p-2 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={form.appointmentDate}
                    onChange={handleChange}
                    className="w-full border rounded p-2 focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    name="appointmentTime"
                    value={form.appointmentTime}
                    onChange={handleChange}
                    className="w-full border rounded p-2 focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
                >
                  Confirm Appointment
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CutsGallery;
