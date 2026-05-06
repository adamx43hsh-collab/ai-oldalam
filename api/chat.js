export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(200).json({ reply: "Hiba: A Vercel nem találja a környezeti változót (GEMINI_API_KEY)!" });
  }

  const userMessage = req.body.message || "Mit főzzek ma?";

  try {
    // Visszaállva v1beta-ra és a biztos modell névre
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: userMessage }] 
        }],
        // JAVÍTÁS: aláírás (snake_case) kell: system_instruction
        system_instruction: {
          parts: [{ text: "Te egy profi magyar háztartásvezető és séf AI vagy. A felhasználó kamrájában lévő alapanyagok, fogyasztási statisztikák és a saját mentett receptjei alapján válaszolj. Válaszaid legyenek kedvesek, hasznosak, és használj szép Markdown formázást (vastagítás, áttekinthető listák)!" }]
        }
      })
    });

    const data = await response.json();
    
    if (data.error) {
       console.error("Google API Hiba részletek:", data.error);
       return res.status(200).json({ reply: `Google API Hiba: ${data.error.message}` });
    }
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        return res.status(200).json({ reply: "Sajnos az AI most nem tudott válaszolni. Kérlek, próbáld újra!" });
    }
    
    const replyText = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: replyText });
    
  } catch (error) {
    console.error("Szerver oldali hiba:", error);
    res.status(200).json({ reply: `Szerver Hiba: ${error.message}` });
  }
}
