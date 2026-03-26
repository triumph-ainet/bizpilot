'use client';

import { useEffect, useRef } from 'react';

export default function CameraCapture({
  onCapture,
}: {
  onCapture: (blob: Blob, dataUrl: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let mounted = true;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (!mounted) return;
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) {
        // ignore, fall back to file input
      }
    }

    start();
    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    onCapture(blob, dataUrl);
  };

  return (
    <div className="w-full h-44 bg-white rounded-2xl overflow-hidden shadow-card flex flex-col">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover flex-1"
      />
      <div className="p-2 flex justify-center bg-white/80">
        <button
          onClick={handleCapture}
          className="bg-green text-white px-4 py-2 rounded-xl font-semibold"
        >
          Capture
        </button>
      </div>
    </div>
  );
}
