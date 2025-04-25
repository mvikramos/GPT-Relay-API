
import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const body = await req.json();
    const { image_url } = body;

    if (!image_url) {
      return NextResponse.json({ error: 'Missing image_url' }, { status: 400 });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a financial assistant that extracts structured data from payment receipts.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract the amount, to/from, date (if visible), and description/purpose from this payment screenshot.' },
              { type: 'image_url', image_url: { url: image_url } }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ extracted: text });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
