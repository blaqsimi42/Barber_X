// src/pages/Cuts.jsx
import React, { useState } from "react";
import Layout from "../components/Layout";
import { useSelector, useDispatch } from "react-redux";
import {
  useGetMyCutsQuery,
  useCreateCutMutation,
  useDeleteCutMutation,
} from "../redux/api/cutsApiSlice";
import { toast } from "react-toastify";
import { Loader, Loader2, Trash2, Upload, Pencil } from "lucide-react";
import { setSelectedCut, openModal } from "../redux/features/cuts/cutsSlice";
import EditCutModal from "../components/EditCutModal";

const Cuts = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isModalOpen } = useSelector((state) => state.cuts);

  const { data, isLoading, isError } = useGetMyCutsQuery();
  const [createCut, { isLoading: isCreating }] = useCreateCutMutation();
  const [deleteCut] = useDeleteCutMutation();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!name || !price || !file) {
      toast.error("Please complete all fields and choose an image");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("image", file);

    try {
      await createCut(formData).unwrap();
      toast.success("Cut uploaded successfully!");
      setName("");
      setPrice("");
      setFile(null);
      setPreview("");
    } catch (err) {
      toast.error(
        err?.data?.message || "We couldn't upload the cut. Please try again.",
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this cut?")) {
      try {
        await deleteCut(id).unwrap();
        toast.success("Cut deleted successfully!");
      } catch (err) {
        toast.error(
          err?.data?.message || "We couldn't delete the cut. Please try again.",
        );
      }
    }
  };

  const handleEdit = (cut) => {
    dispatch(setSelectedCut(cut));
    dispatch(openModal());
  };

  return (
    <Layout>
      {isLoading ? (
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center text-indigo-600 space-y-3">
            <Loader className="animate-spin w-10 h-10" />
            <p className="text-lg font-medium">Loading Cuts...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 md:mt-2 mt-12">
          <h2 className="text-2xl font-bold text-indigo-600">
            {user?.role === "admin" ? "Manage Cuts" : "My Cuts"}
          </h2>

          {/* Upload Form */}
          <form
            onSubmit={handleUpload}
            className="bg-white p-6 rounded-lg shadow border border-indigo-100 space-y-4 max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Upload size={18} className="text-indigo-600" /> Upload a New Cut
            </h3>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cut Name"
              className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded p-2"
            />

            {preview && (
              <div className="mt-2">
                <img
                  src={preview}
                  alt="Preview"
                  className="rounded-lg w-full h-40 object-cover border border-indigo-100"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isCreating}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition disabled:opacity-70"
            >
              {isCreating ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Uploading...
                </>
              ) : (
                "Upload Cut"
              )}
            </button>
          </form>

          {/* Cuts Grid */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              My Uploaded Works
            </h3>

            {isError ? (
              <p className="text-red-500">Failed to load cuts</p>
            ) : data?.data?.length === 0 ? (
              <p className="text-gray-500">No cuts uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.data.map((cut) => (
                  <div
                    key={cut._id}
                    className="p-4 bg-white rounded-lg shadow border border-indigo-100 hover:shadow-lg transition"
                  >
                    <img
                      src={cut.imageUrl}
                      alt={cut.name}
                      className="rounded-lg mb-3 w-full h-40 object-cover border border-gray-100"
                    />
                    <h4 className="font-semibold text-indigo-600">
                      {cut.name}
                    </h4>
                    <p className="text-gray-700">₦{cut.price}</p>
                    <p className="text-xs text-gray-400">
                      Uploaded by: {cut.uploadedByName}
                    </p>

                    <div className="flex items-center gap-4 mt-3">
                      <button
                        onClick={() => handleEdit(cut)}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                      >
                        <Pencil size={16} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cut._id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {isModalOpen && <EditCutModal />}
        </div>
      )}
    </Layout>
  );
};

export default Cuts;
