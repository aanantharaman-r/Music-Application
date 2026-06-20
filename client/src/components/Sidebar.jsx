import {
  FaHome,
  FaSearch,
  FaHeart,
  FaMusic,
  FaTimes,
  FaPlus,
  FaFolder
} from "react-icons/fa"

import { Link, useLocation } from "react-router-dom"

function Sidebar({ menuOpen, setMenuOpen, playlists = [], createPlaylist }) {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const handleCreate = () => {
    const name = prompt("Enter playlist name:")
    if (name && name.trim()) {
      createPlaylist(name.trim())
    }
  }

  return (
    <div
      className={`
        fixed md:static z-50 top-0 left-0 h-screen w-[260px]
        bg-zinc-950/90 border-r border-zinc-900/80 backdrop-blur-xl
        p-6 transition-all duration-300 flex flex-col justify-between
        shadow-[5px_0_30px_rgba(0,0,0,0.8)]

        ${menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
    >
      <div className="flex flex-col h-[85%] overflow-hidden">
        {/* LOGO & CLOSE BUTTON */}
        <div className="mb-10 flex items-center justify-between flex-shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-950/50 group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-black text-lg">A</span>
            </div>
            <h1 className="text-2xl font-black tracking-wider text-white group-hover:text-violet-400 transition-colors">
              AJ<span className="text-violet-500">Music</span>
            </h1>
          </Link>

          {/* MOBILE CLOSE */}
          <button
            onClick={() => setMenuOpen(false)}
            className="md:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* MENU */}
        <div className="flex flex-col gap-2.5 flex-shrink-0">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-300 group relative
              ${isActive("/") 
                ? "bg-violet-500/10 border-violet-500/20 text-white" 
                : "bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
              }`}
          >
            {isActive("/") && (
              <span className="absolute left-0 top-3 bottom-3 w-1 bg-violet-500 rounded-r" />
            )}
            <FaHome className={`text-base transition group-hover:scale-115 ${isActive("/") ? "text-violet-500" : "text-zinc-500"}`} />
            <span className="font-semibold text-sm">Home</span>
          </Link>

          <Link
            to="/search"
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-300 group relative
              ${isActive("/search") 
                ? "bg-violet-500/10 border-violet-500/20 text-white" 
                : "bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
              }`}
          >
            {isActive("/search") && (
              <span className="absolute left-0 top-3 bottom-3 w-1 bg-violet-500 rounded-r" />
            )}
            <FaSearch className={`text-base transition group-hover:scale-115 ${isActive("/search") ? "text-violet-500" : "text-zinc-500"}`} />
            <span className="font-semibold text-sm">Search</span>
          </Link>

          <Link
            to="/favorites"
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-300 group relative
              ${isActive("/favorites") 
                ? "bg-violet-500/10 border-violet-500/20 text-white" 
                : "bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
              }`}
          >
            {isActive("/favorites") && (
              <span className="absolute left-0 top-3 bottom-3 w-1 bg-violet-500 rounded-r" />
            )}
            <FaHeart className={`text-base transition group-hover:scale-115 ${isActive("/favorites") ? "text-violet-500" : "text-zinc-500"}`} />
            <span className="font-semibold text-sm">Favorites</span>
          </Link>
        </div>

        {/* CUSTOM PLAYLISTS HEADER */}
        <div className="mt-8 flex items-center justify-between border-t border-zinc-900/80 pt-6 px-1 flex-shrink-0">
          <div className="flex items-center gap-2 text-zinc-500">
            <FaMusic className="text-xs" />
            <span className="text-xs font-bold uppercase tracking-wider">Playlists</span>
          </div>
          <button 
            onClick={handleCreate}
            className="p-1 rounded-md text-zinc-500 hover:text-violet-500 hover:bg-zinc-900 transition-colors"
            title="Create Playlist"
          >
            <FaPlus className="text-xs" />
          </button>
        </div>

        {/* PLAYLISTS LIST */}
        <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-1.5 custom-scrollbar">
          {playlists.map((p) => {
            const path = `/playlists/${p.id}`
            return (
              <Link
                key={p.id}
                to={path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-300 group relative
                  ${isActive(path)
                    ? "bg-zinc-900 border-zinc-800 text-white font-bold"
                    : "bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"
                  }`}
              >
                {isActive(path) && (
                  <span className="absolute left-0 top-2.5 bottom-2.5 w-[3px] bg-violet-500 rounded-r" />
                )}
                <FaFolder className={`text-sm transition group-hover:scale-115 ${isActive(path) ? "text-violet-500" : "text-zinc-500"}`} />
                <span className="truncate flex-1">{p.name}</span>
                <span className="text-[10px] text-zinc-600 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-900">
                  {p.songs.length}
                </span>
              </Link>
            )
          })}
          {playlists.length === 0 && (
            <p className="text-[10px] text-zinc-600 italic px-3 py-4 text-center">
              No playlists created yet.
            </p>
          )}
        </div>

      </div>

      {/* FOOTER ACCENT */}
      <div className="relative p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900 text-center overflow-hidden flex-shrink-0">
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-violet-600/10 blur-xl rounded-full" />
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">AJ Music space</p>
      </div>
    </div>
  )
}

export default Sidebar