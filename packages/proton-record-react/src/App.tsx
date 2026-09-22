import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { clearError, resetRecordingState, setDownloadResult, setElapsedSeconds, setErrorMessage, setStatus } from "./features/recorder/recorderSlice";
import { useAppDispatch, useAppSelector } from "./hooks";
import { RecordingManager } from "./RecordingManager";
import { cn } from "./lib/utils";
import sprite_icons_csv from "./assets/sprite-icons.svg?raw";
import Icon from "./Icon";
import PassLogo from "./PassLogo";
import AudioVisualizer from "./AudioVisualizer";
import { decryptBlob } from "./crypto";
import { base64_to_blob } from "./helpers";
import PopupHeaderRecordingIndicator from "./PopupHeaderRecordingIndicator";

type AudioInputOption = {
  deviceId: string;
  label: string;
};

type CameraInputOption = {
  deviceId: string;
  label: string;
};

type MicAccessStatus = "unknown" | "granted" | "denied";
type CameraAccessStatus = "unknown" | "granted" | "denied";
type ScreenAccessStatus = "unknown" | "granted" | "denied";

function App() {
  const dispatch = useAppDispatch();
  const recorderErrorMessage = useAppSelector((state) => state.recorder.errorMessage);
  //
  const [includeSystemAudio, setIncludeSystemAudio] = useState(true);
  const [audioInputOptions, setAudioInputOptions] = useState<AudioInputOption[]>([]);
  const [selectedAudioInputDeviceId, setSelectedAudioInputDeviceId] = useState("");
  const [cameraInputOptions, setCameraInputOptions] = useState<CameraInputOption[]>([]);
  const [selectedCameraInputDeviceId, setSelectedCameraInputDeviceId] = useState("");
  const [currentAudioStream, setCurrentAudioStream] = useState<MediaStream | null>(null);
  //
  const ref_live_preview = useRef<HTMLVideoElement | null>(null);
  const ref_recorded_preview = useRef<HTMLVideoElement | null>(null);
  const ref_camera_preview = useRef<HTMLVideoElement | null>(null);
  const ref_screen_preview = useRef<HTMLVideoElement | null>(null);
  const [currentScreenStream, setCurrentScreenStream] = useState<MediaStream | null>(null);
  //
  const [mic_access_status, set_mic_access_status] = useState<MicAccessStatus>("unknown");
  const [camera_access_status, set_camera_access_status] = useState<CameraAccessStatus>("unknown");
  const [screen_access_status, set_screen_access_status] = useState<ScreenAccessStatus>("unknown");
  //
  const [decrypted_video_url, set_decrypted_video_url] = useState<string | null>(null);
  const [decrypted_video_status, set_decrypted_video_status] = useState<"unknown" | "absent" | "ready" | "error">("unknown");
  //
  const [flow_status, set_flow_status] = useState<"idle" | "recording" | "uploading">("idle");
  //
  const [recordingManager] = useState(() => {
    return new RecordingManager({
      onClearError: () => {
        dispatch(clearError());
      },
      onStatusChanged: (status) => {
        dispatch(setStatus(status));
      },
      onElapsedSecondsChanged: (elapsedSeconds) => {
        dispatch(setElapsedSeconds(elapsedSeconds));
      },
      onDownloadResultChanged: (result) => {
        dispatch(setDownloadResult(result));
      },
      onErrorMessage: (message) => {
        dispatch(setErrorMessage(message));
      },
      onResetState: () => {
        dispatch(resetRecordingState());
      },
      //
      onRecordingStarted: () => {
        dispatch(setElapsedSeconds(0));
        set_flow_status("recording");
      },
      onRecordingDurationChanged: (duration) => {
        const durationInSeconds = Math.floor(duration / 1000);
        dispatch(setElapsedSeconds(durationInSeconds));
      },
      onRecordingStopped: () => {
        set_flow_status("uploading");
      },
      onRecordingUploaded: () => {
        dispatch(setElapsedSeconds(0));
        set_flow_status("idle");
      },
    });
  });

  const [popupOpen, setPpopupOpen] = useState(true);

  useEffect(() => {
    recordingManager.setLivePreviewElement(ref_live_preview.current);
    recordingManager.setRecordedPreviewElement(ref_recorded_preview.current);
  }, [recordingManager]);

  useEffect(() => {
    return () => {
      recordingManager.dispose();
    };
  }, [recordingManager]);

  useEffect(() => {
    const screenPreviewElement = ref_screen_preview.current;
    if (screenPreviewElement === null) {
      return;
    }

    screenPreviewElement.srcObject = currentScreenStream;
    if (currentScreenStream !== null) {
      void screenPreviewElement.play();
    }
  }, [currentScreenStream]);

  useEffect(() => {
    let shouldIgnoreUpdates = false;

    async function refreshMediaInputSources() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        if (!shouldIgnoreUpdates) {
          setAudioInputOptions([]);
          setSelectedAudioInputDeviceId("");
          setCameraInputOptions([]);
          setSelectedCameraInputDeviceId("");
        }
        return;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const availableAudioInputDevices = devices.filter((device) => {
          return device.kind === "audioinput";
        });
        const availableCameraInputDevices = devices.filter((device) => {
          return device.kind === "videoinput";
        });

        const mappedAudioInputOptions = availableAudioInputDevices.map((device, index) => {
          let audioLabel = device.label;
          if (audioLabel === "") {
            audioLabel = `Microphone ${index + 1}`;
          }

          return {
            deviceId: device.deviceId,
            label: audioLabel,
          };
        });

        const mappedCameraInputOptions = availableCameraInputDevices.map((device, index) => {
          let cameraLabel = device.label;
          if (cameraLabel === "") {
            cameraLabel = `Camera ${index + 1}`;
          }

          return {
            deviceId: device.deviceId,
            label: cameraLabel,
          };
        });

        if (shouldIgnoreUpdates) {
          return;
        }

        setAudioInputOptions(mappedAudioInputOptions);
        setSelectedAudioInputDeviceId((currentSelectedDeviceId) => {
          const selectedDeviceStillAvailable = mappedAudioInputOptions.some((option) => {
            return option.deviceId === currentSelectedDeviceId;
          });

          if (selectedDeviceStillAvailable) {
            return currentSelectedDeviceId;
          }

          if (mappedAudioInputOptions.length > 0) {
            return mappedAudioInputOptions[0].deviceId;
          }

          return "";
        });

        setCameraInputOptions(mappedCameraInputOptions);
        setSelectedCameraInputDeviceId((currentSelectedDeviceId) => {
          const selectedDeviceStillAvailable = mappedCameraInputOptions.some((option) => {
            return option.deviceId === currentSelectedDeviceId;
          });

          if (selectedDeviceStillAvailable) {
            return currentSelectedDeviceId;
          }

          if (mappedCameraInputOptions.length > 0) {
            return mappedCameraInputOptions[0].deviceId;
          }

          return "";
        });
      } catch {
        if (!shouldIgnoreUpdates) {
          setAudioInputOptions([]);
          setSelectedAudioInputDeviceId("");
          setCameraInputOptions([]);
          setSelectedCameraInputDeviceId("");
        }
      }
    }

    const onDeviceChange = () => {
      void refreshMediaInputSources();
    };

    void refreshMediaInputSources();

    if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
      navigator.mediaDevices.addEventListener("devicechange", onDeviceChange);
    }

    return () => {
      shouldIgnoreUpdates = true;
      if (navigator.mediaDevices && navigator.mediaDevices.removeEventListener) {
        navigator.mediaDevices.removeEventListener("devicechange", onDeviceChange);
      }
    };
  }, []);

  useEffect(() => {
    async function main() {
      //
      let video_id = location.pathname.replace("/", "");
      let video_password = location.hash.replace("#", "");
      //
      if (video_id === "" || video_password === "") {
        set_decrypted_video_status("absent");
      } else {
        try {
          //
          let result = await fetch(`http://localhost:8080/back/proton-record-demo/video/${video_id}`, {
            method: "GET",
          });
          let json = await result.json();
          console.log("json", json);
          //
          console.log("video_password", video_password);
          //
          let blob = await base64_to_blob(json.file);
          console.log("blob", blob);
          //
          let decrypted_blob = await decryptBlob(blob, video_password, "video/webm");
          let decryptedDownloadUrl = URL.createObjectURL(decrypted_blob);
          set_decrypted_video_status("ready");
          set_decrypted_video_url(decryptedDownloadUrl);
          console.log("decryptedDownloadUrl", decryptedDownloadUrl);
          //
        } catch (error: any) {
          set_decrypted_video_status("error");
        }
      }
    }

    main();
  }, []);

  async function startRecording() {
    set_flow_status("recording");
    await recordingManager.start_recording();
  }

  function stopRecording() {
    set_flow_status("uploading");
    recordingManager.stop_recording();
  }

  function toggle_popup() {
    setPpopupOpen(!popupOpen);
  }

  async function addMicrophone() {
    const microphoneStream = await recordingManager.add_microphone(selectedAudioInputDeviceId);
    console.log("addMicrophone microphoneStream", microphoneStream);
    if (microphoneStream === null) {
      set_mic_access_status("denied");
      return;
    } else {
      set_mic_access_status("granted");
      setCurrentAudioStream(microphoneStream);
    }
  }

  async function addCamera() {
    const cameraStream = await recordingManager.add_camera(selectedCameraInputDeviceId);
    console.log("addCamera cameraStream", cameraStream);
    if (cameraStream === null) {
      set_camera_access_status("denied");
      return;
    } else {
      set_camera_access_status("granted");
      // ref_camera_preview.current!.srcObject = cameraStream;
    }
  }

  async function addScreen() {
    const screenStream = await recordingManager.add_screen();
    if (screenStream === null) {
      set_screen_access_status("denied");
      return;
    } else {
      set_screen_access_status("granted");
      setCurrentScreenStream(screenStream);
    }
  }

  async function handleAudioInputSourceChange(selectedDeviceId: string) {
    setSelectedAudioInputDeviceId(selectedDeviceId);

    if (selectedDeviceId === "") {
      setCurrentAudioStream(null);
      return;
    }

    const microphoneStream = await recordingManager.add_microphone(selectedDeviceId);
    if (microphoneStream === null) {
      return;
    }

    setCurrentAudioStream(microphoneStream);
  }

  async function handleCameraInputSourceChange(selectedDeviceId: string) {
    setSelectedCameraInputDeviceId(selectedDeviceId);

    if (selectedDeviceId === "") {
      return;
    }

    const cameraStream = await recordingManager.add_camera(selectedDeviceId);
    if (cameraStream === null) {
      return;
    }

    if (ref_camera_preview.current !== null) {
      ref_camera_preview.current.srcObject = cameraStream;
    }
  }

  const ref_camera_preview_callback = (element: HTMLVideoElement | null) => {
    if (element) {
      ref_camera_preview.current = element;
      element.srcObject = recordingManager.current_camera_stream;
    }
  };

  const ref_screen_preview_callback = (element: HTMLVideoElement | null) => {
    ref_screen_preview.current = element;

    if (element !== null) {
      element.srcObject = currentScreenStream;
      if (currentScreenStream !== null) {
        void element.play();
      }
    }
  };

  const icons_root = useMemo(() => {
    return (
      <div
        id="icons-root"
        dangerouslySetInnerHTML={{ __html: sprite_icons_csv }}
      ></div>
    );
  }, []);

  return (
    <main className="page browser">
      {icons_root}
      <header className="browser-header w-full bg flex flex-row items-center justify-start px-2 py-0">
        <div className="flex flex-row gap-3 text-gray-400 mr-5 ml-2">
          <Icon
            className="w-5 h-5 fill-current"
            name="arrow-left"
          />
          <Icon
            className="w-5 h-5 fill-current"
            name="arrow-right"
          />
        </div>
        <div className="browser-omnibox text-sm text-gray-500 px-2 py-0 grow">omnibox</div>
        <div>
          <PassLogo
            className="w-6 h-6 cursor-pointer block ml-5"
            onClick={toggle_popup}
          ></PassLogo>
        </div>
        <div className="flex flex-row gap-2 text-gray-400 mr-3 ml-5">|</div>
        <div className="flex flex-row gap-2 text-gray-400 mr-2">
          <Icon
            className="w-6 h-6 fill-current"
            name="user-circle"
          />
        </div>
      </header>
      <div
        className={cn("popup", {
          active: popupOpen,
        })}
      >
        <header className="header popup-header flex flex-nowrap reset4print border-bottom border-weak h-auto py-2 px-3">
          <span>Proton Record</span>
          <PopupHeaderRecordingIndicator flowStatus={flow_status} />
        </header>
        <div className="popup-page">
          <div className="flex gap-1 flex-col">
            {camera_access_status === "unknown" && (
              <div
                className="button-icon"
                onClick={() => {
                  addCamera();
                }}
              >
                <Icon
                  className="w-6 h-6"
                  name="meet-camera"
                />
                <span>Add camera</span>
              </div>
            )}
            {camera_access_status === "granted" && (
              <div className="audio-input-source mb-2">
                <span>Camera source</span>
                <select
                  value={selectedCameraInputDeviceId}
                  onChange={(event) => {
                    void handleCameraInputSourceChange(event.target.value);
                  }}
                  disabled={cameraInputOptions.length === 0}
                >
                  {cameraInputOptions.length === 0 && <option value="">No cameras found</option>}
                  {cameraInputOptions.map((cameraInputOption) => {
                    return (
                      <option
                        key={cameraInputOption.deviceId}
                        value={cameraInputOption.deviceId}
                      >
                        {cameraInputOption.label}
                      </option>
                    );
                  })}
                </select>
                <video
                  ref={ref_camera_preview_callback}
                  className="preview-video"
                  autoPlay
                  muted
                  playsInline
                />
              </div>
            )}

            {mic_access_status === "unknown" && (
              <div
                className="button-icon"
                onClick={() => {
                  void addMicrophone();
                }}
              >
                <Icon
                  className="w-6 h-6"
                  name="microphone"
                />
                <span>Add microphone</span>
              </div>
            )}
            {mic_access_status === "granted" && (
              <div className="audio-input-source mb-2">
                <span>Audio input source</span>
                <select
                  value={selectedAudioInputDeviceId}
                  onChange={(event) => {
                    void handleAudioInputSourceChange(event.target.value);
                  }}
                  disabled={audioInputOptions.length === 0}
                >
                  {audioInputOptions.length === 0 && <option value="">No microphones found</option>}
                  {audioInputOptions.map((audioInputOption) => {
                    return (
                      <option
                        key={audioInputOption.deviceId}
                        value={audioInputOption.deviceId}
                      >
                        {audioInputOption.label}
                      </option>
                    );
                  })}
                </select>
                <AudioVisualizer audioStream={currentAudioStream} />
              </div>
            )}

            {screen_access_status === "unknown" && (
              <div>
                <div
                  className="button-icon"
                  onClick={() => {
                    addScreen();
                  }}
                >
                  <Icon
                    className="w-6 h-6"
                    name="meet-screen-share"
                  />
                  <span>Share screen</span>
                </div>
              </div>
            )}
            {screen_access_status === "granted" && (
              <div className="screen-input-source mb-2">
                <video
                  ref={ref_screen_preview_callback}
                  className="preview-video"
                  autoPlay
                  muted
                  playsInline
                />
              </div>
            )}

            {screen_access_status === "granted" && mic_access_status === "granted" && camera_access_status === "granted" && (
              <div className="flex flex-col gap-1">
                {flow_status === "idle" && (
                  <div
                    className="button-icon"
                    onClick={() => {
                      startRecording();
                    }}
                  >
                    <Icon
                      className="w-6 h-6"
                      name="meet-record"
                    />
                    <span>Start recording</span>
                  </div>
                )}
                {flow_status === "recording" && (
                  <div
                    className="button-icon"
                    onClick={() => {
                      stopRecording();
                    }}
                  >
                    <Icon
                      className="w-6 h-6"
                      name="meet-record-stop"
                    />
                    <span>Stop recording</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {recorderErrorMessage !== "" && (
            <p
              className="error-message"
              role="alert"
            >
              {recorderErrorMessage}
            </p>
          )}
        </div>
      </div>

      <div className="video-page">
        {decrypted_video_status === "unknown" && (
          <div className="info-message">
            <p>Loading video...</p>
          </div>
        )}
        {decrypted_video_status === "absent" && (
          <div className="info-message">
            <p>No video to decrypt. Please provide a valid video ID and password in the URL.</p>
          </div>
        )}
        {decrypted_video_status === "error" && (
          <div className="error-message">
            <p>Failed to decrypt the video. Please check the password or the file integrity.</p>
          </div>
        )}
        {decrypted_video_url && decrypted_video_status === "ready" && (
          <video
            className="decrypted-video"
            src={decrypted_video_url}
            controls
          />
        )}
      </div>
      <div className="browser-mock-website-body">
        <header className="browser-mock-header">
          <div className="browser-mock-logo"></div>
          <div className="browser-mock-header-actions">
            <div className="browser-mock-chip"></div>
            <div className="browser-mock-chip"></div>
          </div>
        </header>
        <nav className="browser-mock-navigation">
          <div className="browser-mock-navigation-item"></div>
          <div className="browser-mock-navigation-item"></div>
          <div className="browser-mock-navigation-item"></div>
          <div className="browser-mock-navigation-item"></div>
        </nav>
        <article className="browser-mock-article">
          <div className="browser-mock-article-title"></div>
          <div className="browser-mock-article-line"></div>
          <div className="browser-mock-article-line"></div>
          <div className="browser-mock-article-line short"></div>
        </article>
        <article className="browser-mock-article">
          <div className="browser-mock-article-title"></div>
          <div className="browser-mock-article-line"></div>
          <div className="browser-mock-article-line"></div>
          <div className="browser-mock-article-line short"></div>
        </article>
        <article className="browser-mock-article">
          <div className="browser-mock-article-title"></div>
          <div className="browser-mock-article-line"></div>
          <div className="browser-mock-article-line"></div>
          <div className="browser-mock-article-line short"></div>
        </article>
        <article className="browser-mock-article">
          <div className="browser-mock-article-title"></div>
          <div className="browser-mock-article-line"></div>
          <div className="browser-mock-article-line"></div>
          <div className="browser-mock-article-line short"></div>
        </article>
        <article className="browser-mock-article">
          <div className="browser-mock-article-title"></div>
          <div className="browser-mock-article-line"></div>
          <div className="browser-mock-article-line"></div>
          <div className="browser-mock-article-line short"></div>
        </article>
      </div>
    </main>
  );
}

export default App;
