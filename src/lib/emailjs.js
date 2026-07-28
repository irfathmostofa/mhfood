import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const TEMPLATE_CONFIRM = import.meta.env.VITE_EMAILJS_TEMPLATE_CONFIRM;
const TEMPLATE_DELIVERED = import.meta.env.VITE_EMAILJS_TEMPLATE_DELIVERED;

emailjs.init(PUBLIC_KEY);

// Format order items into a readable block for the email body
function formatItems(items) {
  return items
    .map((i) => `${i.product_name} x${i.quantity} - ৳${i.price}`)
    .join("\n");
}

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

// Shared template sent to the customer (as confirmation) and the admin
// (as a new-order alert) — same template_order_placed, different content/recipient.
export async function sendOrderPlacedEmail({
  toEmail,
  customerName,
  phone,
  address,
  trackingCode,
  items,
  delivery,
  totalAmount,
  audience, // 'customer' | 'admin'
}) {
  const trackingLink = `${window.location.origin}/track/${trackingCode}`;

  const copy =
    audience === "admin"
      ? {
          heading: "New Order Received",
          intro_text: "A new order just came in. Details below:",
          button_text: "View Order",
          footer_text:
            "Open the admin panel to confirm and process this order.",
        }
      : {
          heading: `Thank you for your order, ${customerName}!`,
          intro_text: "We've received your order and it's now being processed.",
          button_text: "Track Your Order",
          footer_text:
            "If you have any questions about your order, just reply to this email.",
        };

  return emailjs.send(SERVICE_ID, TEMPLATE_CONFIRM, {
    to_email: audience === "admin" ? ADMIN_EMAIL : toEmail,
    from_name: "MHFood",
    customer_name: customerName,
    phone,
    address,
    tracking_code: trackingCode,
    delivery: delivery,
    tracking_link: trackingLink,
    order_items: formatItems(items),
    total_amount: totalAmount,
    ...copy,
  });
}

// Convenience wrapper — fires both emails after a successful order insert
export async function notifyOrderPlaced(orderData) {
  await Promise.all([
    sendOrderPlacedEmail({ ...orderData, audience: "customer" }),
    sendOrderPlacedEmail({ ...orderData, audience: "admin" }),
  ]);
}

export async function sendOrderDeliveredEmail({
  toEmail,
  customerName,
  trackingCode,
  delivery,
  orderId,
  items,
}) {
  const reviewLink = `${window.location.origin}/review/${orderId}`;

  return emailjs.send(SERVICE_ID, TEMPLATE_DELIVERED, {
    to_email: toEmail,
    from_name: "MHFood",
    customer_name: customerName,
    tracking_code: trackingCode,
    delivery: delivery,
    review_link: reviewLink,
    order_items: formatItems(items),
  });
}
