import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useUpdateCutMutation } from "../redux/api/cutsApiSlice";
import { Loader2, X } from "lucide-react";
import { clearSelectedCut } from "../redux/features/cuts/cutsSlice";
import { toast } from "react-toastify";

const EditCutModal = () => {
  const dispatch = useDispatch();
  const { selectedCut } = useSelector((state) => state.cuts);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [updateCut, { isLoading: isUpdating }] = useUpdateCutMutation();

  // Populate form when modal opens
  useEffect(() => {
    if (selectedCut) {
      setName(selectedCut.name);
      setPrice(selectedCut.price);
      setPreview(selectedCut.imageUrl);
    }
  }, [selectedCut]);

  if (!selectedCut) return null;

  // Handle image preview
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) setPreview(URL.createObjectURL(selected));
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) {
      toast.error("Please fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    if (file) formData.append("image", file);

    try {
      await updateCut({ id: selectedCut._id, formData }).unwrap();
      toast.success("Cut updated successfully!");
      dispatch(clearSelectedCut());
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update cut");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 bg-opacity-40 flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md border border-indigo-100 relative"
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          exit={{ y: 50 }}
        >
          {/* Close Button */}
          <button
            onClick={() => dispatch(clearSelectedCut())}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>

          <h3 className="text-xl font-semibold text-indigo-600 mb-4">
            Edit Cut
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cut Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded p-2 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border rounded p-2 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border rounded p-2"
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg mt-2 border"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition disabled:opacity-70"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Updating...
                </>
              ) : (
                "Update Cut"
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditCutModal;
