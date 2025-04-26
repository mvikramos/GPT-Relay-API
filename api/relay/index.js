export default async function handler(req, res) {
  try {
    // Ensure the request method is POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const body = req.body;
    const { image_url } = body;
    console.log("🖼️ Incoming image_url:", image_url);

    if (!image_url) {
      return res.status(400).json({ error: "Missing image_url" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `
        You are a smart financial assistant. 
        Extract clear, structured payment data from receipts or screenshots. 
        Return ONLY the following fields inside a top-level object called "extracted":
        
        - date (as YYYY-MM-DD)
        - amount (number only)
        - to_from (name of person or business paid or received from)
        - particulars (short description or label for the payment)
        
        Format your response ONLY like this:
        { 
          "extracted": { 
            "date": "2025-04-15", 
            "amount": "2300", 
            "to_from": "Juju Club", 
            "particulars": "payment for March" 
          } 
        }
        Do NOT include any notes or commentary.
            `.trim()
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract and structure this receipt data." },
              { type: "image_url", image_url: { url: image_url } }
            ]
          }
        ],
      }),
    });

    const data = await response.json();
    console.log("🔍 GPT response:", JSON.stringify(data, null, 2));
    const text = data.choices?.[0]?.message?.content || "";

    return res.status(200).json({ extracted: text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
