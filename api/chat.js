export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // Ha a Vercel nem látja a kulcsot, azonnal szóljon:
  if (!apiKey) {
    return res.status(200).json({ reply: "Hiba: A Vercel nem találja a GEMINI_API_KEY-t! Csináltál Redeployt?" });
  }

  const userMessage = req.body.message || "Mit főzzek?";

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }]
      })
    });

    const data = await response.json();
    
    // Ha a Google visszadobja a kérést (pl. rossz a kulcs), kiírjuk a hibaüzenetét:
    if (data.error) {
      return res.status(200).json({ reply: `Google API Hiba: ${data.error.message}` });
    }
    
    // Ha minden szuper:
    const replyText = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: replyText });
    
  } catch (error) {
    // Ha bármi más összeomlik:
    res.status(200).json({ reply: `Szerver Hiba: ${error.message}` });
  }
}
