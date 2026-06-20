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

    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 h-[500px] overflow-y-auto">

      <h2 className="text-2xl font-black mb-5">
        Lyrics
      </h2>

      <pre className="whitespace-pre-wrap text-zinc-300 leading-8 font-sans">

        {lyrics}

      </pre>

    </div>

  )
}

export default Lyrics