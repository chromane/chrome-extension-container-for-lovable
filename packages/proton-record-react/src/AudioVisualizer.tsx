import { useEffect, useRef } from "react";

type AudioVisualizerProperties = {
  audioStream: MediaStream | null;
};

function AudioVisualizer(properties: AudioVisualizerProperties) {
  const canvasReference = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasElement = canvasReference.current;
    if (canvasElement === null) {
      return;
    }

    const renderingContext = canvasElement.getContext("2d");
    if (renderingContext === null) {
      return;
    }

    const stream = properties.audioStream;
    if (stream === null) {
      renderingContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
      return;
    }

    if (stream.getAudioTracks().length === 0) {
      renderingContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const frequencyBinCount = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(frequencyBinCount);
    const barWidth = (canvasElement.width / frequencyBinCount) * 2.4;

    let animationFrameIdentifier = 0;

    const renderFrame = () => {
      animationFrameIdentifier = window.requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);

      renderingContext.fillStyle = "#ffffff";
      renderingContext.fillRect(0, 0, canvasElement.width, canvasElement.height);

      let xPosition = 0;
      for (let index = 0; index < frequencyBinCount; index += 1) {
        const barHeight = dataArray[index] * 0.5;
        // renderingContext.fillStyle = "rgb(124, 7, 60)";
        renderingContext.fillStyle = "rgb(88, 23, 209)";
        renderingContext.fillRect(xPosition, canvasElement.height - barHeight, barWidth, barHeight);
        xPosition += barWidth + 1;
      }
    };

    renderFrame();

    return () => {
      window.cancelAnimationFrame(animationFrameIdentifier);
      source.disconnect();
      analyser.disconnect();
      void audioContext.close();
    };
  }, [properties.audioStream]);

  return (
    <canvas
      className="audio-visualizer-canvas"
      ref={canvasReference}
      height={100}
      width={500}
    />
  );
}

export default AudioVisualizer;
