// Calls our own Netlify function, which forwards to BulkSMSBD server-side.
// Never call bulksmsbd.net directly from the browser — it would expose the API key.

async function sendSMS(number, message) {
  const res = await fetch('/.netlify/functions/send-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ number, message }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to send SMS');
  }

  return res.json();
}

// BulkSMSBD expects Bangladeshi numbers like 8801XXXXXXXXX (no +, no spaces)
function normalizeBdNumber(phone) {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('880')) return digits;
  if (digits.startsWith('0')) return `88${digits}`;
  return `880${digits}`;
}

export async function sendOrderPlacedSMS({ phone, customerName, trackingCode }) {
  const number = normalizeBdNumber(phone);
  const message = `Hi ${customerName}, your order has been placed! Tracking code: ${trackingCode}. Track it anytime on our website.`;
  return sendSMS(number, message);
}

export async function sendOrderDeliveredSMS({ phone, customerName, trackingCode }) {
  const number = normalizeBdNumber(phone);
  const message = `Hi ${customerName}, your order (${trackingCode}) has been delivered! We'd love your feedback — check your email for the review link.`;
  return sendSMS(number, message);
}
