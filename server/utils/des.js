import crypto from "crypto"

export function decryptJioSaavnMediaUrl(encryptedBase64, keyString = "38346591") {
  if (!encryptedBase64) return ""
  try {
    const decipher = crypto.createDecipheriv("des-ecb", Buffer.from(keyString, "utf-8"), null)
    let decrypted = decipher.update(encryptedBase64, "base64", "utf-8")
    decrypted += decipher.final("utf-8")
    decrypted = decrypted.replace(/_96\.mp4|_96\.mp3|_160\.mp4|_160\.mp3|_320\.mp3/g, "_320.mp4").replace("http://", "https://")
    return decrypted
  } catch (e) {
    console.error("DES decryption failed:", e)
    return ""
  }
}
