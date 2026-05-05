export default async function handler(req, res) {
  // Megpróbáljuk a sima REDIS_URL-t, amit a képen láttunk
  let url = process.env.REDIS_URL || process.env.STORAGE_URL || process.env.UPSTASH_REDIS_REST_URL;
  let token = process.env.STORAGE_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  // MÁGIA: Ha csak REDIS_URL van (mint nálad), szétbontjuk!
  if (url && url.startsWith('redis://')) {
    try {
      // redis://default:TOKEN@HOST:6379 -> ebből kiszedjük a HOST-ot és a TOKEN-t
      const parts = url.replace('redis://', '').split('@');
      const auth = parts[0].split(':');
      const host = parts[1].split(':')[0];
      
      token = auth[1]; // Ez a jelszó
      url = `https://${host}`; // Ez lesz a REST API címe
    } catch (e) {
      return res.status(200).json({ _error: true, üzenet: "Hiba a REDIS_URL szétbontásakor!" });
    }
  }

  if (!url || !token) {
    return res.status(200).json({ 
      _error: true, 
      üzenet: "Még mindig hiányzik valami! Nézd meg a Vercel Settings-ben, hogy a REDIS_URL ott van-e!" 
    });
  }

  try {
    if (req.method === 'GET') {
      const response = await fetch(`${url}/get/kamra_items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      const items = data.result ? JSON.parse(data.result) : [];
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      const itemsStr = JSON.stringify(req.body.items || []);
      await fetch(`${url}/set/kamra_items`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: itemsStr
      });
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    return res.status(200).json({ _error: true, üzenet: "Szerver hiba: " + error.message });
  }
}
