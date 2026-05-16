import MusicCard from "../components/MusicCard"
import { FaHeart } from "react-icons/fa"

function Favorites({
  favorites,
  setCurrentSong,
  setActiveSongId,
  setCurrentIndex
}) {

  return (

    <div className="p-8">

      {/* HEADER */}
      <div className="flex items-center gap-6 mb-12">

        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-red-500 to-pink-700 flex items-center justify-center shadow-2xl">

          <FaHeart className="text-5xl text-white" />

        </div>

        <div>

          <p className="text-zinc-400 uppercase tracking-[4px] text-sm">
            Playlist
          </p>

          <h1 className="text-6xl font-black mt-1">
            Favorites
          </h1>

          <p className="text-zinc-500 mt-2">
            {favorites.length} liked songs
          </p>

        </div>

      </div>

      {/* EMPTY */}
      {favorites.length === 0 && (

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-14 text-center">

          <h2 className="text-3xl font-bold">
            No Favorite Songs Yet
          </h2>

          <p className="text-zinc-400 mt-3 text-lg">
            Add songs to favorites to build your playlist.
          </p>

        </div>

      )}

      {/* SONG GRID */}
      {favorites.length > 0 && (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {favorites.map((song, index) => (

            <MusicCard
              key={song.id}
              song={song}
              isActive={false}
              isFav={true}
              setCurrentSong={() => {

                setCurrentSong(song)
                setActiveSongId(song.id)
                setCurrentIndex(index)

              }}
            />

          ))}

        </div>

      )}

    </div>
  )
}

export default Favorites