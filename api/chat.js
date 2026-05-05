export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(200).json({ reply: "Hiba: A Vercel nem találja a GEMINI_API_KEY-t!" });
  }

  const userMessage = req.body.message || "Mit főzzek?";

  try {
    // IDE FIGYELJ: Itt átírtuk a modellt gemini-2.5-flash-re!
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(200).json({ reply: `Google API Hiba: ${data.error.message}` });
    }
    
    const replyText = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: replyText });
    
  } catch (error) {
    res.status(200).json({ reply: `Szerver Hiba: ${error.message}` });
  }
}
