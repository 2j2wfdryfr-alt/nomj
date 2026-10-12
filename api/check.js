const BIN_ID = "6acc8453ffd5d16053635c45";
const MASTER_KEY = "$2a$10$.eNyQiLipdVQkup9EqsCReuGAGJXnN3RGXprxbT.DnD1pcC48aHTe";

export default async function handler(req, res) {
  try {
    const userId = String(req.query.userId || "").trim();
    if (!userId) {
      return res.status(200).send("NO");
    }

    const readRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { "X-Master-Key": MASTER_KEY }
    });
    const readData = await readRes.json();
    const data = readData.record || { keys: {} };

    if (!data.keys) {
      return res.status(200).send("NO");
    }

    // 找有没有哪个密钥绑定了这个 userId
    for (const k in data.keys) {
      const slot = data.keys[k];
      if (slot && String(slot.userId) === userId) {
        return res.status(200).send("OK");
      }
    }

    return res.status(200).send("NO");
  } catch (e) {
    return res.status(200).send("NO");
  }
}
