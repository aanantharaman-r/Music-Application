import { FaHeart, FaRegHeart, FaPlay, FaPause, FaBackward, FaForward, FaRandom, FaMusic, FaListUl } from "react-icons/fa"

function RightPanel({
  currentSong,
  playing,
  togglePlay,
  prevSong,
  nextSong,
  progress,
  duration,
  formatTime,
  setProgress,
  audioRef,
  playerRef,
  isShuffle,
  setIsShuffle,
  repeat,
  setRepeat,
  isFav,
  toggleFavorite,
  currentQueue = [],
  setCurrentSong,
  setCurrentIndex,
  setActiveSongId,
  showToast
}) {
  if (!currentSong) {
    return (
      <aside className="hidden xl:flex flex-col fixed top-0 right-0 w-[340px] h-screen bg-zinc-950/80 border-l border-zinc-900/80 backdrop-blur-xl p-6 overflow-y-auto flex-shrink-0 z-20 select-none">
        <div className="flex items-center justify-between border-b border-zinc-900/80 pb-4 mb-6">
          <h3 className="font-extrabold text-white text-sm tracking-wider uppercase flex items-center gap-2">
            <FaMusic className="text-violet-500 text-xs" /> Now Playing
          </h3>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-zinc-900/30 border border-zinc-900 rounded-2xl my-auto">
          <div className="w-16 h-16 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-4 text-violet-400">
            <FaMusic className="text-2xl animate-pulse" />
          </div>
          <h4 className="font-bold text-white text-sm">No track playing</h4>
          <p className="text-xs text-zinc-400 mt-1 max-w-[200px]">
            Select any song from Home or Search to start listening.
          </p>
        </div>
      </aside>
    )
  }

  const progressPercent = duration ? (progress / duration) * 100 : 0

  return (
    <aside className="hidden xl:flex flex-col fixed top-0 right-0 w-[340px] h-screen bg-zinc-950/90 border-l border-zinc-900/80 backdrop-blur-xl p-6 overflow-y-auto custom-scrollbar flex-shrink-0 z-20 pb-36 select-none">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-zinc-900/80 pb-4 mb-5 flex-shrink-0">
        <h3 className="font-extrabold text-white text-xs tracking-widest uppercase flex items-center gap-2">
          <FaMusic className="text-violet-400 text-xs" /> Now Playing
        </h3>
        <div className="flex items-end gap-[2px] h-3">
          <div className="w-[2px] bg-violet-500 rounded-full visualizer-bar" style={{ animationPlayState: playing ? 'running' : 'paused' }} />
          <div className="w-[2px] bg-violet-500 rounded-full visualizer-bar-fast" style={{ animationPlayState: playing ? 'running' : 'paused' }} />
          <div className="w-[2px] bg-violet-500 rounded-full visualizer-bar-slow" style={{ animationPlayState: playing ? 'running' : 'paused' }} />
        </div>
      </div>

      {/* ALBUM ARTWORK */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/80 mb-5 group flex-shrink-0 bg-zinc-900">
        <img 
          src={currentSong.image} 
          alt={currentSong.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* TITLE & ARTIST + FAVORITE HEART */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-shrink-0">
        <div className="min-w-0 flex-1">
          <h2 className="font-black text-white text-base truncate leading-snug">
            {currentSong.title}
          </h2>
          <p className="text-xs text-zinc-400 font-medium truncate mt-0.5">
            {currentSong.artist}
          </p>
        </div>
        
        <button
          onClick={toggleFavorite}
          className={`p-2.5 rounded-full border transition-all duration-200 active:scale-90 flex-shrink-0 ${
            isFav 
              ? "bg-violet-600/20 border-violet-500 text-violet-400 shadow-md shadow-violet-950/30" 
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
          }`}
          title={isFav ? "Remove Favorite" : "Add Favorite"}
        >
          {isFav ? <FaHeart className="text-sm text-violet-400" /> : <FaRegHeart className="text-sm" />}
        </button>
      </div>

      {/* PROGRESS SEEK BAR */}
      <div className="w-full mb-5 flex-shrink-0">
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
            background: `linear-gradient(to right, var(--slider-active, #ffffff) 0%, var(--slider-active, #ffffff) ${progressPercent}%, var(--slider-bg, rgba(255, 255, 255, 0.2)) ${progressPercent}%, var(--slider-bg, rgba(255, 255, 255, 0.2)) 100%)`
          }}
        />
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 font-bold mt-1.5">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* PLAYER CONTROLS */}
      <div className="flex items-center justify-between px-2 mb-6 flex-shrink-0">
        <button 
          onClick={() => {
            setIsShuffle(!isShuffle)
            showToast?.(isShuffle ? "Shuffle Off" : "Shuffle On")
          }}
          className={`p-2 transition-colors ${isShuffle ? "text-violet-400" : "text-zinc-400 hover:text-white"}`}
          title="Shuffle"
        >
          <FaRandom className="text-sm" />
        </button>

        <button 
          onClick={prevSong} 
          className="p-2 text-zinc-300 hover:text-white active:scale-90 transition-transform"
          title="Previous"
        >
          <FaBackward className="text-base" />
        </button>

        {/* PLAY / PAUSE BUTTON */}
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.5)] hover:scale-105 active:scale-95 transition-all font-bold"
          title={playing ? "Pause" : "Play"}
        >
          {playing ? <FaPause className="text-sm" /> : <FaPlay className="text-sm ml-0.5" />}
        </button>

        <button 
          onClick={nextSong} 
          className="p-2 text-zinc-300 hover:text-white active:scale-90 transition-transform"
          title="Next"
        >
          <FaForward className="text-base" />
        </button>

        <button 
          onClick={() => setRepeat(!repeat)} 
          className={`p-2 transition-colors ${repeat ? "text-violet-400" : "text-zinc-400 hover:text-white"}`}
          title="Loop"
        >
          <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
          </svg>
        </button>
      </div>

      {/* UP NEXT QUEUE SECTION */}
      <div className="border-t border-zinc-900/80 pt-5 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
            <FaListUl className="text-violet-400 text-[11px]" /> Up Next
          </h4>
          <span className="text-[10px] text-zinc-500 font-mono font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
            {currentQueue.length} songs
          </span>
        </div>

        <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 pr-1">
          {currentQueue.slice(0, 15).map((song, idx) => {
            const isPlaying = currentSong?.id === song.id
            return (
              <div
                key={`${song.id}-${idx}`}
                onClick={() => {
                  setCurrentSong(song)
                  setCurrentIndex(idx)
                  setActiveSongId(song.id)
                }}
                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer border transition-all duration-200 group ${
                  isPlaying 
                    ? "bg-violet-600/15 border-violet-500/30 text-white" 
                    : "bg-zinc-900/40 border-transparent hover:bg-zinc-900 hover:border-zinc-800 text-zinc-300"
                }`}
              >
                <img src={song.image} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h5 className={`text-xs font-bold truncate leading-snug ${isPlaying ? "text-violet-400" : "text-white group-hover:text-violet-300"}`}>
                    {song.title}
                  </h5>
                  <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                    {song.artist}
                  </p>
                </div>
                {isPlaying && (
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-ping flex-shrink-0" />
                )}
              </div>
            )
          })}

          {currentQueue.length === 0 && (
            <p className="text-[10px] text-zinc-600 italic py-4 text-center">
              No upcoming tracks in queue.
            </p>
          )}
        </div>
      </div>

    </aside>
  )
}

export default RightPanel
