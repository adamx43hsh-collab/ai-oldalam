export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(200).json({ reply: "Hiba: A Vercel nem találja a GEMINI_API_KEY-t!" });
  }

  const userMessage = req.body.message || "Mit főzzek ma?";

  try {
    // Visszatérünk a legstabilabb URL-re és modell névre
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: userMessage }] 
        }],
        // JAVÍTÁS: Itt kötelező a snake_case (system_instruction)
        system_instruction: {
          parts: [{ text: "Te egy profi magyar háztartásvezető és séf AI vagy. A felhasználó kamrájában lévő alapanyagok, fogyasztási statisztikák és a saját mentett receptjei alapján válaszolj. Válaszaid legyenek kedvesek, hasznosak, és használj szép Markdown formázást (vastagítás, áttekinthető listák)!" }]
        }
      })
    });

    const data = await response.json();
    
    // Ha a Google hibát dob, azt itt látni fogjuk
    if (data.error) {
       console.error("Google API Részletes Hiba:", JSON.stringify(data.error, null, 2));
       return res.status(200).json({ reply: `Google API Hiba: ${data.error.message}` });
    }
    
    // Ellenőrizzük, hogy van-e érvényes válasz
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
