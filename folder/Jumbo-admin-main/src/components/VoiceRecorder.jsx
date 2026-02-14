import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Trash2 } from "lucide-react";

const VoiceRecorder = ({ label = "Voice Note", onAudioChange,initialAudioURL }) => {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const [audioURL, setAudioURL] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
   useEffect(() => {
    if (initialAudioURL) {
      setAudioURL(initialAudioURL);  // URL from server
    }
  }, [initialAudioURL]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);

        // send blob to parent
        onAudioChange(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      alert("Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  const handleRecordClick = () => {
    isRecording ? stopRecording() : startRecording();
  };

  const clearAudio = () => {
    setAudioURL(null);
    onAudioChange(null);
  };

  return (
    <div className="form-col">
      <label className="label-lg">{label}</label>

      {/* Record Button */}
      <div
        className="select"
        onClick={handleRecordClick}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <span
          className="select-value"
          style={{
            color: audioURL ? "var(--charcoal)" : "var(--grey-120)",
            flex: 1,
          }}
        >
          {isRecording ? (
            <>
              <span
                        className="blink-dot"
                        style={{ display: "inline-block", marginRight: "8px" }}
                      ></span>
              Recording...{" "}
              <span style={{ color: "#5240D6", fontWeight: 600 }}>
                {formatTime(recordingTime)}
              </span>
            </>
          ) : (
            "Start recording"
          )}
        </span>

        {isRecording ? (
          <MicOff size={22} style={{ color: "#5240D6" }} />
        ) : (
          <Mic size={22} style={{ color: "#5240D6" }} />
        )}
      </div>

      {audioURL && (
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            width: "100%",
          }}
        >
          <audio controls src={audioURL} style={{ flex: 1 }} />
          <button
            type="button"
            onClick={clearAudio}
            style={{ background: "transparent", border: "none" }}
          >
            <Trash2 size={18} style={{ cursor: "pointer", color: "#5240D6" }} />
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
