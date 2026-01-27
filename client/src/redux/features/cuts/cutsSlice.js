import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedCut: null,
  isModalOpen: false,
};

const cutsSlice = createSlice({
  name: "cuts",
  initialState,
  reducers: {
    setSelectedCut: (state, action) => {
      state.selectedCut = action.payload;
    },
    clearSelectedCut: (state) => {
      state.selectedCut = null;
    },
    openModal: (state) => {
      state.isModalOpen = true;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
    },
  },
});

export const { setSelectedCut, clearSelectedCut, openModal, closeModal } =
  cutsSlice.actions;

export default cutsSlice.reducer;
