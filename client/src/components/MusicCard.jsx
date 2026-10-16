import { useState } from "react"
import { FaPlay, FaHeart, FaRegHeart, FaPlus, FaTrash } from "react-icons/fa"

function MusicCard({
  song,
  setCurrentSong,
  isActive,
  isPlaying,
  onFav,
  isFav,
  playlists = [],
  addSongToPlaylist,
  onRemove,
  removeLabel = "Remove"
}) {
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <div
      onClick={() => setCurrentSong(song)}
      className={`
        relative cursor-pointer group p-2.5 sm:p-4 rounded-xl sm:rounded-2xl
        border overflow-hidden transition-all duration-300
        bg-zinc-900/40 backdrop-blur-sm
        active:scale-[0.98]
        ${isActive
          ? "border-violet-600/90 shadow-lg shadow-violet-950/40 scale-[1.01] sm:scale-[1.02]"
          : "border-zinc-800/80 hover:border-zinc-700/80 hover:bg-zinc-900/60 hover:scale-[1.01]"
        }
      `}
    >
      {/* PLAYLIST ADD DROPDOWN */}
      {!onRemove && playlists.length > 0 && (
        <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowDropdown(!showDropdown)
            }}
            className={`p-1.5 sm:p-2.5 rounded-full transition-all duration-300 backdrop-blur-md border 
              ${showDropdown 
                ? "bg-violet-500/20 border-violet-500/40 text-violet-400 shadow-md" 
                : "bg-black/50 border-zinc-700/50 text-zinc-300 hover:text-white hover:border-zinc-500"
              }`}
            title="Add to Playlist"
          >
            <FaPlus className="text-[10px] sm:text-xs" />
          </button>
          
          {showDropdown && (
            <div className="absolute top-9 sm:top-11 left-0 bg-[#09070f] border border-violet-500/30 rounded-xl p-1.5 sm:p-2 w-44 sm:w-48 shadow-2xl z-30 backdrop-blur-md animate-in fade-in slide-in-from-top-1">
              <p className="text-[9px] sm:text-[10px] text-violet-400 uppercase tracking-wider font-bold p-1 sm:p-1.5 border-b border-zinc-900 mb-1">Add to Playlist</p>
              <div className="max-h-32 overflow-y-auto">
                {playlists.map(p => (
                  <button
                    key={p.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      addSongToPlaylist?.(p.id, song)
                      setShowDropdown(false)
                    }}
                    className="w-full text-left text-[11px] sm:text-xs font-semibold px-2 py-1.5 rounded-lg text-zinc-300 hover:bg-violet-600 hover:text-white transition-colors truncate"
                  >
                    📁 {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* REMOVE FROM PLAYLIST OPTION */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-20 p-1.5 sm:p-2.5 rounded-full bg-violet-950/60 border border-violet-900/40 text-violet-400 hover:bg-violet-600 hover:text-white transition-colors duration-300"
          title={removeLabel}
        >
          <FaTrash className="text-[10px] sm:text-xs" />
        </button>
      )}

      {/* FAVORITE BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onFav?.()
        }}
        className={`absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-20 p-1.5 sm:p-2.5 rounded-full transition-all duration-300 backdrop-blur-md border 
          ${isFav 
            ? "bg-violet-500/20 border-violet-500/40 text-violet-400 shadow-md" 
            : "bg-black/50 border-zinc-700/50 text-zinc-300 hover:text-white hover:border-zinc-500"
          }`}
      >
        {isFav ? <FaHeart className="text-xs sm:text-sm scale-110 text-violet-400" /> : <FaRegHeart className="text-xs sm:text-sm" />}
      </button>

      {/* ALBUM ARTWORK */}
      <div className="relative rounded-lg sm:rounded-xl overflow-hidden aspect-square bg-zinc-950">
        <img
          src={song.image}
          alt={song.title}
          loading="lazy"
          className={`
            w-full h-full object-cover transition duration-700
            ${isActive ? "scale-105" : "group-hover:scale-[1.04]"}
          `}
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-85 transition duration-500"></div>

        {/* PLAY BUTTON OVERLAY */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setCurrentSong(song)
            }}
            className={`
              w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl
              ${isActive
                ? "bg-white text-violet-600 scale-100 font-bold opacity-100"
                : "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white opacity-0 md:group-hover:opacity-100 translate-y-2 md:group-hover:translate-y-0 hover:scale-105 active:scale-95"
              }
            `}
          >
            <FaPlay className={`text-xs sm:text-sm ${isActive ? "ml-0" : "ml-0.5"}`} />
          </button>
        </div>
      </div>

      {/* SONG TITLE & ARTIST */}
      <div className="mt-2.5 sm:mt-4 px-0.5">
        <h2 className="text-xs sm:text-base font-bold truncate text-white leading-tight">
          {song.title}
        </h2>

        <p className="text-[10px] sm:text-xs mt-1 truncate font-medium text-zinc-400">
          {song.artist}
        </p>

        {/* ACTIVE VISUALIZER */}
        {isActive && (
          <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 bg-violet-950/40 py-1 px-2 sm:py-1.5 sm:px-3 rounded-md sm:rounded-lg border border-violet-900/40 w-fit">
            <span className="text-violet-400 font-bold text-[10px] sm:text-xs">
              Playing
            </span>
            <div className="flex items-end gap-[2px] sm:gap-[3px] h-3 sm:h-3.5">
              <div className="w-[2px] bg-violet-500 rounded-full visualizer-bar" style={{ animationDelay: '0.1s', animationPlayState: isPlaying ? 'running' : 'paused' }}></div>
              <div className="w-[2px] bg-violet-500 rounded-full visualizer-bar-fast" style={{ animationDelay: '0.3s', animationPlayState: isPlaying ? 'running' : 'paused' }}></div>
              <div className="w-[2px] bg-violet-500 rounded-full visualizer-bar-slow" style={{ animationDelay: '0.5s', animationPlayState: isPlaying ? 'running' : 'paused' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MusicCard