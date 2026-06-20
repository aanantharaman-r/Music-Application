import { useState } from "react"
import { FaPlay, FaHeart, FaRegHeart, FaPlus, FaTrash } from "react-icons/fa"

function MusicCard({
  song,
  setCurrentSong,
  isActive,
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
        relative cursor-pointer group p-4 rounded-2xl
        border overflow-hidden transition-all duration-500
        bg-zinc-900/30 backdrop-blur-sm

        ${isActive
          ? "border-violet-600/80 shadow-lg shadow-violet-950/40 scale-[1.02]"
          : "border-zinc-800/80 hover:border-zinc-700/80 hover:bg-zinc-900/50 hover:scale-[1.01]"
        }
      `}
    >

      {/* PLAYLIST ADD DROPDOWN (ONLY SHOW IF NOT REMOVABLE AND PLAYLISTS EXIST) */}
      {!onRemove && playlists.length > 0 && (
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowDropdown(!showDropdown)
            }}
            className={`p-2.5 rounded-full transition-all duration-300 backdrop-blur-md border 
              ${showDropdown 
                ? "bg-violet-500/15 border-violet-500/30 text-violet-400 shadow-md shadow-violet-950/20" 
                : "bg-black/40 border-zinc-800/40 text-zinc-400 hover:text-white hover:border-zinc-700/80 hover:scale-105"
              }`}
            title="Add to Playlist"
          >
            <FaPlus className="text-xs" />
          </button>
          
          {showDropdown && (
            <div className="absolute top-11 left-0 bg-zinc-950/95 border border-zinc-800 rounded-xl p-2 w-48 shadow-2xl z-30 backdrop-blur-md animate-in fade-in slide-in-from-top-1">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold p-1.5 border-b border-zinc-900 mb-1">Add to Playlist</p>
              <div className="max-h-32 overflow-y-auto">
                {playlists.map(p => (
                  <button
                    key={p.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      addSongToPlaylist?.(p.id, song)
                      setShowDropdown(false)
                    }}
                    className="w-full text-left text-xs font-semibold px-2 py-1.5 rounded-lg text-zinc-300 hover:bg-violet-600 hover:text-white transition-colors"
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
          className="absolute top-4 left-4 z-20 p-2.5 rounded-full bg-violet-950/40 border border-violet-900/30 text-violet-500 hover:bg-violet-600 hover:text-white transition-colors duration-300"
          title={removeLabel}
        >
          <FaTrash className="text-xs" />
        </button>
      )}

      {/* FAVORITE BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onFav?.()
        }}
        className={`absolute top-4 right-4 z-20 p-2.5 rounded-full transition-all duration-300 backdrop-blur-md border 
          ${isFav 
            ? "bg-violet-500/10 border-violet-500/30 text-violet-400 shadow-md shadow-violet-950/20" 
            : "bg-black/40 border-zinc-800/40 text-zinc-400 hover:text-white hover:border-zinc-700/80 hover:scale-105"
          }`}
      >
        {isFav ? <FaHeart className="text-sm scale-110" /> : <FaRegHeart className="text-sm" />}
      </button>

      {/* IMAGE */}
      <div className="relative rounded-xl overflow-hidden aspect-square bg-zinc-950">

        <img
          src={song.image}
          alt={song.title}
          className={`
            w-full h-full object-cover transition duration-700

            ${isActive
              ? "scale-105"
              : "group-hover:scale-[1.04]"
            }
          `}
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-85 transition duration-500"></div>

        {/* PLAY BUTTON Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setCurrentSong(song)
            }}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl
              ${isActive
                ? "bg-white text-violet-600 scale-100"
                : "bg-violet-600 text-white opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110 hover:bg-violet-500"
              }
            `}
          >
            <FaPlay className={`text-sm ${isActive ? "ml-0" : "ml-0.5"}`} />
          </button>
        </div>

      </div>

      {/* INFO */}
      <div className="mt-4 px-1">

        <h2 className="text-base font-bold truncate text-white leading-snug group-hover:text-violet-400 transition-colors duration-300">
          {song.title}
        </h2>

        <p className={`
          text-xs mt-1 truncate font-medium
          ${isActive
            ? "text-violet-400 font-semibold"
            : "text-zinc-500 group-hover:text-zinc-400"
          }
        `}>
          {song.artist}
        </p>

        {/* ACTIVE VISUALIZER */}
        {isActive && (
          <div className="flex items-center gap-2 mt-3.5 bg-violet-950/20 py-1.5 px-3 rounded-lg border border-violet-900/30 w-fit">
            <span className="text-violet-400 font-bold text-xs">
              Playing
            </span>
            <div className="flex items-end gap-[3px] h-3.5">
              <div className="w-[2px] bg-violet-500 rounded-full visualizer-bar" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-[2px] bg-violet-500 rounded-full visualizer-bar-fast" style={{ animationDelay: '0.3s' }}></div>
              <div className="w-[2px] bg-violet-500 rounded-full visualizer-bar-slow" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        )}

      </div>

    </div>
  )
}

export default MusicCard