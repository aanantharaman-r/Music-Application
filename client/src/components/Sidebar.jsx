import { useState } from "react"
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
import logo from "../assets/logo.jpg"

function Sidebar({ menuOpen, setMenuOpen, playlists = [], createPlaylist, user, handleLogout }) {
  const location = useLocation()
  const [showModal, setShowModal] = useState(false)
  const [playlistName, setPlaylistName] = useState("")

  const isActive = (path) => location.pathname === path

  const handleCreate = () => {
    setShowModal(true)
  }

  const handleClose = () => {
    setShowModal(false)
    setPlaylistName("")
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (playlistName.trim()) {
      createPlaylist(playlistName.trim())
      handleClose()
    }
  }

  return (
    <>
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
        {/* LOGO BRANDING */}
        <div className="mb-8 flex flex-col items-center justify-center flex-shrink-0 relative w-full text-center">
          <Link to="/" className="flex flex-col items-center gap-3 group w-full">
            <div className="relative p-0.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-[0_8px_30px_rgb(124,58,237,0.2)] group-hover:shadow-[0_8px_30px_rgb(124,58,237,0.4)] transition-all duration-300">
              <img 
                src={logo} 
                alt="LESSO TUNES Logo" 
                className="w-20 h-20 rounded-2xl object-cover border border-zinc-950/20 group-hover:scale-[1.02] transition-all duration-300" 
              />
            </div>
            <h1 className="text-lg font-black tracking-[0.2em] text-white group-hover:text-violet-400 transition-colors mt-1">
              LESSO <span className="text-violet-500">TUNES</span>
            </h1>
          </Link>

          {/* MOBILE CLOSE */}
          <button
            onClick={() => setMenuOpen(false)}
            className="md:hidden absolute top-0 right-0 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
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
        {user ? (
          <div className="relative z-10 flex flex-col gap-2">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider truncate">
              Signed in as <span className="text-violet-400">{user.username}</span>
            </p>
            <button
              onClick={handleLogout}
              className="w-full py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 font-black text-[10px] tracking-wider uppercase transition-all duration-300"
            >
              Logout
            </button>
          </div>
        ) : (
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">LESSO Tunes Space</p>
        )}
      </div>

    </div>

      {showModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={handleClose} 
            className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          />
          
          {/* Modal Content */}
          <div className="relative bg-zinc-950 border border-zinc-800/80 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl shadow-black/80 transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Glowing top-right aura */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-violet-600/10 blur-2xl rounded-full pointer-events-none" />
            
            <h3 className="text-xl font-black text-white tracking-wide mb-2 flex items-center gap-2">
              <FaFolder className="text-violet-500" /> Create Playlist
            </h3>
            <p className="text-xs text-zinc-400 mb-6 font-semibold">
              Organize your audio space. Enter a name for your custom playlist.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="My playlist #1"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 font-semibold text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all duration-200"
                  autoFocus
                  required
                />
              </div>
              
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-xs shadow-lg shadow-violet-950/40 hover:scale-[1.02] active:scale-95 transition-all duration-200"
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar