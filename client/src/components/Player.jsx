import { useRef, useState, useEffect } from "react"
import YouTube from "react-youtube"
import Lyrics from "./Lyrics"
import rdrBackground from "../assets/rdr2_background.png"

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
  setCurrentSong = () => {},
  nextSong,
  prevSong,
  shuffleSongs = () => {},
  favorites = [],
  setFavorites = () => {},
  playlists = [],
  addSongToPlaylist = () => {}
}) {

  const playerRef = useRef(null)
  const audioRef = useRef(null)
  const optionsRef = useRef(null)

  const [playing, setPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const [volume, setVolume] = useState(100)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const isFav = currentSong ? favorites.some(f => f.id === currentSong.id) : false

  const toggleFavorite = () => {
    if (!currentSong) return
    const exists = favorites.find(f => f.id === currentSong.id)
    if (exists) {
      setFavorites(favorites.filter(f => f.id !== currentSong.id))
    } else {
      setFavorites([...favorites, currentSong])
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
    if (repeat) {
      if (currentSong?.provider === "jiosaavn") {
        if (audioRef.current) {
          audioRef.current.currentTime = 0
          audioRef.current.play().catch(e => console.log("Saavn repeat error:", e))
        }
      } else {
        playerRef.current?.seekTo(0)
        playerRef.current?.playVideo()
      }
    } else {
      nextSong?.()
    }
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
        <div 
          className="fixed inset-0 z-[10000] flex flex-col p-6 md:p-12 overflow-y-auto transition-all duration-500 animate-in fade-in slide-in-from-bottom-12 bg-black rounded-none"
        >
          {/* Distressed RDR2 Border Frame */}
          <div className="absolute inset-4 border-2 border-zinc-800/80 pointer-events-none z-50 rounded-[2rem]">
            <div className="absolute inset-0.5 border border-[#eadaa2]/20 pointer-events-none rounded-[2rem]" />
          </div>
 
          {/* HEADER */}
          <div className="flex items-center justify-between w-full border-b-2 border-zinc-800/80 pb-6 mb-8 z-10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-red-950/40 border border-red-900/50 text-red-500">
                <FaMusic className="text-sm" />
              </div>
              <span className="text-xs uppercase tracking-[0.2em] font-black text-zinc-400">Now Playing</span>
            </div>
            
            <button
              onClick={() => setFullscreen(false)}
              className="p-3.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:border-red-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md"
            >
              <FaCompress className="text-sm" />
            </button>
          </div>
 
          {/* BODY: SPLIT VIEW FOR HUGE ALBUM ART & LYRICS */}
          <div className="flex-1 flex flex-col lg:flex-row items-stretch justify-center max-w-5xl mx-auto w-full mb-6 gap-6 z-10 overflow-y-auto lg:overflow-hidden">
            
            {/* LEFT COLUMN: HUGE ALBUM ART CARD & TITLES */}
            <div className="w-full lg:w-[48%] flex flex-col items-center justify-center p-6 lg:p-8 border border-zinc-800/60 bg-black rounded-[2rem] shadow-xl gap-4 flex-shrink-0">
              
              {/* Music Card Frame */}
              <div className="relative w-52 h-52 md:w-64 md:h-64 rounded-[1.5rem] overflow-hidden border-4 border-zinc-800 shadow-lg flex-shrink-0 group">
                <img 
                  src={currentSong.image} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <span className="absolute bottom-4 left-4 text-[9px] px-2.5 py-1 rounded-full bg-red-600 border border-red-500/30 text-white font-black uppercase tracking-widest shadow-md">
                  {currentSong.provider} Mode
                </span>
              </div>
 
              {/* Title & Artist */}
              <div className="text-center w-full px-4">
                <h2 className="text-base md:text-lg font-black text-white tracking-wider line-clamp-2 leading-tight uppercase">
                  {currentSong.title}
                </h2>
                <p className="text-red-500 font-bold text-[10px] md:text-xs mt-1.5 uppercase tracking-[0.15em]">
                  {currentSong.artist}
                </p>
              </div>
 
              {/* PROGRESS BAR */}
              <div className="w-full px-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-zinc-500 min-w-[32px] text-right font-mono">
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
                      background: `linear-gradient(to right, var(--slider-active, #ffffff) 0%, var(--slider-active, #ffffff) ${progressPercent}%, var(--slider-bg, #18181b) ${progressPercent}%, var(--slider-bg, #18181b) 100%)`
                    }}
                  />
                  <span className="text-[10px] font-bold text-zinc-500 min-w-[32px] font-mono">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>
 
              {/* PLAYBACK CONTROL BUTTONS */}
              <div className="flex items-center justify-center gap-4 w-full">
                <button 
                  onClick={toggleFavorite} 
                  className={`w-11 h-11 flex items-center justify-center rounded-full border transition-all duration-200 shadow-md active:scale-95 ${
                    isFav 
                      ? "bg-red-950/20 border-red-600 text-red-500" 
                      : "bg-zinc-950/40 border-zinc-800/80 text-zinc-400 hover:text-white"
                  }`}
                >
                  {isFav ? <FaHeart className="text-xs" /> : <FaRegHeart className="text-xs" />}
                </button>
 
                <button 
                  onClick={prevSong} 
                  className="w-11 h-11 flex items-center justify-center rounded-full bg-zinc-950/40 border border-zinc-800/80 text-zinc-400 hover:text-red-500 hover:border-red-600 transition-all duration-200 shadow-md active:scale-95"
                >
                  <FaBackward className="text-xs" />
                </button>
 
                {/* PLAY / PAUSE */}
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-500 text-white border border-[#eadaa2]/40 shadow-md hover:scale-105 active:scale-95 transition-all duration-150"
                >
                  {playing ? <FaPause className="text-sm" /> : <FaPlay className="text-sm ml-0.5" />}
                </button>
 
                <button 
                  onClick={nextSong} 
                  className="w-11 h-11 flex items-center justify-center rounded-full bg-zinc-950/40 border border-zinc-800/80 text-zinc-400 hover:text-red-500 hover:border-red-600 transition-all duration-200 shadow-md active:scale-95"
                >
                  <FaForward className="text-xs" />
                </button>
 
                <button 
                  onClick={shuffleSongs} 
                  className="w-11 h-11 flex items-center justify-center rounded-full bg-zinc-950/40 border border-zinc-800/80 text-zinc-400 hover:text-red-500 hover:border-red-600 transition-all duration-200 shadow-md active:scale-95"
                >
                  <FaRandom className="text-xs" />
                </button>
              </div>
 
            </div>
 
            {/* RIGHT COLUMN: DETAILED LYRICS */}
            <div className="w-full lg:w-[48%] flex flex-col border border-zinc-800/60 bg-black rounded-[2rem] shadow-xl overflow-hidden">
              <Lyrics currentSong={currentSong} />
            </div>
 
          </div>

        </div>
      )}

      {/* BOTTOM PLAYER BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#070708]/98 border-t border-zinc-900/80 px-4 md:px-6 py-3 flex items-center justify-between shadow-2xl transition-all duration-300">
        <div className="flex flex-row items-center justify-between w-full">

          {/* LEFT: SONG DETAILS */}
          <div className="flex items-center w-[40%] md:w-[30%] min-w-0">
            <img
              src={currentSong.image}
              alt=""
              onClick={() => setFullscreen(true)}
              className="w-14 h-14 object-cover flex-shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
            />

            <div className="min-w-0 flex-1 ml-4 cursor-pointer" onClick={() => setFullscreen(true)}>
              <h2 className="font-bold text-white text-sm truncate leading-snug hover:underline">
                {currentSong.title}
              </h2>
              <p className="text-zinc-400 text-xs truncate mt-0.5 hover:underline">
                {currentSong.artist}
              </p>
            </div>

            {/* ACTION BUTTONS: Cross & Plus Circle */}
            <div className="flex items-center gap-3.5 ml-4">
              <button 
                onClick={() => setCurrentSong(null)} 
                className="text-zinc-400 hover:text-white transition-colors p-1"
                title="Close Player"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="relative" ref={optionsRef}>
                <button 
                  onClick={() => setShowOptions(!showOptions)} 
                  className="text-zinc-400 hover:text-white transition-colors p-1"
                  title="Add to Favorite or Playlist"
                >
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                
                {showOptions && (
                  <div className="absolute bottom-full left-0 mb-2 bg-zinc-950/95 border border-zinc-800 rounded-xl p-2 w-48 shadow-2xl z-[100] backdrop-blur-md animate-in fade-in slide-in-from-bottom-1">
                    <button
                      onClick={() => {
                        toggleFavorite()
                        setShowOptions(false)
                      }}
                      className="w-full text-left text-xs font-semibold px-2 py-1.5 rounded-lg text-zinc-300 hover:bg-violet-600 hover:text-white transition-colors flex items-center gap-2"
                    >
                      {isFav ? "❤️ Remove Favorite" : "🤍 Add to Favorite"}
                    </button>
                    
                    {playlists.length > 0 && (
                      <>
                        <div className="border-t border-zinc-900 my-1"></div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold p-1.5">Add to Playlist</p>
                        <div className="max-h-32 overflow-y-auto">
                          {playlists.map(p => (
                            <button
                              key={p.id}
                              onClick={() => {
                                addSongToPlaylist?.(p.id, currentSong)
                                setShowOptions(false)
                              }}
                              className="w-full text-left text-xs font-semibold px-2 py-1.5 rounded-lg text-zinc-300 hover:bg-violet-600 hover:text-white transition-colors"
                            >
                              📁 {p.name}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CENTER: PLAYBACK CONTROLS & PROGRESS */}
          <div className="w-[50%] md:w-[40%] flex flex-col items-center">
            {currentSong.provider !== "jiosaavn" && (
              <YouTube
                videoId={currentSong.file}
                opts={opts}
                onReady={onReady}
                onEnd={onEnd}
              />
            )}

            {/* CONTROLS */}
            <div className="flex items-center gap-5">
              <button 
                onClick={shuffleSongs} 
                className="text-zinc-400 hover:text-white p-1.5 transition-colors"
                title="Shuffle"
              >
                <FaRandom className="text-xs" />
              </button>

              <button 
                onClick={prevSong} 
                className="text-zinc-400 hover:text-white p-1.5 transition-colors"
                title="Previous"
              >
                <FaBackward className="text-sm" />
              </button>

              {/* PLAY / PAUSE BUTTON */}
              <button
                onClick={togglePlay}
                className="w-8.5 h-8.5 rounded-full flex items-center justify-center bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-md"
                title={playing ? "Pause" : "Play"}
              >
                {playing ? <FaPause className="text-[10px]" /> : <FaPlay className="text-[10px] ml-0.5" />}
              </button>

              <button 
                onClick={nextSong} 
                className="text-zinc-400 hover:text-white p-1.5 transition-colors"
                title="Next"
              >
                <FaForward className="text-sm" />
              </button>

              <button 
                onClick={() => setRepeat(!repeat)} 
                className={`p-1.5 transition-colors ${repeat ? "text-violet-500 hover:text-violet-400" : "text-zinc-400 hover:text-white"}`}
                title="Repeat"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
                </svg>
              </button>
            </div>

            {/* PROGRESS BAR */}
            <div className="flex items-center gap-3.5 w-full mt-1.5">
              <span className="text-[10px] font-medium text-zinc-500 min-w-[28px] text-right font-mono select-none">
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
                  background: `linear-gradient(to right, var(--slider-active, #ffffff) 0%, var(--slider-active, #ffffff) ${progressPercent}%, var(--slider-bg, rgba(255, 255, 255, 0.1)) ${progressPercent}%, var(--slider-bg, rgba(255, 255, 255, 0.1)) 100%)`
                }}
              />
              <span className="text-[10px] font-medium text-zinc-500 min-w-[28px] font-mono select-none">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* RIGHT: AUDIO & EXTRA OPTIONS */}
          <div className="hidden md:flex w-[30%] justify-end items-center gap-3.5">
            {/* Lyrics / Microphone Icon */}
            <button 
              onClick={() => setFullscreen(true)}
              className="text-zinc-400 hover:text-white p-1 transition-colors"
              title="Lyrics"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            
            {/* Queue Icon */}
            <button 
              className="text-zinc-400 hover:text-white p-1 transition-colors"
              title="Queue"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>

            {/* Device Icon */}
            <button 
              className="text-zinc-400 hover:text-white p-1 transition-colors"
              title="Connect to a device"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Volume Icon */}
            <button 
              onClick={toggleMute}
              className="text-zinc-400 hover:text-white p-1 transition-colors"
              title={muted ? "Unmute" : "Mute"}
            >
              {muted ? (
                <svg className="w-4.5 h-4.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>

            {/* Volume Slider */}
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              className="w-20 md:w-24 custom-slider"
              style={{
                background: `linear-gradient(to right, var(--slider-active, #ffffff) 0%, var(--slider-active, #ffffff) ${volumePercent}%, var(--slider-bg, rgba(255, 255, 255, 0.1)) ${volumePercent}%, var(--slider-bg, rgba(255, 255, 255, 0.1)) 100%)`
              }}
            />

            {/* PiP Icon */}
            <button 
              className="text-zinc-400 hover:text-white p-1 transition-colors"
              title="Miniplayer"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>

            {/* Fullscreen Icon */}
            <button 
              onClick={() => setFullscreen(true)}
              className="text-zinc-400 hover:text-white p-1 transition-colors"
              title="Fullscreen"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </>
  )
}

export default Player