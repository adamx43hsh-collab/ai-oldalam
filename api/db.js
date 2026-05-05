export default async function handler(req, res) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  // 1. Hiba: Nincsenek meg a kulcsok a Vercelen
  if (!url || !token) {
    return res.status(200).json({ 
      _error: true, 
      üzenet: "A Vercel nem találja az adatbázis kulcsait (UPSTASH_REDIS_REST_URL). Nézd meg a Settings -> Environment Variables menüt, és nyomj egy Redeployt!" 
    });
  }

  try {
    if (req.method === 'GET') {
      const response = await fetch(`${url}/get/kamra_items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      // 2. Hiba: Az adatbázis visszadobta a kérést
      if (data.error) {
        return res.status(200).json({ _error: true, üzenet: `Adatbázis hiba: ${data.error}` });
      }

      const items = data.result ? JSON.parse(data.result) : [];
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      const itemsStr = JSON.stringify(req.body.items || []);
      const response = await fetch(`${url}/set/kamra_items`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: itemsStr
      });
      const data = await response.json();
      
      if (data.error) {
        return res.status(200).json({ _error: true, üzenet: `Mentési hiba: ${data.error}` });
      }
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    // 3. Hiba: Szerver összeomlás
    return res.status(200).json({ _error: true, üzenet: `Szerver hiba: ${error.message}` });
  }
}
