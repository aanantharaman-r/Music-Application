import express from "express"
import { decryptJioSaavnMediaUrl } from "../utils/des.js"

const router = express.Router()

function decodeHtml(html) {
  if (!html) return ""
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
}

router.get("/search", async (req, res) => {
  const { query } = req.query
  if (!query || !query.trim()) {
    return res.json({ success: true, results: [] })
  }

  try {
    // 1. Try sumit.co mirror
    try {
      const mirrorRes = await fetch(`https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}`)
      if (mirrorRes.ok) {
        const mirrorData = await mirrorRes.json()
        if (mirrorData.success && mirrorData.data && mirrorData.data.results && mirrorData.data.results.length > 0) {
          return res.json({ success: true, results: mirrorData.data.results })
        }
      }
    } catch (e) {
      // ignore mirror error
    }

    // 2. Direct JioSaavn official API (Server-side, no CORS restriction)
    const directRes = await fetch(
      `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&q=${encodeURIComponent(query)}&n=25&p=1`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json"
        }
      }
    )

    if (directRes.ok) {
      const data = await directRes.json()
      if (data && data.results && Array.isArray(data.results)) {
        const formattedResults = data.results.map((song) => {
          const title = decodeHtml(song.title || song.name || "")
          const primaryArtists = song.more_info?.artistMap?.primary_artists
            ?.map((a) => a.name)
            .join(", ") || decodeHtml(song.subtitle || song.more_info?.music || "")

          let mediaUrl = ""
          if (song.more_info?.encrypted_media_url) {
            mediaUrl = decryptJioSaavnMediaUrl(song.more_info.encrypted_media_url)
          }
          if (!mediaUrl && song.more_info?.vlink) {
            mediaUrl = song.more_info.vlink
          }

          const rawImg = song.image || ""
          const highResImg = rawImg.replace(/150x150|50x50/g, "500x500")

          return {
            id: song.id,
            name: title,
            primaryArtists: primaryArtists,
            artists: {
              primary: (song.more_info?.artistMap?.primary_artists || []).map((a) => ({ name: decodeHtml(a.name) }))
            },
            image: [
              { quality: "50x50", url: rawImg },
              { quality: "150x150", url: rawImg },
              { quality: "500x500", url: highResImg }
            ],
            downloadUrl: [
              { quality: "12kbps", url: mediaUrl },
              { quality: "48kbps", url: mediaUrl },
              { quality: "96kbps", url: mediaUrl },
              { quality: "160kbps", url: mediaUrl },
              { quality: "320kbps", url: mediaUrl }
            ]
          }
        })
        return res.json({ success: true, results: formattedResults })
      }
    }
    return res.json({ success: true, results: [] })
  } catch (err) {
    console.error("Saavn route error:", err)
    return res.status(500).json({ error: "Failed to search songs" })
  }
})

export default router
