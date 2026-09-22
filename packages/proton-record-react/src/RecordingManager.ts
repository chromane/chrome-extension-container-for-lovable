import { encryptBlob, decryptBlob } from "./crypto";
import type { RecorderStatus } from "./features/recorder/recorderSlice";
import fix_web_duration from "./fix_web_duration";
import { blob_to_base64, get_id } from "./helpers";

type RecordingDownloadResult = {
  downloadUrl: string;
  mimeType: string;
};

type RecordingManagerCallbacks = {
  onClearError: () => void;
  onStatusChanged: (status: RecorderStatus) => void;
  onElapsedSecondsChanged: (elapsedSeconds: number) => void;
  onDownloadResultChanged: (result: RecordingDownloadResult) => void;
  onErrorMessage: (message: string) => void;
  onResetState: () => void;
  //
  onRecordingStarted: () => void;
  onRecordingStopped: () => void;
  onRecordingUploaded: () => void;
  onRecordingDurationChanged: (duration: number) => void;
};

export class RecordingManager {
  private readonly callbacks: RecordingManagerCallbacks;

  private mediaRecorder: MediaRecorder | null;

  private displayStream: MediaStream | null;

  private recordedChunks: BlobPart[];

  private elapsedTimerIdentifier: number | null;

  private livePreviewElement: HTMLVideoElement | null;

  private recordedPreviewElement: HTMLVideoElement | null;

  private shouldIgnoreStopResult: boolean;

  private currentDownloadUrl: string;

  public current_camera_stream: MediaStream | null = null;
  public current_screen_stream: MediaStream | null = null;
  public current_microphone_stream: MediaStream | null = null;

  public constructor(callbacks: RecordingManagerCallbacks) {
    this.callbacks = callbacks;
    this.mediaRecorder = null;
    this.displayStream = null;
    this.recordedChunks = [];
    this.elapsedTimerIdentifier = null;
    this.livePreviewElement = null;
    this.recordedPreviewElement = null;
    this.shouldIgnoreStopResult = false;
    this.currentDownloadUrl = "";
  }

  public setLivePreviewElement(element: HTMLVideoElement | null) {
    this.livePreviewElement = element;
  }

  public setRecordedPreviewElement(element: HTMLVideoElement | null) {
    this.recordedPreviewElement = element;
  }

  public formatElapsedTime(elapsedSeconds: number) {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const paddedMinutes = String(minutes).padStart(2, "0");
    const paddedSeconds = String(seconds).padStart(2, "0");
    return `${paddedMinutes}:${paddedSeconds}`;
  }

  public async startRecordingOld() {
    const includeSystemAudio = false;
    this.callbacks.onClearError();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      this.callbacks.onErrorMessage("Screen capture is not supported in this browser.");
      return;
    }

    if (this.mediaRecorder !== null && this.mediaRecorder.state === "recording") {
      return;
    }

    if (this.currentDownloadUrl !== "") {
      URL.revokeObjectURL(this.currentDownloadUrl);
      this.currentDownloadUrl = "";
      this.callbacks.onDownloadResultChanged({ downloadUrl: "", mimeType: "" });
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: 30,
        },
        audio: includeSystemAudio,
      });

      this.displayStream = displayStream;

      if (this.livePreviewElement !== null) {
        this.livePreviewElement.srcObject = displayStream;
        await this.livePreviewElement.play();
      }

      const supportedMimeType = this.selectSupportedMimeType();
      const mediaRecorderOptions: MediaRecorderOptions = {};
      if (supportedMimeType !== "") {
        mediaRecorderOptions.mimeType = supportedMimeType;
      }

      const mediaRecorder = new MediaRecorder(displayStream, mediaRecorderOptions);
      this.mediaRecorder = mediaRecorder;
      this.recordedChunks = [];
      this.shouldIgnoreStopResult = false;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onerror = () => {
        this.callbacks.onErrorMessage("Recording failed because of a MediaRecorder error.");
      };

      mediaRecorder.onstop = () => {
        this.handleRecordingStop(supportedMimeType);
      };

      for (const track of displayStream.getVideoTracks()) {
        track.addEventListener("ended", () => {
          if (this.mediaRecorder !== null && this.mediaRecorder.state === "recording") {
            this.mediaRecorder.stop();
            return;
          }

          this.stopElapsedTimer();
          this.stopDisplayStreamTracks();
          this.callbacks.onStatusChanged("idle");
        });
      }

      this.callbacks.onElapsedSecondsChanged(0);
      this.callbacks.onStatusChanged("recording");
      mediaRecorder.start(1000);
      this.startElapsedTimer();
    } catch (error) {
      this.stopElapsedTimer();
      this.stopDisplayStreamTracks();

      if (error instanceof Error) {
        this.callbacks.onErrorMessage(error.message);
        return;
      }

      this.callbacks.onErrorMessage("Unable to start screen capture.");
    }
  }

  public async startRecording() {
    const includeSystemAudio = false;
    this.callbacks.onClearError();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      this.callbacks.onErrorMessage("Screen capture is not supported in this browser.");
      return;
    }

    if (this.mediaRecorder !== null && this.mediaRecorder.state === "recording") {
      return;
    }

    if (this.currentDownloadUrl !== "") {
      URL.revokeObjectURL(this.currentDownloadUrl);
      this.currentDownloadUrl = "";
      this.callbacks.onDownloadResultChanged({ downloadUrl: "", mimeType: "" });
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: 30,
        },
        audio: includeSystemAudio,
      });

      this.displayStream = displayStream;

      if (this.livePreviewElement !== null) {
        this.livePreviewElement.srcObject = displayStream;
        await this.livePreviewElement.play();
      }

      const supportedMimeType = this.selectSupportedMimeType();
      const mediaRecorderOptions: MediaRecorderOptions = {};
      if (supportedMimeType !== "") {
        mediaRecorderOptions.mimeType = supportedMimeType;
      }

      const mediaRecorder = new MediaRecorder(displayStream, mediaRecorderOptions);
      this.mediaRecorder = mediaRecorder;
      this.recordedChunks = [];
      this.shouldIgnoreStopResult = false;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onerror = () => {
        this.callbacks.onErrorMessage("Recording failed because of a MediaRecorder error.");
      };

      mediaRecorder.onstop = () => {
        this.handleRecordingStop(supportedMimeType);
      };

      for (const track of displayStream.getVideoTracks()) {
        track.addEventListener("ended", () => {
          if (this.mediaRecorder !== null && this.mediaRecorder.state === "recording") {
            this.mediaRecorder.stop();
            return;
          }

          this.stopElapsedTimer();
          this.stopDisplayStreamTracks();
          this.callbacks.onStatusChanged("idle");
        });
      }

      this.callbacks.onElapsedSecondsChanged(0);
      this.callbacks.onStatusChanged("recording");
      mediaRecorder.start(1000);
      this.startElapsedTimer();
    } catch (error) {
      this.stopElapsedTimer();
      this.stopDisplayStreamTracks();

      if (error instanceof Error) {
        this.callbacks.onErrorMessage(error.message);
        return;
      }

      this.callbacks.onErrorMessage("Unable to start screen capture.");
    }
  }

  private recording_chunks: BlobPart[] = [];
  private media_recorder_screen: MediaRecorder | null = null;

  public async start_recording() {
    try {
      // const d = new Date();
      // const year = d.getFullYear();
      // const month = d.getMonth() + 1;
      // const date = d.getDate();
      // const hours = d.getHours();
      // const minutes = d.getMinutes();
      //
      // const ds = `${year}-${month}-${date}-${hours}-${minutes}`;
      //

      const mimeType = "video/webm;codecs=h264";
      //

      if (this.current_screen_stream === null || this.current_microphone_stream === null) {
        throw new Error("Screen stream or microphone stream is null. Cannot start recording.");
      }
      const screen_track = this.current_screen_stream.getVideoTracks()[0];
      const audio_track = this.current_microphone_stream.getAudioTracks()[0];
      const media_stream_screen = new MediaStream([screen_track, audio_track]);

      this.media_recorder_screen = new MediaRecorder(media_stream_screen, {
        mimeType,
        videoBitsPerSecond: 16_000_000,
        audioBitsPerSecond: 200_000,
      } as any);
      //
      //
      let last_timecode = 0;
      let recording_start = Date.now();
      //!To prevent firing the on_stop_handler multiple times
      this.callbacks.onRecordingDurationChanged(0);
      this.callbacks.onRecordingStarted();
      //
      setInterval(() => {
        let duration = Date.now() - recording_start;
        this.callbacks.onRecordingDurationChanged(duration);
      }, 250);
      //
      let is_handler_on_inactive_data_triggered = false;

      this.media_recorder_screen.onstart = async function (e: any) {
        // recording_start = e.timeStamp;
      };
      this.media_recorder_screen.ondataavailable = async (e: any) => {
        console.log("ondataavailable", e);
        try {
          if (is_handler_on_inactive_data_triggered) return;
          if (e.data.size > 0) {
            console.log("e.target.state", e.target.state);
            const e_target_state = e.target.state;
            // console.log("e.timecode", e.timecode);
            // console.log("e.timecode diff", e.timecode - last_timecode);
            last_timecode = e.timecode;
            this.recording_chunks.push(e.data);
            // append a fake cue when this is the last data chunk
            if (e_target_state === "inactive") {
              is_handler_on_inactive_data_triggered = true;
              // let promise = this.upload_chunk(video_id, Date.now(), e.data, true, true, recording_access_token);
              // chunk_upload_promises.push(promise);
              onstop_handler();
            } else {
              // let promise = this.upload_chunk(video_id, Date.now(), e.data, false, false, recording_access_token);
              // chunk_upload_promises.push(promise);
            }
          } else {
            console.log(e);
          }
        } catch (err) {
          console.log(err, "DATA AVAILABLE ERR");
        }
      };
      const _this = this;
      async function onstop_handler() {
        //
        _this.callbacks.onRecordingStopped();
        //
        console.log("onstop_handler");
        const recordingBlob = new Blob(_this.recording_chunks, { type: mimeType });
        const downloadUrl = URL.createObjectURL(recordingBlob);
        console.log("downloadUrl", downloadUrl);
        //
        console.log("recording_start", recording_start);
        let duration = Date.now() - recording_start;
        let duration_seconds = Math.floor(duration / 1000);
        console.log("duration", duration);

        fix_web_duration(recordingBlob, duration_seconds, async (fixedBlob) => {
          //
          let video_id = get_id();
          let video_password = get_id();
          let video_url = `http://localhost:5173/${video_id}#${video_password}`;
          //
          const fixedDownloadUrl = URL.createObjectURL(fixedBlob);
          console.log("fixedDownloadUrl", fixedDownloadUrl);
          console.log("fixedBlob", fixedBlob);
          let encrypted_blob = await encryptBlob(fixedBlob, video_password);
          console.log("encrypted_blob", encrypted_blob);
          let encryptedDownloadUrl = URL.createObjectURL(encrypted_blob);
          console.log("encryptedDownloadUrl", encryptedDownloadUrl);
          //
          let blob_as_base64 = await blob_to_base64(encrypted_blob);
          let result = await fetch(`http://localhost:8080/back/proton-record-demo/video/${video_id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              videoData: blob_as_base64,
              videoId: video_id,
            }),
          });
          console.log("result", result);
          //
          _this.callbacks.onRecordingUploaded();
          window.open(video_url, "_blank");
          location.reload();
          //
          // let decrypted_blob = await decryptBlob(encrypted_blob, video_password, "video/webm");
          // let decryptedDownloadUrl = URL.createObjectURL(decrypted_blob);
          // console.log("decryptedDownloadUrl", decryptedDownloadUrl);
        });

        // this.currentDownloadUrl = downloadUrl;
        // this.callbacks.onDownloadResultChanged({
        //   downloadUrl,
        //   mimeType: recordingBlob.type,
        // });
        // this.callbacks.onStatusChanged("stopped");

        //
        // console.log(`https://bloomrecord.com/cdn/rec/mp4/${video_id}.mp4`);
        // console.log(`https://bloomrecord.com/${video_id}`);
        //
        // console.log("RECORDING STOPPED", store_off.save_after_stopping);
        // if (store_off.save_after_stopping === true) {
        //   try {
        //     store_off.is_uploading_saved_video = true;
        //     // !ATTENTION
        //     _this.manager.proxy_runtime.ui_block_op_manage("inc");

        //     // wait for all chunks to finish loading
        //     if (_this.context === "offscreen") {
        //       if (config.mode === "dev") {
        //         await _this.manager.proxy_runtime.exec_tabs_create({ active: true, url: `http://localhost:3000/${video_id}` });
        //       } else {
        //         await _this.manager.proxy_runtime.exec_tabs_create({ active: true, url: `https://bloomrecord.com/${video_id}` });
        //       }
        //     }
        //     //
        //     ctrl.blocking_inc();
        //     await Promise.all(chunk_upload_promises);
        //     ctrl.blocking_dec();
        //     if (_this.context === "website") {
        //       if (config.mode === "dev") {
        //         location.href = `http://localhost:3000/${video_id}`;
        //       } else {
        //         location.href = `https://bloomrecord.com/${video_id}`;
        //       }
        //     }

        //     console.log("PROMISE FINISHED");

        //     // !ATTENTION
        //     store_off.final_src = `https://bloomrecord.com/cdn/rec/mp4/${video_id}.mp4`;
        //     store_off.bloomrecord_page_url = `https://bloomrecord.com/${video_id}`;
        //     _this.manager.proxy_runtime.set_vr_store({ final_src: store_off.final_src, bloomrecord_page_url: store_off.bloomrecord_page_url });
        //     //
        //     // !ATTENTION
        //     _this.manager.proxy_runtime.ui_block_op_manage("dec");
        //   } catch (e) {
        //     console.log(e);
        //   } finally {
        //     store_off.is_uploading_saved_video = false;
        //   }
        // } else {
        // }
      }

      // This argument specifies how often we should be sending chunks
      this.media_recorder_screen.start(2000);

      // this.stop_recording_interval();
      // this.start_recording_interval();

      // store_off.media_recorder_screen = media_recorder_screen;
      // this.manager.proxy_runtime.bg_set_action_icon({ path: "/img/logo-recording-128.png" });
      //

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  public stop_recording() {
    this.media_recorder_screen?.stop();
  }

  public async add_camera(selectedCameraInputDeviceId: string = "") {
    try {
      const videoConstraints: MediaTrackConstraints = {};

      if (selectedCameraInputDeviceId !== "") {
        videoConstraints.deviceId = {
          exact: selectedCameraInputDeviceId,
        };
      }

      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
      });

      this.current_camera_stream = cameraStream;

      // if (this.livePreviewElement !== null) {
      //   this.livePreviewElement.srcObject = cameraStream;
      //   await this.livePreviewElement.play();
      // }
      return cameraStream;
    } catch (error) {
      if (error instanceof Error) {
        this.callbacks.onErrorMessage(error.message);
        return null;
      }

      this.callbacks.onErrorMessage("Unable to access camera.");
      return null;
    }
  }

  public async add_microphone(selectedAudioInputDeviceId: string = "") {
    try {
      const audioConstraints: MediaTrackConstraints = {};

      if (selectedAudioInputDeviceId !== "") {
        audioConstraints.deviceId = {
          exact: selectedAudioInputDeviceId,
        };
      }

      const microphoneStream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
      });

      if (this.livePreviewElement !== null) {
        this.livePreviewElement.srcObject = microphoneStream;
        await this.livePreviewElement.play();
      }
      this.current_microphone_stream = microphoneStream;
      return microphoneStream;
    } catch (error) {
      if (error instanceof Error) {
        this.callbacks.onErrorMessage(error.message);
        return null;
      }

      this.callbacks.onErrorMessage("Unable to access microphone.");
      return null;
    }
  }

  public async add_screen() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor",
          width: 1920,
          height: 1080,
        },
      });

      this.current_screen_stream = screenStream;
      return screenStream;
    } catch (error) {
      if (error instanceof Error) {
        this.callbacks.onErrorMessage(error.message);
        return null;
      }

      this.callbacks.onErrorMessage("Unable to access screen.");
    }
    return null;
  }

  public stopRecording() {
    if (this.mediaRecorder === null) {
      this.stopElapsedTimer();
      this.stopDisplayStreamTracks();
      return;
    }

    if (this.mediaRecorder.state === "recording") {
      this.mediaRecorder.stop();
      return;
    }

    this.stopElapsedTimer();
    this.stopDisplayStreamTracks();
  }

  public resetRecording() {
    if (this.mediaRecorder !== null && this.mediaRecorder.state === "recording") {
      this.shouldIgnoreStopResult = true;
    }

    this.stopRecording();

    if (this.currentDownloadUrl !== "") {
      URL.revokeObjectURL(this.currentDownloadUrl);
      this.currentDownloadUrl = "";
    }

    if (this.recordedPreviewElement !== null) {
      this.recordedPreviewElement.src = "";
      this.recordedPreviewElement.load();
    }

    this.recordedChunks = [];
    this.callbacks.onResetState();
  }

  public dispose() {
    this.stopElapsedTimer();
    this.stopDisplayStreamTracks();
    if (this.currentDownloadUrl !== "") {
      URL.revokeObjectURL(this.currentDownloadUrl);
      this.currentDownloadUrl = "";
    }
  }

  private handleRecordingStop(supportedMimeType: string) {
    this.stopElapsedTimer();
    this.stopDisplayStreamTracks();

    if (this.shouldIgnoreStopResult) {
      this.shouldIgnoreStopResult = false;
      return;
    }

    if (this.recordedChunks.length === 0) {
      this.callbacks.onErrorMessage("No video data was captured.");
      return;
    }

    let blobType = "video/webm";
    if (supportedMimeType !== "") {
      blobType = supportedMimeType;
    }

    const recordingBlob = new Blob(this.recordedChunks, {
      type: blobType,
    });

    const downloadUrl = URL.createObjectURL(recordingBlob);
    this.currentDownloadUrl = downloadUrl;
    this.callbacks.onDownloadResultChanged({
      downloadUrl,
      mimeType: recordingBlob.type,
    });
    this.callbacks.onStatusChanged("stopped");

    if (this.recordedPreviewElement !== null) {
      this.recordedPreviewElement.src = downloadUrl;
      this.recordedPreviewElement.load();
    }
  }

  private handle_recording_stop(supportedMimeType: string) {
    this.stopElapsedTimer();
    this.stopDisplayStreamTracks();

    if (this.shouldIgnoreStopResult) {
      this.shouldIgnoreStopResult = false;
      return;
    }

    if (this.recordedChunks.length === 0) {
      this.callbacks.onErrorMessage("No video data was captured.");
      return;
    }

    let blobType = "video/webm";
    if (supportedMimeType !== "") {
      blobType = supportedMimeType;
    }

    const recordingBlob = new Blob(this.recordedChunks, {
      type: blobType,
    });

    const downloadUrl = URL.createObjectURL(recordingBlob);
    this.currentDownloadUrl = downloadUrl;
    this.callbacks.onDownloadResultChanged({
      downloadUrl,
      mimeType: recordingBlob.type,
    });
    this.callbacks.onStatusChanged("stopped");

    if (this.recordedPreviewElement !== null) {
      this.recordedPreviewElement.src = downloadUrl;
      this.recordedPreviewElement.load();
    }
  }

  private stopElapsedTimer() {
    if (this.elapsedTimerIdentifier !== null) {
      window.clearInterval(this.elapsedTimerIdentifier);
      this.elapsedTimerIdentifier = null;
    }
  }

  private stopDisplayStreamTracks() {
    if (this.displayStream === null) {
      return;
    }

    for (const track of this.displayStream.getTracks()) {
      track.stop();
    }

    this.displayStream = null;

    if (this.livePreviewElement !== null) {
      this.livePreviewElement.srcObject = null;
    }
  }

  private selectSupportedMimeType() {
    const preferredMimeTypes = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm;codecs=h264,opus", "video/webm"];

    for (const preferredMimeType of preferredMimeTypes) {
      if (MediaRecorder.isTypeSupported(preferredMimeType)) {
        return preferredMimeType;
      }
    }

    return "";
  }

  private startElapsedTimer() {
    this.stopElapsedTimer();
    let elapsedSeconds = 0;
    this.elapsedTimerIdentifier = window.setInterval(() => {
      elapsedSeconds += 1;
      this.callbacks.onElapsedSecondsChanged(elapsedSeconds);
    }, 1000);
  }
}
