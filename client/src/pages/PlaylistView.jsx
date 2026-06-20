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
  favorites
}) {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const playlist = playlists.find(p => p.id === id)

  if (!playlist) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Playlist not found</h2>
        <button onClick={() => navigate("/")} className="mt-4 px-4 py-2 bg-violet-600 rounded-xl font-bold text-sm">
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
    <div className="p-6 md:p-8 min-h-full">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-zinc-950 via-zinc-900/50 to-violet-950/20 p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-10 shadow-xl">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-violet-600/50 to-rose-600/50 border border-violet-500/25 flex items-center justify-center shadow-lg flex-shrink-0">
            <FaMusic className="text-4xl text-violet-400" />
          </div>

          <div className="text-center md:text-left">
            <p className="text-xs uppercase tracking-[3px] text-violet-500 font-bold">
              Custom Playlist
            </p>
            <h1 className="text-4xl md:text-5xl font-black mt-1.5 text-white tracking-tight">
              {playlist.name}
            </h1>
            <p className="text-zinc-500 text-xs mt-2 font-medium bg-zinc-900/60 py-1 px-3 rounded-full border border-zinc-800/80 w-fit mx-auto md:mx-0">
              {playlist.songs.length} {playlist.songs.length === 1 ? "song" : "songs"}
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 z-10">
          {playlist.songs.length > 0 && (
            <button
              onClick={handlePlayFirst}
              className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-2 transition"
            >
              <FaPlay className="text-[10px]" /> Play
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 text-zinc-400 hover:text-violet-500 hover:border-violet-900/40 transition"
            title="Delete Playlist"
          >
            <FaTrash className="text-sm" />
          </button>
        </div>
      </div>

      {/* EMPTY STATE */}
      {playlist.songs.length === 0 && (
        <div className="bg-zinc-900/20 border border-zinc-900/80 rounded-3xl p-16 text-center max-w-3xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 text-zinc-500 text-2xl">
            🎵
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            This playlist is empty
          </h2>
          <p className="text-zinc-400 mt-2 text-sm max-w-sm">
            Search for songs and click the "+" icon on a music card to add them to this playlist.
          </p>
        </div>
      )}

      {/* SONGS GRID */}
      {playlist.songs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
            />
          ))}
        </div>
      )}

    </div>
  )
}

export default PlaylistView
