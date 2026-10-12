const GITHUB_TOKEN = "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";
const GITHUB_USER = "2j2wfdryfr-alt";
const GITHUB_REPO = "keydata";
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

    const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/keys.json`;

    const readRes = await fetch(apiUrl, {
      headers: {
        "Authorization": `token ${GITHUB_TOKEN}`,
        "User-Agent": "vercel-genkey"
      }
    });
    const readData = await readRes.json();

    let current = { keys: {} };
    let sha = null;
    if (readData && readData.content) {
      sha = readData.sha;
      const decoded = Buffer.from(readData.content, "base64").toString("utf-8");
      try {
        current = JSON.parse(decoded);
      } catch (e) {
        current = { keys: {} };
      }
    }
    if (!current.keys) current.keys = {};

    const list = [];
    for (let i = 0; i < count; i++) {
      const whiteKey = "UI-" + rand(4) + "-" + rand(4) + "-" + rand(4);
      const cardKey = "CARD-" + rand(4) + "-" + rand(4) + "-" + rand(4);
      current.keys[whiteKey] = {
        userId: "",
        boundAt: "",
        cardKey: cardKey
      };
      list.push(whiteKey + " | " + cardKey);
    }

    const newContent = Buffer.from(JSON.stringify(current, null, 2)).toString("base64");
    const writeBody = {
      message: "gen keys",
      content: newContent
    };
    if (sha) writeBody.sha = sha;

    const writeRes = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Authorization": `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "vercel-genkey"
      },
      body: JSON.stringify(writeBody)
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
