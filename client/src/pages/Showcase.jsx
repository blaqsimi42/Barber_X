import React, { useState, useRef, useEffect } from "react";
import { useGetCutsQuery } from "../redux/api/cutsApiSlice";
import { useCreateAppointmentMutation } from "../redux/api/appointmentsApiSlice";
import { toast } from "react-toastify";
import {
  Calendar,
  Loader,
  CheckCircle,
  Download,
  ArrowLeft,
} from "lucide-react";
import * as htmlToImage from "html-to-image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Showcase = () => {
  const { data, isLoading, isError } = useGetCutsQuery();

  const [selectedCut, setSelectedCut] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    appointmentDate: new Date().toISOString().split("T")[0], // default today (will be normalized below)
    appointmentTime: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);
  const [createAppointment, { isLoading: creating }] =
    useCreateAppointmentMutation();
  const ticketRef = useRef(null);
  const cutImageRefs = useRef([]);

  // Restore scroll position
  useEffect(() => {
    const savedScroll = localStorage.getItem("landing-scroll");
    if (savedScroll) {
      window.scrollTo(0, parseInt(savedScroll, 10));
      localStorage.removeItem("landing-scroll");
    }
  }, []);

  // Animate images each time they are visible
  useEffect(() => {
    if (!data?.data) return;

    cutImageRefs.current.forEach((img, i) => {
      if (!img) return;

      gsap.set(img, { scale: 1 });
      gsap.to(img, {
        scale: 1,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: img,
          start: "top 85%",
        },
      });
    });

    setTimeout(() => ScrollTrigger.refresh(), 100);
  }, [data]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Disable past times for today
  const getMinTime = () => {
    const toLocalDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const today = toLocalDate(new Date());
    if (form.appointmentDate === today) {
      const now = new Date();
      let mins = now.getMinutes() + 1; // +1 min buffer
      let hrs = now.getHours();
      if (mins >= 60) {
        mins -= 60;
        hrs = (hrs + 1) % 24;
      }
      const hours = String(hrs).padStart(2, "0");
      const minutes = String(mins).padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    return "00:00";
  };

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(ticketRef.current, {
        useCORS: true,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = "appointment-ticket.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      toast.error(
        "Couldn't download ticket. Make sure images are loaded and try again.",
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.appointmentDate || !form.appointmentTime) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const payload = {
        fullName: form.fullName,
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
        cutId: selectedCut._id,
        cutName: selectedCut.name,
        price: selectedCut.price,
      };

      const response = await createAppointment(payload).unwrap();
      setAppointmentData(response);
      setShowSuccess(true);
      setSelectedCut(null);

      const toLocalDate = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };

      setForm({
        fullName: "",
        appointmentDate: toLocalDate(new Date()),
        appointmentTime: "",
      });
    } catch (err) {
      console.error(err);
      toast.error(
        err?.data?.message ||
          "We couldn't book your appointment. Please try again.",
      );
    }
  };

  const handleBack = () => {
    localStorage.setItem("landing-scroll", window.scrollY.toString());
    window.history.back();
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center text-indigo-600 space-y-3">
          <Loader className="animate-spin w-10 h-10" />
          <p className="text-lg font-medium">Loading Cuts...</p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg">
        Failed to load cuts.
      </div>
    );

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-indigo-50 py-8 px-6">
      {/* Back Button */}
      <div
        className="mb-6 flex items-center gap-2 cursor-pointer text-indigo-600 hover:text-indigo-800 transition"
        onClick={handleBack}
      >
        <ArrowLeft size={20} />
        <span className="font-medium bg-indigo-600 text-white px-3 py-1 rounded-full">
          Back
        </span>
      </div>

      <h2 className="text-3xl font-bold text-indigo-600 text-center mb-12">
        Explore Our Signature Cuts
      </h2>

      {/* Cuts Grid */}
      {data?.data?.length === 0 ? (
        <p className="text-center text-gray-500">No cuts available yet.</p>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {data?.data?.map((cut, i) => (
            <div
              key={cut._id}
              className="bg-white shadow-lg rounded-2xl border border-indigo-100 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl"
            >
              <img
                ref={(el) => (cutImageRefs.current[i] = el)}
                src={cut.imageUrl}
                alt={cut.name}
                className="h-48 w-full object-cover"
              />
              <div className="p-4 flex flex-col grow">
                <h3 className="text-xl font-semibold text-indigo-600 mb-1 flex items-center gap-2">
                  {cut.name}
                </h3>
                <p className="text-gray-600 mb-2 grow">
                  {cut.description || "A clean, sharp, and trendy style."}
                </p>
                <div className="mt-auto flex justify-between items-center border-t border-indigo-100 pt-3">
                  <p className="text-lg font-semibold text-indigo-700">
                    ₦{cut.price}
                  </p>
                  <span className="text-gray-500 text-sm italic">
                    {cut.name}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCut(cut)}
                  className="w-full mt-3 bg-indigo-600 text-white py-2 rounded-2xl hover:bg-indigo-700 transition"
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
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative border border-indigo-100">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={form.appointmentDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]} // ✅ restrict past dates
                  className="w-full border rounded p-2 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={form.appointmentTime}
                  onChange={handleChange}
                  min={getMinTime()} // ✅ restrict past times if today
                  className="w-full border rounded p-2 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                aria-busy={creating}
                className={`w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded transition ${
                  creating
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-indigo-700"
                }`}
              >
                {creating ? (
                  <>
                    <Loader className="animate-spin w-5 h-5" />
                    <span>Confirming appointment...</span>
                  </>
                ) : (
                  "Confirm Appointment"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Ticket Modal */}
      {showSuccess && appointmentData && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div
            ref={ticketRef}
            className="relative w-full max-w-sm rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="bg-linear-to-b from-white to-indigo-50 p-6 border border-indigo-100 rounded-2xl relative z-10">
              <div className="flex flex-col items-center mb-5">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-2 shadow-sm">
                  <img
                    src="vite.svg"
                    alt="Klaud Logo"
                    className="w-8 h-8 object-contain"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
                <h3 className="text-2xl font-bold text-indigo-600">
                  Klaud Cuts
                </h3>
                <p className="text-gray-500 text-sm -mt-1">
                  Your Style, Perfected
                </p>
              </div>
              <div className="my-3 border-t border-dashed border-indigo-200"></div>
              <div className="bg-white rounded-xl p-4 shadow-inner space-y-2 mb-4 text-left">
                <p>
                  <span className="font-semibold text-gray-800">Name:</span>{" "}
                  {appointmentData.fullName}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Cut:</span>{" "}
                  {appointmentData.cutName}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Price:</span> ₦
                  {appointmentData.price}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Date:</span>{" "}
                  {new Date(
                    appointmentData.appointmentDate,
                  ).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Time:</span>{" "}
                  {appointmentData.appointmentTime}
                </p>
              </div>
              <div className="flex flex-col items-center mb-4">
                <p className="text-gray-600 text-sm mb-1 font-medium">
                  Your Bench Number
                </p>
                <div className="w-16 h-16 bg-indigo-600 text-white flex items-center justify-center rounded-full text-xl font-bold shadow-md">
                  {appointmentData.benchNumber || "TBD"}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 mb-4">
                <CheckCircle className="text-green-500" size={32} />
                <p className="text-gray-700 text-sm font-medium">
                  Appointment Confirmed
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition mb-2"
              >
                <Download size={18} /> Download Ticket
              </button>
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Showcase;
