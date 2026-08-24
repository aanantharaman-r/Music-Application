import { decryptJioSaavnMediaUrl } from "./des"
import { searchSongs as searchYouTube } from "./youtube"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

function decodeHtml(html) {
  if (!html) return ""
  const txt = document.createElement("textarea")
  txt.innerHTML = html
  return txt.value
}

function formatJioSaavnResults(rawResults) {
  if (!Array.isArray(rawResults)) return []
  return rawResults.map((song) => {
    const title = decodeHtml(song.title || song.name || "")
    const primaryArtists = song.more_info?.artistMap?.primary_artists
      ?.map((a) => a.name)
      .join(", ") || decodeHtml(song.subtitle || song.more_info?.music || song.primaryArtists || "")

    let mediaUrl = ""
    if (song.more_info?.encrypted_media_url) {
      mediaUrl = decryptJioSaavnMediaUrl(song.more_info.encrypted_media_url)
    }
    if (!mediaUrl && song.downloadUrl) {
      if (Array.isArray(song.downloadUrl)) {
        mediaUrl = song.downloadUrl[4]?.url || song.downloadUrl[3]?.url || song.downloadUrl[2]?.url || song.downloadUrl[1]?.url || song.downloadUrl[0]?.url || song.downloadUrl[4]?.link || song.downloadUrl[0]?.link || ""
      } else if (typeof song.downloadUrl === "string") {
        mediaUrl = song.downloadUrl
      }
    }
    if (!mediaUrl && song.more_info?.vlink) {
      mediaUrl = song.more_info.vlink
    }
    if (!mediaUrl && song.file) {
      mediaUrl = song.file
    }
    if (mediaUrl && mediaUrl.includes("saavncdn.com")) {
      mediaUrl = mediaUrl.replace(/_96\.mp4|_96\.mp3|_160\.mp4|_160\.mp3|_320\.mp3/g, "_320.mp4")
    }

    const rawImg = song.image || ""
    let highResImg = ""
    if (typeof rawImg === "string") {
      highResImg = rawImg.replace(/150x150|50x50/g, "500x500")
    } else if (Array.isArray(rawImg)) {
      highResImg = rawImg[2]?.url || rawImg[1]?.url || rawImg[0]?.url || rawImg[2]?.link || rawImg[0]?.link || ""
    }

    return {
      id: song.id,
      name: title,
      title: title,
      primaryArtists: primaryArtists,
      artist: primaryArtists,
      artists: {
        primary: (song.more_info?.artistMap?.primary_artists || []).map((a) => ({ name: decodeHtml(a.name) }))
      },
      image: Array.isArray(rawImg) ? rawImg : [
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
      ],
      file: mediaUrl,
      provider: "jiosaavn"
    }
  })
}

export const searchSaavn = async (query) => {
  if (!query || !query.trim()) return []

  // 1. Try local Vite Proxy to JioSaavn API directly
  try {
    const res = await fetch(
      `/jiosaavn-api/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&q=${encodeURIComponent(query)}&n=25&p=1`
    )
    if (res.ok) {
      const data = await res.json()
      if (data && data.results && Array.isArray(data.results) && data.results.length > 0) {
        return formatJioSaavnResults(data.results)
      }
    }
  } catch (error) {
    console.warn("Vite JioSaavn proxy failed:", error)
  }

  // 2. Try Express backend server (/api/saavn/search)
  try {
    const res = await fetch(`${API_URL}/saavn/search?query=${encodeURIComponent(query)}`)
    if (res.ok) {
      const data = await res.json()
      if (data && data.results && data.results.length > 0) {
        return formatJioSaavnResults(data.results)
      }
    }
  } catch (error) {
    console.warn("Backend saavn route failed:", error)
  }

  // 3. Try Sumit.co API mirror
  try {
    const res = await fetch(`https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}`)
    if (res.ok) {
      const data = await res.json()
      if (data.success && data.data && data.data.results && data.data.results.length > 0) {
        return formatJioSaavnResults(data.data.results)
      }
    }
  } catch (error) {
    console.warn("Sumit.co mirror failed:", error)
  }

  // 4. Ultimate Fallback: Fetch from YouTube API if JioSaavn endpoints fail
  try {
    console.warn("Falling back to YouTube for search query:", query)
    const ytItems = await searchYouTube(query)
    if (ytItems && ytItems.length > 0) {
      return ytItems
        .filter((item) => item?.id?.videoId)
        .map((item) => ({
          id: item.id.videoId,
          name: item.snippet?.title || "Unknown Title",
          title: item.snippet?.title || "Unknown Title",
          primaryArtists: item.snippet?.channelTitle || "YouTube Music",
          artist: item.snippet?.channelTitle || "YouTube Music",
          artists: {
            primary: [{ name: item.snippet?.channelTitle || "YouTube Music" }]
          },
          image: [
            { quality: "500x500", url: item.snippet?.thumbnails?.high?.url || "" }
          ],
          downloadUrl: [
            { quality: "320kbps", url: item.id.videoId }
          ],
          file: item.id.videoId,
          provider: "youtube"
        }))
    }
  } catch (error) {
    console.error("YouTube fallback search error:", error)
  }

  return []
}
