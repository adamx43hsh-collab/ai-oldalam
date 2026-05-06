export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(200).json({ reply: "Hiba: A Vercel nem találja a GEMINI_API_KEY-t!" });
  }

  try {
    // A Google ListModels végpontját hívjuk meg
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.error) {
       return res.status(200).json({ reply: `API Lekérdezési hiba: ${data.error.message}` });
    }

    // Kiszűrjük azokat a modelleket, amik tudnak szöveget generálni (generateContent)
    const availableModels = data.models
      .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
      .map(m => `- **${m.name.replace('models/', '')}** (Verzió: ${m.version})`)
      .join('\n');

    const replyText = `### Nyomozás sikeres!\n\nA te API kulcsoddal jelenleg ezeket a modelleket lehet használni szöveggenerálásra:\n\n${availableModels}\n\n*Kérlek, másold ki nekem a listából az egyiket, amiben szerepel a 'gemini' szó!*`;

    res.status(200).json({ reply: replyText });
    
  } catch (error) {
    res.status(200).json({ reply: `Szerver Hiba a lekérdezésnél: ${error.message}` });
  }
}
