const BIN_ID = "6acc89a6ac6210605a29c613";
const MASTER_KEY = "$2a$10$.eNyQiLipdVQkup9EqsCReuGAGJXnN3RGXprxbT.DnD1pcC48aHTe";
const ADMIN_PASSWORD = "MyKey2026!";

function rand(n) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("NO");
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const pw = body.password || "";
    const count = Math.min(Math.max(parseInt(body.count) || 10, 1), 50);

    if (pw !== ADMIN_PASSWORD) return res.status(200).send("BAD_PW");

    const url = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;

    const readRes = await fetch(url, {
      headers: { "X-Master-Key": MASTER_KEY }
    });
    const readData = await readRes.json();
    const data = readData.record || { keys: {} };
    if (!data.keys) data.keys = {};

    const list = [];
    for (let i = 0; i < count; i++) {
      const whiteKey = "UI-" + rand(4) + "-" + rand(4) + "-" + rand(4);
      const cardKey = "CARD-" + rand(4) + "-" + rand(4) + "-" + rand(4);
      data.keys[whiteKey] = {
        userId: "",
        boundAt: "",
        cardKey: cardKey
      };
      list.push(cardKey);
    }

    const writeRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": MASTER_KEY
      },
      body: JSON.stringify(data)
    });

    if (!writeRes.ok) {
      const errText = await writeRes.text();
      return res.status(200).send("WRITE_FAIL: " + errText.slice(0, 200));
    }

    return res.status(200).send(list.join("\n"));
  } catch (e) {
    return res.status(200).send("ERROR: " + e.message);
  }
}
