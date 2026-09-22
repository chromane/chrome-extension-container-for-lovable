import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type RecorderStatus = "idle" | "recording" | "stopped" | "error";

type RecorderState = {
  status: RecorderStatus;
  elapsedSeconds: number;
  downloadUrl: string;
  mimeType: string;
  errorMessage: string;
};

const initialState: RecorderState = {
  status: "idle",
  elapsedSeconds: 0,
  downloadUrl: "",
  mimeType: "",
  errorMessage: "",
};

const recorderSlice = createSlice({
  name: "recorder",
  initialState,
  reducers: {
    setStatus(state, action: PayloadAction<RecorderStatus>) {
      state.status = action.payload;
    },
    setElapsedSeconds(state, action: PayloadAction<number>) {
      state.elapsedSeconds = action.payload;
    },
    setDownloadResult(state, action: PayloadAction<{ downloadUrl: string; mimeType: string }>) {
      state.downloadUrl = action.payload.downloadUrl;
      state.mimeType = action.payload.mimeType;
    },
    setErrorMessage(state, action: PayloadAction<string>) {
      state.errorMessage = action.payload;
      state.status = "error";
    },
    clearError(state) {
      state.errorMessage = "";
      if (state.status === "error") {
        state.status = "idle";
      }
    },
    resetRecordingState(state) {
      state.status = "idle";
      state.elapsedSeconds = 0;
      state.downloadUrl = "";
      state.mimeType = "";
      state.errorMessage = "";
    },
  },
});

export const { setStatus, setElapsedSeconds, setDownloadResult, setErrorMessage, clearError, resetRecordingState } = recorderSlice.actions;

export default recorderSlice.reducer;
