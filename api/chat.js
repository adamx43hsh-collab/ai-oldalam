export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(200).json({ reply: "Hiba: A Vercel nem találja a GEMINI_API_KEY-t!" });
  }

  const userMessage = req.body.message || "Mit főzzek ma?";

  try {
    // 1. A modell nevének pontosítása: gemini-1.5-flash-latest
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // 2. Rendszerutasítás (systemInstruction) a hivatalos v1beta 1.5 formátumban
        systemInstruction: {
          parts: [{ text: "Te egy profi magyar háztartásvezető és séf AI vagy. A felhasználó kamrájában lévő alapanyagok, fogyasztási statisztikák és a saját mentett receptjei alapján válaszolj. Válaszaid legyenek kedvesek, hasznosak, és használj szép Markdown formázást (vastagítás, áttekinthető listák)!" }]
        },
        contents: [{ 
          parts: [{ text: userMessage }] 
        }]
      })
    });

    const data = await response.json();
    
    // Hibakezelés és naplózás a Vercel logokhoz
    if (data.error) {
       console.error("Google API Részletes Hiba:", JSON.stringify(data.error, null, 2));
       return res.status(200).json({ reply: `Google API Hiba: ${data.error.message}` });
    }
    
    // Biztonsági ellenőrzés a válasz tartalmára
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        return res.status(200).json({ reply: "Sajnos az AI most nem tudott válaszolni. Kérlek, próbáld újra pár másodperc múlva!" });
    }
    
    const replyText = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: replyText });
    
  } catch (error) {
    console.error("Szerver oldali hiba:", error);
    res.status(200).json({ reply: `Szerver Hiba: ${error.message}` });
  }
}
