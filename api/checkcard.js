const BIN_ID = "6acc89a6ac6210605a29c613";
const MASTER_KEY = "$2a$10$.eNyQiLipdVQkup9EqsCReuGAGJXnN3RGXprxbT.DnD1pcC48aHTe";

export default async function handler(req, res) {
  try {
    const card = (req.query.card || "").trim().toUpperCase();
    const userId = String(req.query.userId || "").trim();

    if (!card || !userId) return res.status(200).send("NO");

    const readRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { "X-Master-Key": MASTER_KEY }
    });
    const readData = await readRes.json();
    const data = readData.record || { keys: {} };

    if (!data.keys) return res.status(200).send("NO");

    for (const k in data.keys) {
      const slot = data.keys[k];
      if (slot && slot.cardKey && slot.cardKey.toUpperCase() === card) {
        if (String(slot.userId) === userId) {
          return res.status(200).send("OK");
        } else {
          return res.status(200).send("WRONG_USER");
        }
      }
    }
    return res.status(200).send("NO_CARD");
  } catch (e) {
    return res.status(200).send("NO");
  }
}
