export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(200).json({ reply: "Hiba: A Vercel nem találja a GEMINI_API_KEY-t!" });
  }

  const userMessage = req.body.message || "Mit főzzek?";

  try {
    // Átállítva v1-re (stabil verzió) és a pontos modell névre
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }],
        systemInstruction: {
          parts: [{ text: "Te egy profi magyar háztartásvezető és séf AI vagy. A felhasználó kamrájában lévő alapanyagok, fogyasztási statisztikák és a saját mentett receptjei alapján válaszolj. Válaszaid legyenek kedvesek, hasznosak, és használj szép Markdown formázást (vastagítás, áttekinthető listák)!" }]
        }
      })
    });

    const data = await response.json();
    
    if (data.error) {
       // Ha még mindig hibát dob, megpróbáljuk systemInstruction nélkül (néha a v1 és a systemInstruction kombinációja érzékeny)
       console.error("API Hiba:", data.error);
       return res.status(200).json({ reply: `Google API Hiba: ${data.error.message}` });
    }
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        return res.status(200).json({ reply: "Sajnos az AI nem tudott választ generálni. Próbáld újra!" });
    }
    
    const replyText = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: replyText });
    
  } catch (error) {
    res.status(200).json({ reply: `Szerver Hiba: ${error.message}` });
  }
}
