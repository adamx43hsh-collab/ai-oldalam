export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // Itt a "message"-t olvassuk ki, amit az index.html küld!
  const userMessage = req.body.message;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }]
      })
    });

    const data = await response.json();
    
    // Kicsomagoljuk a Google válaszát, és "reply" néven adjuk vissza
    const replyText = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: replyText });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Hiba az AI hívásakor. A séf épp kávézik!" });
  }
}
