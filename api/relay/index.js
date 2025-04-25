export default async function handler(req, res) {
  try {
    // Ensure the request method is POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const body = req.body;
    const { image_url } = body;

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
            content: "You are a financial assistant that extracts structured data from payment receipts.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract the amount, to/from, date (if visible), and description/purpose from this payment screenshot." },
              { type: "image_url", image_url: { url: image_url } },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    return res.status(200).json({ extracted: text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
