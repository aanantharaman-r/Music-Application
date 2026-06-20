import { useRef, useState, useEffect } from "react"
import YouTube from "react-youtube"
import Lyrics from "./Lyrics"

import {
  FaPlay,
  FaPause,
  FaForward,
  FaBackward,
  FaRandom,
  FaVolumeUp,
  FaVolumeMute,
  FaHeart,
  FaRegHeart,
  FaCompress,
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
  const audioRef = useRef(null)

  const [playing, setPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const [volume, setVolume] = useState(100)
  const [muted, setMuted] = useState(false)
  const [liked, setLiked] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  // Listen to song change
  useEffect(() => {
    if (currentSong) {
      setPlaying(true)
      setProgress(0)
      
      // Stop/Play depends on provider
      if (currentSong.provider === "jiosaavn") {
        // Stop YouTube
        try { playerRef.current?.pauseVideo() } catch(e){}
        // Load and play audio
        if (audioRef.current) {
          audioRef.current.src = currentSong.file
          audioRef.current.load()
          // autoplay
          audioRef.current.play().catch(e => console.log("Saavn autoplay blocked:", e))
        }
      } else {
        // Stop Saavn
        if (audioRef.current) {
          audioRef.current.pause()
        }
      }
    }
  }, [currentSong])

  // Track progress
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentSong?.provider === "jiosaavn") {
        const time = audioRef.current?.currentTime
        if (typeof time === "number") setProgress(time)
      } else {
        const time = playerRef.current?.getCurrentTime?.()
        if (typeof time === "number") setProgress(time)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [currentSong])

  // YouTube Callbacks
  const onReady = (event) => {
    playerRef.current = event.target
    if (currentSong?.provider !== "jiosaavn") {
      setDuration(event.target.getDuration() || 0)
      event.target.setVolume(volume)
    }
  }

  const onEnd = () => {
    nextSong?.()
  }

  const opts = {
    height: "0",
    width: "0",
    playerVars: { autoplay: 1 }
  }

  // Saavn Audio Callbacks
  const onAudioLoaded = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0)
      audioRef.current.volume = volume / 100
      audioRef.current.muted = muted
    }
  }

  const togglePlay = () => {
    if (currentSong.provider === "jiosaavn") {
      if (playing) {
        audioRef.current?.pause()
        setPlaying(false)
      } else {
        audioRef.current?.play().catch(e => console.log(e))
        setPlaying(true)
      }
    } else {
      if (!playerRef.current) return
      if (playing) {
        playerRef.current.pauseVideo()
        setPlaying(false)
      } else {
        playerRef.current.playVideo()
        setPlaying(true)
      }
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
    if (currentSong?.provider === "jiosaavn") {
      if (audioRef.current) audioRef.current.volume = v / 100
    } else {
      playerRef.current?.setVolume(v)
    }
    setMuted(v === 0)
  }

  const toggleMute = () => {
    if (muted) {
      if (currentSong?.provider === "jiosaavn") {
        if (audioRef.current) audioRef.current.muted = false
      } else {
        playerRef.current?.unMute()
        playerRef.current?.setVolume(volume)
      }
      setMuted(false)
    } else {
      if (currentSong?.provider === "jiosaavn") {
        if (audioRef.current) audioRef.current.muted = true
      } else {
        playerRef.current?.mute()
      }
      setMuted(true)
    }
  }

  if (!currentSong?.file) return null

  // Calculate percentages for slider tracks
  const progressPercent = duration ? (progress / duration) * 100 : 0
  const volumePercent = muted ? 0 : volume

  return (
    <>
      {/* HTML5 Audio player for JioSaavn */}
      <audio
        ref={audioRef}
        onLoadedMetadata={onAudioLoaded}
        onEnded={onEnd}
      />

      {/* FULL SCREEN PLAYER PAGE */}
      {fullscreen && (
        <div className="fixed inset-0 z-[10000] bg-[#050505]/98 backdrop-blur-3xl flex flex-col p-6 md:p-12 overflow-y-auto transition-all duration-500 animate-in fade-in slide-in-from-bottom-12">
          
          {/* Background Blurred Album Art Aura */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-20">
            <img src={currentSong.image} alt="" className="w-full h-full object-cover blur-[100px] scale-125" />
          </div>

          {/* HEADER */}
          <div className="flex items-center justify-between w-full border-b border-zinc-900 pb-6 mb-8 z-10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-950/20 border border-red-900/30 text-red-500">
                <FaMusic className="text-sm" />
              </div>
              <span className="text-xs uppercase tracking-widest font-extrabold text-zinc-400">Now Playing</span>
            </div>
            
            <button
              onClick={() => setFullscreen(false)}
              className="p-3.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg"
            >
              <FaCompress className="text-sm" />
            </button>
          </div>

          {/* BODY: SPLIT VIEW FOR HUGE ALBUM ART & LYRICS */}
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 z-10 max-w-6xl mx-auto w-full mb-8">
            
            {/* LEFT COLUMN: HUGE ALBUM ART CARD & TITLES */}
            <div className="w-full lg:w-[45%] flex flex-col items-center">
              
              {/* Music Card Frame */}
              <div className="relative aspect-square w-72 md:w-96 rounded-3xl overflow-hidden border border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] glow-pulse group">
                <img 
                  src={currentSong.image} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <span className="absolute bottom-4 left-4 text-[10px] px-2.5 py-1 rounded-md bg-red-600/90 border border-red-500/30 text-white font-bold uppercase tracking-widest">
                  {currentSong.provider} Mode
                </span>
              </div>

              {/* Title & Artist */}
              <div className="text-center mt-8 w-full px-4">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight line-clamp-2 leading-tight">
                  {currentSong.title}
                </h2>
                <p className="text-red-500 font-bold text-sm md:text-base mt-2">
                  {currentSong.artist}
                </p>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full mt-8 px-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-500 min-w-[32px] text-right">
                    {formatTime(progress)}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={progress}
                    onChange={(e) => {
                      const t = Number(e.target.value)
                      if (currentSong.provider === "jiosaavn") {
                        if (audioRef.current) audioRef.current.currentTime = t
                      } else {
                        playerRef.current?.seekTo(t)
                      }
                      setProgress(t)
                    }}
                    className="w-full custom-slider"
                    style={{
                      background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${progressPercent}%, rgba(255, 255, 255, 0.1) ${progressPercent}%, rgba(255, 255, 255, 0.1) 100%)`
                    }}
                  />
                  <span className="text-xs font-bold text-zinc-500 min-w-[32px]">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* PLAYBACK CONTROL BUTTONS */}
              <div className="flex items-center justify-center gap-8 mt-8 w-full">
                <button 
                  onClick={() => setLiked(!liked)} 
                  className={`p-3 rounded-full border transition-all duration-300 ${
                    liked 
                      ? "bg-red-500/10 border-red-500/20 text-red-500 scale-110 shadow-lg shadow-red-950/20" 
                      : "bg-zinc-900/60 border-zinc-800/60 text-zinc-500 hover:text-white"
                  }`}
                >
                  {liked ? <FaHeart className="text-base" /> : <FaRegHeart className="text-base" />}
                </button>

                <button 
                  onClick={prevSong} 
                  className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-red-500 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  <FaBackward className="text-base" />
                </button>

                {/* PLAY / PAUSE */}
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-950/50 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  {playing ? <FaPause className="text-lg" /> : <FaPlay className="text-lg ml-1" />}
                </button>

                <button 
                  onClick={nextSong} 
                  className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-red-500 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  <FaForward className="text-base" />
                </button>

                <button 
                  onClick={shuffleSongs} 
                  className="p-3 rounded-full bg-zinc-900/60 border border-zinc-800/60 text-zinc-500 hover:text-red-500 hover:scale-110 active:scale-95 transition-all duration-300"
                >
                  <FaRandom className="text-sm" />
                </button>
              </div>

              {/* VOLUME & SPEAKER CONTROLS */}
              <div className="flex items-center justify-center gap-3 w-64 mt-8 px-4">
                <button 
                  onClick={toggleMute}
                  className="text-zinc-400 hover:text-red-500 transition-colors"
                >
                  {muted ? <FaVolumeMute className="text-red-500 text-base" /> : <FaVolumeUp className="text-zinc-400 text-base" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => changeVolume(Number(e.target.value))}
                  className="w-full custom-slider"
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${volumePercent}%, rgba(255, 255, 255, 0.1) ${volumePercent}%, rgba(255, 255, 255, 0.1) 100%)`
                  }}
                />
              </div>

            </div>

            {/* RIGHT COLUMN: DETAILED LYRICS */}
            <div className="w-full lg:w-[55%] h-full flex flex-col justify-center">
              <Lyrics currentSong={currentSong} />
            </div>

          </div>

        </div>
      )}

      {/* FLOATING PLAYER BAR */}
      <div className="fixed bottom-6 left-6 right-6 md:left-[286px] md:right-8 z-50 bg-zinc-950/85 border border-zinc-800/80 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-2xl shadow-black/60 transition-all duration-300">

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">

          {/* LEFT: SONG DETAILS */}
          <div className="flex items-center gap-4 w-full md:w-[30%] min-w-0">

            <img
              src={currentSong.image}
              alt=""
              onClick={() => setFullscreen(true)}
              className="w-14 h-14 rounded-xl border border-zinc-800/80 object-cover flex-shrink-0 shadow-lg shadow-black/40 cursor-pointer hover:opacity-85 hover:scale-102 transition-all duration-300"
            />

            <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setFullscreen(true)}>

              <h2 className="font-extrabold text-white text-sm truncate leading-snug hover:text-red-400 transition-colors">
                {currentSong.title}
              </h2>

              <p className="text-red-500 text-xs truncate mt-0.5 font-semibold flex items-center gap-1.5">
                {currentSong.artist}
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950/60 border border-red-900/40 text-red-400 font-bold uppercase tracking-wider scale-90">
                  {currentSong.provider}
                </span>
              </p>

            </div>

            <button 
              onClick={() => setLiked(!liked)} 
              className="p-2 rounded-full hover:bg-zinc-900 transition-colors"
            >
              {liked ? (
                <FaHeart className="text-red-500 scale-110 transition-all" />
              ) : (
                <FaRegHeart className="text-zinc-500 hover:text-zinc-300 transition-colors" />
              )}
            </button>

          </div>

          {/* CENTER: PLAYBACK CONTROLS */}
          <div className="w-full md:w-[40%] flex flex-col items-center">

            {currentSong.provider !== "jiosaavn" && (
              <YouTube
                videoId={currentSong.file}
                opts={opts}
                onReady={onReady}
                onEnd={onEnd}
              />
            )}

            {/* CONTROLS */}
            <div className="flex items-center gap-6">

              <button 
                onClick={prevSong} 
                className="text-zinc-400 hover:text-red-500 p-2 transition-colors duration-200"
              >
                <FaBackward className="text-sm" />
              </button>

              {/* PLAY / PAUSE BUTTON */}
              <button
                onClick={togglePlay}
                className="w-11 h-11 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-500 text-white transition-all duration-300 shadow-lg shadow-red-950/40 hover:scale-105 active:scale-95"
              >
                {playing ? <FaPause className="text-xs" /> : <FaPlay className="text-xs ml-0.5" />}
              </button>

              <button 
                onClick={nextSong} 
                className="text-zinc-400 hover:text-red-500 p-2 transition-colors duration-200"
              >
                <FaForward className="text-sm" />
              </button>

              <button 
                onClick={shuffleSongs} 
                className="text-zinc-500 hover:text-red-500 p-2 transition-colors duration-200"
              >
                <FaRandom className="text-xs" />
              </button>

            </div>

            {/* PROGRESS BAR */}
            <div className="flex items-center gap-3 w-full mt-2">

              <span className="text-[10px] font-bold text-zinc-500 min-w-[28px] text-right">
                {formatTime(progress)}
              </span>

              <input
                type="range"
                min="0"
                max={duration || 100}
                value={progress}
                onChange={(e) => {
                  const t = Number(e.target.value)
                  if (currentSong.provider === "jiosaavn") {
                    if (audioRef.current) audioRef.current.currentTime = t
                  } else {
                    playerRef.current?.seekTo(t)
                  }
                  setProgress(t)
                }}
                className="w-full custom-slider"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${progressPercent}%, rgba(255, 255, 255, 0.1) ${progressPercent}%, rgba(255, 255, 255, 0.1) 100%)`
                }}
              />

              <span className="text-[10px] font-bold text-zinc-500 min-w-[28px]">
                {formatTime(duration)}
              </span>

            </div>

          </div>

          {/* RIGHT: AUDIO & EXTRA OPTIONS */}
          <div className="w-full md:w-[30%] flex justify-center md:justify-end items-center gap-4">

            <button 
              onClick={toggleMute}
              className="text-zinc-400 hover:text-red-500 p-2 transition-colors"
            >
              {muted ? (
                <FaVolumeMute className="text-red-500" />
              ) : (
                <FaVolumeUp className="text-zinc-400" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              className="w-20 md:w-24 custom-slider"
              style={{
                background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${volumePercent}%, rgba(255, 255, 255, 0.1) ${volumePercent}%, rgba(255, 255, 255, 0.1) 100%)`
              }}
            />

            <button onClick={() => setFullscreen(true)}>
              <FaExpand className="text-red-400" />
            </button>

            <div className="p-2 rounded-lg bg-red-950/20 border border-red-900/30 text-red-500 ml-1">
              <FaMusic className="text-xs" />
            </div>

          </div>

        </div>
      </div>
    </>
  )
}

export default Player