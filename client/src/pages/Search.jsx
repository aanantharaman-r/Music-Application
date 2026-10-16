import { FaSearch } from "react-icons/fa"
import MusicCard from "../components/MusicCard"

function Search({
  search,
  setSearch,
  songs,
  loading,
  fetchSongs,
  favorites,
  setFavorites,
  setCurrentSong,
  setCurrentIndex,
  setActiveSongId,
  activeSongId,
  provider,
  setProvider,
  playlists = [],
  addSongToPlaylist,
  isPlaying
}) {

  const categories = ["Tamil Hits", "Lo-Fi Beats", "Synthwave", "Coding Beats", "Acoustic Pop", "Rock Hits"]

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider)
    if (search.trim()) {
      fetchSongs(search, newProvider)
    }
  }

  return (
    <div className="p-3 sm:p-5 md:p-8 min-h-full">

      {/* SEARCH BANNER */}
      <div className="mb-4 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">Search</h1>
          
          {/* PROVIDER SELECTOR */}
          <div className="flex bg-zinc-900/80 border border-zinc-800/80 p-0.5 sm:p-1 rounded-xl w-fit">
            <button
              onClick={() => handleProviderChange("jiosaavn")}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-300 ${
                provider === "jiosaavn"
                  ? "bg-violet-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              🟢 JioSaavn
            </button>
            <button
              onClick={() => handleProviderChange("youtube")}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-300 ${
                provider === "youtube"
                  ? "bg-violet-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              🔴 YouTube
            </button>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3 items-center w-full max-w-4xl">
          <div className="flex items-center gap-2 sm:gap-3 w-full bg-zinc-900/50 backdrop-blur-md border border-zinc-800/80 rounded-xl sm:rounded-2xl px-3.5 py-2.5 sm:px-5 sm:py-3.5 focus-within:border-violet-600/80 focus-within:ring-2 focus-within:ring-violet-950 transition-all duration-300">
            <FaSearch className="text-zinc-500 text-xs sm:text-base flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="What do you want to Tune..?"
              spellCheck={false}
              autoComplete="off"
              className="w-full min-w-0 flex-1 bg-transparent outline-none border-none text-white text-xs sm:text-base leading-normal placeholder-zinc-500"
            />
          </div>
          <button
            onClick={() => fetchSongs(search, provider)}
            className="flex-shrink-0 bg-gradient-to-r from-violet-600 to-fuchsia-700 hover:from-violet-500 hover:to-fuchsia-600 px-4 py-2.5 sm:px-7 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold tracking-wide shadow-lg shadow-violet-900/30 transition-all duration-300 active:scale-95"
          >
            Search
          </button>
        </div>

        {/* SUGGESTION TAGS - COMPACT HORIZONTAL SCROLL / WRAP */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4 max-w-4xl">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSearch(cat.toLowerCase())
                fetchSongs(cat.toLowerCase(), provider)
              }}
              className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold border transition-all duration-200 ${
                search.toLowerCase() === cat.toLowerCase()
                  ? "bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-900/30"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH RESULTS */}
      <div>
        <h2 className="text-sm sm:text-base md:text-xl font-bold mb-3 sm:mb-4 text-zinc-400">
          {search ? `Results for "${search}"` : "Search for music..."}
        </h2>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-48 sm:h-64 bg-zinc-900/30 border border-zinc-800/40 rounded-xl sm:rounded-2xl animate-pulse flex flex-col p-3">
                <div className="flex-1 bg-zinc-800/40 rounded-lg sm:rounded-xl mb-3"></div>
                <div className="h-4 bg-zinc-800/40 rounded w-3/4 mb-1.5"></div>
                <div className="h-3 bg-zinc-800/40 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* SONGS GRID */}
        {!loading && songs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
            {songs.map((song, i) => (
              <MusicCard
                key={song.id}
                song={song}
                setCurrentSong={() => {
                  setCurrentSong(song)
                  setCurrentIndex(i)
                  setActiveSongId(song.id)
                }}
                isActive={activeSongId === song.id}
                onFav={() => {
                  const exists = favorites.find(f => f.id === song.id)
                  if (exists) {
                    setFavorites(favorites.filter(f => f.id !== song.id))
                  } else {
                    setFavorites([...favorites, song])
                  }
                }}
                isFav={favorites.some(f => f.id === song.id)}
                playlists={playlists}
                addSongToPlaylist={addSongToPlaylist}
                isPlaying={isPlaying}
              />
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && songs.length === 0 && search && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-900/10 rounded-3xl border border-zinc-900/60 p-8 max-w-4xl">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-bold">No results found</h3>
            <p className="text-zinc-500 text-sm mt-1">Double check spelling or try another keyword</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default Search
