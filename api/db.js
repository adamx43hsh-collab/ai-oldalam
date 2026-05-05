export default async function handler(req, res) {
  // Mindkét lehetséges kulcsnevet megpróbáljuk (KV vagy Upstash Redis)
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return res.status(500).json({ error: 'Nincs bekapcsolva az adatbázis!' });
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
    return res.status(500).json({ error: 'Adatbázis hiba történt.' });
  }
}
