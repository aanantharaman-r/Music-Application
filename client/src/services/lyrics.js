import axios from "axios"

export const getLyrics = async (
  artist,
  title
) => {

  try {

    const res = await axios.get(
      `https://api.lyrics.ovh/v1/${artist}/${title}`
    )

    return res.data.lyrics

  } catch {

    return "Lyrics not found."

  }

}