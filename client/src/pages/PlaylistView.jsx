import MusicCard from "../components/MusicCard"
import { FaMusic, FaTrash, FaPlay } from "react-icons/fa"
import { useParams, useNavigate } from "react-router-dom"

function PlaylistView({
  playlists,
  deletePlaylist,
  removeSongFromPlaylist,
  setCurrentSong,
  setActiveSongId,
  setCurrentIndex,
  activeSongId,
  onFav,
  favorites,
  isPlaying
}) {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const playlist = playlists.find(p => p.id === id)

  if (!playlist) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Playlist not found</h2>
        <button onClick={() => navigate("/")} className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl font-bold text-sm text-white">
          Go Home
        </button>
      </div>
    )
  }

  const handlePlayFirst = () => {
    if (playlist.songs.length > 0) {
      setCurrentSong(playlist.songs[0])
      setActiveSongId(playlist.songs[0].id)
      setCurrentIndex(0)
    }
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      deletePlaylist(playlist.id)
      navigate("/")
    }
  }

  return (
    <div className="p-3 sm:p-5 md:p-8 min-h-full">
      {/* HEADER BANNER - COMPACT ON MOBILE */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-zinc-950 via-zinc-900/50 to-violet-950/20 p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-8 shadow-xl">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-center sm:text-left">
          <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-600/50 to-fuchsia-600/50 border border-violet-500/25 flex items-center justify-center shadow-lg flex-shrink-0">
            <FaMusic className="text-2xl sm:text-3xl md:text-4xl text-violet-400" />
          </div>

          <div>
            <p className="text-[10px] sm:text-xs uppercase tracking-[3px] text-violet-500 font-bold">
              Custom Playlist
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black mt-1 text-white tracking-tight">
              {playlist.name}
            </h1>
            <p className="text-zinc-500 text-[10px] sm:text-xs mt-1.5 font-medium bg-zinc-900/60 py-0.5 sm:py-1 px-2.5 sm:px-3 rounded-full border border-zinc-800/80 w-fit mx-auto sm:mx-0">
              {playlist.songs.length} {playlist.songs.length === 1 ? "song" : "songs"}
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2.5 sm:gap-3 z-10">
          {playlist.songs.length > 0 && (
            <button
              onClick={handlePlayFirst}
              className="px-4 py-2 sm:px-5 sm:py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-md"
            >
              <FaPlay className="text-[10px]" /> Play
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-2.5 sm:p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 text-zinc-400 hover:text-rose-500 hover:border-rose-900/40 transition active:scale-95"
            title="Delete Playlist"
          >
            <FaTrash className="text-xs sm:text-sm" />
          </button>
        </div>
      </div>

      {/* EMPTY STATE */}
      {playlist.songs.length === 0 && (
        <div className="bg-zinc-900/20 border border-zinc-900/80 rounded-2xl p-8 sm:p-16 text-center max-w-3xl mx-auto flex flex-col items-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 sm:mb-6 text-zinc-500 text-xl sm:text-2xl">
            🎵
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-white">
            This playlist is empty
          </h2>
          <p className="text-zinc-400 mt-1 sm:mt-2 text-xs sm:text-sm max-w-sm">
            Search for songs and click the "+" icon on a music card to add them to this playlist.
          </p>
        </div>
      )}

      {/* SONGS GRID */}
      {playlist.songs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
          {playlist.songs.map((song, index) => (
            <MusicCard
              key={song.id}
              song={song}
              isActive={activeSongId === song.id}
              isFav={favorites.some(f => f.id === song.id)}
              setCurrentSong={() => {
                setCurrentSong(song)
                setActiveSongId(song.id)
                setCurrentIndex(index)
              }}
              onFav={() => onFav(song)}
              // Custom action to remove from playlist
              removeLabel="Remove from playlist"
              onRemove={() => removeSongFromPlaylist(playlist.id, song.id)}
              isPlaying={isPlaying}
            />
          ))}
        </div>
      )}

    </div>
  )
}

export default PlaylistView
