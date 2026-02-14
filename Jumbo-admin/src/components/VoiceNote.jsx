import { useState, useRef, useEffect } from "react";
import PlayIcon from "../assets/sopDetails/PlayIcon.svg?react";
import PauseIcon from "../assets/homeScreen/PauseIcon.svg?react";

export default function VoiceNotePlayer({ src }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const setAudioDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setAudioDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setAudioDuration);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const seekTime = (e.target.value / 100) * duration;
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "4px",
        width: "100%",
        alignItems  :"center"
      }}
    >
      <button
          onClick={togglePlay}
          style={{
            cursor: "pointer",
            border: "none",
            background: "transparent",
            padding: 0,
            outline: "none",
          }}
        >
         {isPlaying ?<PauseIcon style={{height:"22.5",width:"22.5"}}/>:<PlayIcon style={{height:"22.5",width:"22.5"}}/>}
        </button>
      <div style={{ display: "flex", flexDirection:"column" ,width:"100%"}}>
        <input
        type="range"
        min={0}
        max={100}
        value={duration ? (currentTime / duration) * 100 : 0}
        onChange={handleSeek}
        style={{
          width: "100%",
          height: "6px",
          borderRadius: "3px",
          appearance: "none", // remove default style
          background: `linear-gradient(to right, #3D3D3D ${
            duration ? (currentTime / duration) * 100 : 0
          }%, #F0F0F0 ${duration ? (currentTime / duration) * 100 : 0}%)`,
          outline: "none",
          cursor: "pointer",
        }}
      />
        {/* Time Labels Row */}
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        fontSize: "12px",
        marginTop: "4px",
      }}
    >
      {/* Current Time (Left) */}
      <span style={{fontSize :"12px",fontWeight:"500",color:"#0F0F0F"}}>{formatTime(currentTime)}</span>

      {/* Remaining Time (Right) */}
      <span style={{fontSize :"12px",fontWeight:"500",color:"#0F0F0F"}} >-{duration ? formatTime(duration - currentTime) : "0:00"}</span>
    </div>
  
      </div>

      
      <audio ref={audioRef} src={src} />


      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #3d3d3d;
          cursor: pointer;
          margin-top: -4px; /* center the thumb */
          border: none;
        }

        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #3d3d3d;
          border: none;
          cursor: pointer;
        }

        input[type="range"]::-moz-range-progress {
          background: #3d3d3d;
          height: 6px;
          border-radius: 3px;
        }

        input[type="range"]::-moz-range-track {
          background: #f0f0f0;
          height: 6px;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}
