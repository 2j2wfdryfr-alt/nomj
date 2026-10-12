const BIN_ID = "6acc89a6ac6210605a29c613";
const MASTER_KEY = "$2a$10$.eNyQiLipdVQkup9EqsCReuGAGJXnN3RGXprxbT.DnD1pcC48aHTe";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("NO");
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const key = (body.key || "").trim().toUpperCase();
    const userId = String(body.userId || "").trim();

    if (!key || !userId) {
      return res.status(200).send("NO_KEY_OR_ID");
    }

    // 读当前数据库
    const readRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { "X-Master-Key": MASTER_KEY }
    });
    const readData = await readRes.json();
    const data = readData.record || { keys: {} };

    if (!data.keys) data.keys = {};

    const slot = data.keys[key];

    // 密钥不存在
    if (!slot) {
      return res.status(200).send("NO_KEY");
    }

    // 已被别人绑定
    if (slot.userId && slot.userId !== userId) {
      return res.status(200).send("USED");
    }

    // 绑定
    data.keys[key] = { userId: userId, boundAt: new Date().toISOString() };

    // 写回数据库
    const writeRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": MASTER_KEY
      },
      body: JSON.stringify(data)
    });

    if (!writeRes.ok) {
      return res.status(200).send("WRITE_FAIL");
    }

    return res.status(200).send("OK");
  } catch (e) {
    return res.status(200).send("ERROR");
  }
}
