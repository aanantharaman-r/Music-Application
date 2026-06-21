import { useEffect, useState } from "react"
import { getLyrics } from "../services/lyrics"

function Lyrics({ currentSong }) {

  const [lyrics, setLyrics] =
    useState("Loading lyrics...")

  useEffect(() => {
    if (!currentSong) return

    setLyrics("Loading lyrics...")

    const loadLyrics = async () => {
      const data = await getLyrics(
        currentSong.artist,
        currentSong.title,
        currentSong.id,
        currentSong.provider
      )
      setLyrics(data)
    }

    loadLyrics()
  }, [currentSong])

  if (!currentSong) return null

  return (

    <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto h-full relative custom-scrollbar">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-600/5 blur-2xl rounded-full pointer-events-none" />
      <h2 className="text-base font-black mb-5 text-red-600 uppercase tracking-widest border-b border-zinc-800 pb-3">
        Lyrics Sheet
      </h2>
      <pre className="whitespace-pre-wrap text-zinc-400 leading-8 text-sm font-medium" style={{ fontFamily: "'Special Elite', Courier, monospace" }}>
        {lyrics}
      </pre>
    </div>

  )
}

export default Lyrics