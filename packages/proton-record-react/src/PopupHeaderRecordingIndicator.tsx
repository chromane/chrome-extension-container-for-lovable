import { useAppSelector } from "./hooks";

type PopupHeaderRecordingIndicatorProperties = {
  flowStatus: "idle" | "recording" | "uploading";
};

function formatElapsedTime(elapsedSeconds: number) {
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");
  return `${paddedMinutes}:${paddedSeconds}`;
}

function PopupHeaderRecordingIndicator(properties: PopupHeaderRecordingIndicatorProperties) {
  const elapsedSeconds = useAppSelector((state) => state.recorder.elapsedSeconds);

  if (properties.flowStatus === "recording") {
    return (
      <div
        className="popup-recording-indicator"
        aria-live="polite"
      >
        <span
          className="popup-recording-dot"
          aria-hidden="true"
        ></span>
        <span className="popup-recording-duration">{formatElapsedTime(elapsedSeconds)}</span>
      </div>
    );
  }

  if (properties.flowStatus === "uploading") {
    return (
      <div
        className="popup-recording-indicator"
        aria-live="polite"
      >
        <span
          className="popup-recording-dot"
          aria-hidden="true"
        ></span>
        <span className="popup-recording-duration">Uploading...</span>
      </div>
    );
  }

  return null;
}

export default PopupHeaderRecordingIndicator;
