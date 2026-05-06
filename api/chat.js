export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(200).json({ reply: "Hiba: A Vercel nem találja a GEMINI_API_KEY-t!" });
  }

  const userMessage = req.body.message || "Mit főzzek?";

  try {
    // 1. Átállítva a legstabilabb, leggyorsabb ingyenes modellre
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }],
        // 2. Hozzáadva a rendszerutasítás, hogy szép, formázott választ adjon!
        systemInstruction: {
          parts: [{ text: "Te egy profi magyar háztartásvezető és séf AI vagy. A felhasználó kamrájában lévő alapanyagok, fogyasztási statisztikák és a saját mentett receptjei alapján válaszolj. Válaszaid legyenek kedvesek, hasznosak, és használj szép Markdown formázást (vastagítás, áttekinthető listák)!" }]
        }
      })
    });

    const data = await response.json();
    
    // Kezeljük, ha a Google "High demand" vagy más hibát dob
    if (data.error) {
       console.error("Google API Hiba részletek:", data.error);
       return res.status(200).json({ reply: `Google API Hiba: ${data.error.message}` });
    }
    
    // Biztonsági ellenőrzés, hogy tényleg van-e szöveges válasz
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0].text) {
        return res.status(200).json({ reply: "Sajnos az AI nem tudott értelmezhető választ generálni. Kérlek próbáld újra!" });
    }
    
    const replyText = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: replyText });
    
  } catch (error) {
    console.error("Szerver hiba:", error);
    res.status(200).json({ reply: `Szerver Hiba: ${error.message}` });
  }
}
