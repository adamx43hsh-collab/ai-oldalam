export default async function handler(req, res) {
  // A Vercel/Upstash általában ezeket a neveket adja, ha STORAGE a prefix:
  const url = process.env.STORAGE_REST_API_URL || process.env.STORAGE_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.STORAGE_REST_API_TOKEN || process.env.STORAGE_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return res.status(200).json({ 
      _error: true, 
      üzenet: "Az adatbázis csatlakoztatva van, de a kód nem találja a kulcsokat. Nézd meg a Vercel Settings -> Environment Variables fület!" 
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
    return res.status(200).json({ _error: true, üzenet: "Hiba: " + error.message });
  }
}
