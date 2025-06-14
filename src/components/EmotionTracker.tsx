
import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';

interface EmotionTrackerProps {
  onEmotionChange: (emotion: string) => void;
  onReady: () => void;
  onError: (error: string) => void;
}

const EmotionTracker = ({ onEmotionChange, onReady, onError }: EmotionTrackerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
      try {
        console.log("Loading face-api models...");
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        console.log("Models loaded.");
        setIsModelsLoaded(true);
      } catch (error) {
        console.error("Failed to load models", error);
        onError("Failed to load AI models for emotion tracking.");
      }
    };
    loadModels();
  }, [onError]);

  useEffect(() => {
    if (!isModelsLoaded) return;

    const startWebcam = () => {
      console.log("Starting webcam...");
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            onReady();
            console.log("Webcam started.");
          }
        })
        .catch((err) => {
          console.error("Webcam error:", err);
          onError("Could not access webcam. Please grant permission and try again.");
        });
    };
    startWebcam();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [isModelsLoaded, onReady, onError]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !isModelsLoaded || !videoEl.srcObject) return;

    const detectionInterval = setInterval(async () => {
      if (videoEl.paused || videoEl.ended) return;

      const detections = await faceapi
        .detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections.length > 0) {
        const expressions = detections[0].expressions;
        const dominantExpression = Object.entries(expressions).reduce((a, b) =>
          a[1] > b[1] ? a : b
        )[0];
        onEmotionChange(dominantExpression);
      } else {
        onEmotionChange("face not detected");
      }
    }, 500);

    return () => clearInterval(detectionInterval);
  }, [isModelsLoaded, onEmotionChange]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      width="240"
      height="180"
      className="absolute bottom-24 right-4 z-20 rounded-lg shadow-lg border-2 border-purple-500"
      style={{ transform: 'scaleX(-1)' }}
    />
  );
};

export default EmotionTracker;
