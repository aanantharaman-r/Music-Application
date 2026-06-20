export const getLyrics = async (artist, title, songId, provider) => {
  const cleanTitle = title
    ? title.replace(/\(.*?\)|\[.*?\]|official video|official audio|lyric video|video|hd/gi, "").trim()
    : ""
  const cleanArtist = artist
    ? artist.replace(/\(.*?\)|\[.*?\]|vevo|official/gi, "").trim()
    : ""

  const fetchWithTimeout = async (url, timeoutMs = 4000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (!response.ok) throw new Error("Network error");
      return await response.json();
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  };

  // 1. Try JioSaavn API first
  if (provider === "jiosaavn" && songId) {
    try {
      const data = await fetchWithTimeout(`https://saavn.dev/api/songs/${songId}/lyrics`, 3000);
      if (data && data.success && data.data && data.data.lyrics) {
        return data.data.lyrics;
      }
    } catch (err) {
      console.log("JioSaavn lyrics API failed:", err.message || err);
    }
  }

  // 2. Try Fallback lyrics.ovh
  try {
    const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.lyrics) {
        return data.lyrics;
      }
    }
  } catch (err) {
    console.log("lyrics.ovh API failed:", err.message || err);
  }

  return "Lyrics not found for this track.";
};