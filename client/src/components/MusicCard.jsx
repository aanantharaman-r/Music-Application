import { FaPlay } from "react-icons/fa"

function MusicCard({
  song,
  setCurrentSong,
  isActive,
  onFav,
  isFav
}) {

  return (
    <div
      onClick={() => setCurrentSong(song)}
      className={`
        relative cursor-pointer group p-4 rounded-2xl
        border overflow-hidden transition-all duration-300

        ${isActive
          ? "bg-red-700 scale-105 border-red-500 shadow-2xl shadow-red-900/40"
          : "bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 hover:scale-105"
        }
      `}
    >

      {/* FAVORITE BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onFav()
        }}
        className="absolute top-3 right-3 text-xl z-20"
      >
        {isFav ? "❤️" : "🤍"}
      </button>

      {/* IMAGE */}
      <div className="relative rounded-xl overflow-hidden">

        <img
          src={song.image}
          alt={song.title}
          className={`
            w-full h-56 object-cover transition duration-500

            ${isActive
              ? "scale-110"
              : "group-hover:scale-105"
            }
          `}
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition"></div>

        {/* PLAY BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setCurrentSong(song)
          }}
          className={`
            absolute bottom-3 right-3 w-12 h-12 rounded-full
            flex items-center justify-center transition

            ${isActive
              ? "bg-white text-red-700"
              : "bg-red-600 text-white opacity-0 group-hover:opacity-100"
            }
          `}
        >
          <FaPlay />
        </button>

      </div>

      {/* INFO */}
      <div className="mt-4">

        <h2 className="text-lg font-bold truncate text-white">
          {song.title}
        </h2>

        <p className={`
          text-sm mt-1 truncate

          ${isActive
            ? "text-red-200 font-semibold"
            : "text-zinc-400"
          }
        `}>
          {song.artist}
        </p>

        {/* ACTIVE VISUALIZER */}
        {isActive && (
          <div className="flex items-center gap-2 mt-3">

            <span className="text-red-200 font-bold text-sm">
              ▶ Playing
            </span>

            <div className="flex items-end gap-[3px] h-5">

              <div className="w-1 h-2 bg-red-500 rounded animate-pulse"></div>
              <div className="w-1 h-5 bg-red-500 rounded animate-pulse [animation-delay:0.1s]"></div>
              <div className="w-1 h-3 bg-red-500 rounded animate-pulse [animation-delay:0.2s]"></div>
              <div className="w-1 h-4 bg-red-500 rounded animate-pulse [animation-delay:0.3s]"></div>
              <div className="w-1 h-2 bg-red-500 rounded animate-pulse [animation-delay:0.4s]"></div>

            </div>

          </div>
        )}

      </div>

    </div>
  )
}

export default MusicCard  