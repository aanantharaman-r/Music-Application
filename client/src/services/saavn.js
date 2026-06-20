export const searchSaavn = async (query) => {
  try {
    const res = await fetch(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}`)
    const data = await res.json()
    if (data.success && data.data && data.data.results) {
      return data.data.results
    }
    return []
  } catch (error) {
    console.error("Saavn API error:", error)
    return []
  }
}
