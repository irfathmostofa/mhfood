// Netlify serverless function — proxies SMS sends through BulkSMSBD
// so the API key never reaches the browser.
//
// Deployed automatically by Netlify at: /.netlify/functions/send-sms

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const API_KEY = process.env.BULKSMSBD_API_KEY;
  const SENDER_ID = process.env.BULKSMSBD_SENDER_ID;

  if (!API_KEY || !SENDER_ID) {
    return new Response(
      JSON.stringify({ error: 'SMS service is not configured.' }),
      { status: 500 }
    );
  }

  try {
    const { number, message } = await req.json();

    if (!number || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing number or message.' }),
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      api_key: API_KEY,
      senderid: SENDER_ID,
      number,
      message,
    });

    const smsResponse = await fetch(`https://bulksmsbd.net/api/smsapi?${params.toString()}`, {
      method: 'POST',
    });

    const result = await smsResponse.text();

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
