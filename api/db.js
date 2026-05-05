export default async function handler(req, res) {
  // A Vercel automatikusan adja ezeket a kulcsokat az új adatbázishoz
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return res.status(500).json({ error: 'Nincs bekapcsolva a Vercel KV adatbázis!' });
  }

  try {
    // HA OLVASNI AKARUNK AZ ADATBÁZISBÓL (Amikor valaki megnyitja az oldalt)
    if (req.method === 'GET') {
      const response = await fetch(`${url}/get/kamra_items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      // Ha még üres, adjon vissza egy üres listát
      const items = data.result ? JSON.parse(data.result) : [];
      return res.status(200).json(items);
    }

    // HA ÍRNI AKARUNK (Amikor hozzáadsz, törölsz vagy fogyasztasz)
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
