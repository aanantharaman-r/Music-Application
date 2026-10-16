import MusicCard from "../components/MusicCard"
import { FaHeart } from "react-icons/fa"

function Favorites({
  favorites,
  setCurrentSong,
  setActiveSongId,
  setCurrentIndex,
  onFav,
  activeSongId,
  playlists = [],
  addSongToPlaylist,
  isPlaying
}) {

  return (
    <div className="p-3 sm:p-5 md:p-8 min-h-full">

      {/* HEADER BANNER - COMPACT ON MOBILE */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-zinc-950 via-zinc-900/50 to-violet-950/20 p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center gap-4 sm:gap-6 mb-4 sm:mb-8 shadow-xl">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-950/60 flex-shrink-0 group">
          <FaHeart className="text-2xl sm:text-3xl md:text-5xl text-white group-hover:scale-110 transition duration-300 animate-pulse" />
        </div>

        <div className="text-center md:text-left">
          <p className="text-[10px] sm:text-xs uppercase tracking-[3px] text-violet-500 font-bold">
            Personal Playlist
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black mt-1 text-white tracking-tight">
            Favorites
          </h1>
          <p className="text-zinc-500 text-[10px] sm:text-xs mt-1.5 font-medium bg-zinc-900/60 py-0.5 sm:py-1 px-2.5 sm:px-3 rounded-full border border-zinc-800/80 w-fit mx-auto md:mx-0">
            {favorites.length} {favorites.length === 1 ? "song" : "songs"} liked
          </p>
        </div>
      </div>

      {/* EMPTY STATE */}
      {favorites.length === 0 && (
        <div className="bg-zinc-900/20 border border-zinc-900/80 rounded-2xl p-8 sm:p-16 text-center max-w-3xl mx-auto flex flex-col items-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 sm:mb-6 text-zinc-500 text-xl sm:text-2xl">
            💔
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-white">
            No Favorite Songs Yet
          </h2>
          <p className="text-zinc-400 mt-1 sm:mt-2 text-xs sm:text-sm max-w-sm">
            Tap the heart icon on any music card to build your curated custom collection here.
          </p>
        </div>
      )}

      {/* SONG GRID */}
      {favorites.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
          {favorites.map((song, index) => (
            <MusicCard
              key={song.id}
              song={song}
              isActive={activeSongId === song.id}
              isFav={true}
              setCurrentSong={() => {
                setCurrentSong(song)
                setActiveSongId(song.id)
                setCurrentIndex(index)
              }}
              onFav={() => onFav(song)}
              playlists={playlists}
              addSongToPlaylist={addSongToPlaylist}
              isPlaying={isPlaying}
            />
          ))}
        </div>
      )}

    </div>
  )
}

export default Favorites