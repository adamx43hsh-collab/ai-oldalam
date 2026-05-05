export default async function handler(req, res) {
  // A kulcsot a Vercel környezeti változóiból olvassuk ki
  const apiKey = process.env.GEMINI_API_KEY;
  const { prompt } = req.body;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Hiba az AI hívásakor" });
  }
}