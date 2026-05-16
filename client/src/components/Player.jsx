import { useRef, useState, useEffect } from "react"
import YouTube from "react-youtube"

import {
  FaPlay,
  FaPause,
  FaForward,
  FaBackward,
  FaRandom,
  FaVolumeUp,
  FaVolumeMute,
  FaHeart,
  FaExpand,
  FaMusic
} from "react-icons/fa"

function Player({
  currentSong,
  nextSong,
  prevSong,
  shuffleSongs = () => {}
}) {

  const playerRef = useRef(null)

  const [playing, setPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const [volume, setVolume] = useState(100)
  const [muted, setMuted] = useState(false)
  const [liked, setLiked] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    if (currentSong) {
      setPlaying(true)
      setProgress(0)
    }
  }, [currentSong])

  useEffect(() => {
    if (!playerRef.current) return

    const interval = setInterval(() => {
      const time = playerRef.current?.getCurrentTime?.()
      if (typeof time === "number") setProgress(time)
    }, 1000)

    return () => clearInterval(interval)
  }, [currentSong])

  const onEnd = () => {
    nextSong?.()
  }

  const opts = {
    height: "0",
    width: "0",
    playerVars: { autoplay: 1 }
  }

  const onReady = (event) => {
    playerRef.current = event.target
    setDuration(event.target.getDuration() || 0)
    event.target.setVolume(volume)
  }

  const togglePlay = () => {
    if (!playerRef.current) return

    if (playing) {
      playerRef.current.pauseVideo()
      setPlaying(false)
    } else {
      playerRef.current.playVideo()
      setPlaying(true)
    }
  }

  const formatTime = (t) => {
    if (!t) return "0:00"
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  const changeVolume = (v) => {
    setVolume(v)
    playerRef.current?.setVolume(v)
    setMuted(v === 0)
  }

  const toggleMute = () => {
    if (!playerRef.current) return

    if (muted) {
      playerRef.current.unMute()
      playerRef.current.setVolume(volume)
      setMuted(false)
    } else {
      playerRef.current.mute()
      setMuted(true)
    }
  }

  if (!currentSong?.file) return null

  return (
    <>
      {/* PLAYER BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-black/95 border-t border-red-900/40 backdrop-blur-xl px-6 py-4">

        <div className="flex items-center justify-between">

          {/* LEFT (FIXED - NO OVERFLOW) */}
          <div className="flex items-center gap-4 w-[30%] min-w-0">

            <img
              src={currentSong.image}
              className="w-14 h-14 rounded-xl border border-red-900/50 flex-shrink-0"
            />

            <div className="min-w-0">

              <h2 className="font-bold text-white text-sm truncate max-w-[180px]">
                {currentSong.title}
              </h2>

              <p className="text-red-400 text-xs truncate max-w-[180px]">
                {currentSong.artist}
              </p>

            </div>

          </div>

          {/* CENTER */}
          <div className="w-[40%] flex flex-col items-center">

            <YouTube
              videoId={currentSong.file}
              opts={opts}
              onReady={onReady}
              onEnd={onEnd}
            />

            {/* CONTROLS */}
            <div className="flex items-center gap-5 mt-2">

              <button onClick={prevSong} className="text-red-400 hover:text-red-500">
                <FaBackward />
              </button>

              {/* PLAY / PAUSE BUTTON */}
              <button
                onClick={togglePlay}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
                  ${playing
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                  }
                `}
              >
                {playing ? <FaPause /> : <FaPlay />}
              </button>

              <button onClick={nextSong} className="text-red-400 hover:text-red-500">
                <FaForward />
              </button>

              <button onClick={shuffleSongs} className="text-red-400 hover:text-red-500">
                <FaRandom />
              </button>

            </div>

            {/* PROGRESS */}
            <div className="flex items-center gap-2 w-full mt-2">

              <span className="text-xs text-red-400">
                {formatTime(progress)}
              </span>

              <input
                type="range"
                min="0"
                max={duration}
                value={progress}
                onChange={(e) => {
                  const t = Number(e.target.value)
                  playerRef.current?.seekTo(t)
                  setProgress(t)
                }}
                className="w-full accent-red-600"
              />

              <span className="text-xs text-red-400">
                {formatTime(duration)}
              </span>

            </div>

          </div>

          {/* RIGHT */}
          <div className="w-[30%] flex justify-end items-center gap-4">

            <button onClick={() => setLiked(!liked)}>
              <FaHeart className={liked ? "text-red-600" : "text-zinc-500"} />
            </button>

            <button onClick={toggleMute}>
              {muted ? (
                <FaVolumeMute className="text-red-400" />
              ) : (
                <FaVolumeUp className="text-red-400" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              className="w-24 accent-red-600"
            />

            <button onClick={() => setFullscreen(true)}>
              <FaExpand className="text-red-400" />
            </button>

            <FaMusic className="text-red-500" />

          </div>

        </div>
      </div>
    </>
  )
}

export default Player