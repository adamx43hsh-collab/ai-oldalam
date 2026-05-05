import { createClient } from 'redis';

export default async function handler(req, res) {
  // A Vercel által adott REDIS_URL-t használjuk (amit a képeden is láttunk)
  const client = createClient({
    url: process.env.REDIS_URL || process.env.STORAGE_URL
  });

  client.on('error', err => console.log('Redis Client Error', err));

  try {
    await client.connect();

    if (req.method === 'GET') {
      const data = await client.get('kamra_items');
      const items = data ? JSON.parse(data) : [];
      await client.disconnect();
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      const itemsStr = JSON.stringify(req.body.items || []);
      await client.set('kamra_items', itemsStr);
      await client.disconnect();
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    return res.status(200).json({ _error: true, üzenet: "Redis kapcsolódási hiba: " + error.message });
  }
}
