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
    <div className="p-6 md:p-8 min-h-full">

      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-zinc-950 via-zinc-900/50 to-violet-950/20 p-8 flex flex-col md:flex-row items-center gap-6 mb-10 shadow-xl">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-950/60 flex-shrink-0 group">
          <FaHeart className="text-4xl md:text-5xl text-white group-hover:scale-110 transition duration-300 animate-pulse" />
        </div>

        <div className="text-center md:text-left">
          <p className="text-xs uppercase tracking-[3px] text-violet-500 font-bold">
            Personal Playlist
          </p>
          <h1 className="text-4xl md:text-5xl font-black mt-1.5 text-white tracking-tight">
            Favorites
          </h1>
          <p className="text-zinc-500 text-xs mt-2 font-medium bg-zinc-900/60 py-1 px-3 rounded-full border border-zinc-800/80 w-fit mx-auto md:mx-0">
            {favorites.length} {favorites.length === 1 ? "song" : "songs"} liked
          </p>
        </div>
      </div>

      {/* EMPTY STATE */}
      {favorites.length === 0 && (
        <div className="bg-zinc-900/20 border border-zinc-900/80 rounded-3xl p-16 text-center max-w-3xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 text-zinc-500 text-2xl">
            💔
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            No Favorite Songs Yet
          </h2>
          <p className="text-zinc-400 mt-2 text-sm max-w-sm">
            Tap the heart icon on any music card to build your curated custom collection here.
          </p>
        </div>
      )}

      {/* SONG GRID */}
      {favorites.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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