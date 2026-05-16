const API_KEY = "AIzaSyCGUdscGGKDarN5K0Yyz26BqbM3FjDlNng"

export const searchSongs = async (query) => {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&q=${encodeURIComponent(query)}&key=${API_KEY}`
    )

    const data = await res.json()

    if (!data.items) {
      console.log("No items found:", data)
      return []
    }

    return data.items

  } catch (error) {
    console.log("YouTube API error:", error)
    return []
  }
}