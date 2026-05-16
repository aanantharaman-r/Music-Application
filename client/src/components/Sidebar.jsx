import {
  FaHome,
  FaHeart,
  FaMusic
} from "react-icons/fa"

import { Link } from "react-router-dom"

function Sidebar({ menuOpen }) {
  return (
    <div
      className={`
        fixed md:static z-50 top-0 left-0 h-screen w-[260px]
        bg-gradient-to-b from-black via-zinc-950 to-black
        border-r border-red-900/40
        p-6 transition-all duration-300
        shadow-[0_0_40px_rgba(255,0,0,0.15)]

        ${menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
    >

      {/* LOGO */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black tracking-wide">
          <span className="text-white">A</span>
          <span className="text-red-700">J</span>
        </h1>

      </div>

      {/* MENU */}
      <div className="flex flex-col gap-5">

        <Link
          to="/"
          className="flex items-center gap-4 p-4 rounded-2xl
          bg-zinc-900/60 hover:bg-red-900/20
          border border-zinc-800 hover:border-red-500
          transition group"
        >
          <FaHome className="text-red-500 group-hover:scale-110 transition" />
          <span className="font-semibold">Home</span>
        </Link>

        <Link
          to="/favorites"
          className="flex items-center gap-4 p-4 rounded-2xl
          bg-zinc-900/60 hover:bg-red-900/20
          border border-zinc-800 hover:border-red-500
          transition group"
        >
          <FaHeart className="text-red-500 group-hover:scale-110 transition" />
          <span className="font-semibold">Favorites</span>
        </Link>

        {/* Playlist (no artists) */}
        <div
          className="flex items-center gap-4 p-4 rounded-2xl
          bg-zinc-900/40 border border-zinc-800 text-zinc-400"
        >
          <FaMusic className="text-red-500" />
          Playlist
        </div>

      </div>

      {/* RED GLOW */}
      <div className="absolute bottom-10 left-0 w-full flex justify-center">
        <div className="w-32 h-32 bg-red-600/20 blur-3xl rounded-full"></div>
      </div>
    </div>
  )
}

export default Sidebar