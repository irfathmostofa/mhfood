import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../hooks/useCart";
import { notifyOrderPlaced } from "../lib/emailjs";
import { sendOrderPlacedSMS } from "../lib/sms";
import { generateTrackingCode } from "../utils/trackingCode";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingContactButtons from "../components/FloatingContactButtons";
import BackToTop from "../components/BackToTop";

function pickBestDiscount(rules, subtotal) {
  const eligible = rules.filter(
    (r) =>
      subtotal >= r.min_amount &&
      (r.max_amount === null || subtotal <= r.max_amount),
  );
  if (eligible.length === 0) return null;

  let best = null;
  let bestAmount = 0;
  for (const rule of eligible) {
    const amount =
      rule.discount_type === "percentage"
        ? (subtotal * rule.discount_value) / 100
        : rule.discount_value;
    const capped = Math.min(amount, subtotal);
    if (capped > bestAmount) {
      bestAmount = capped;
      best = rule;
    }
  }
  return best ? { rule: best, amount: bestAmount } : null;
}

export default function Checkout() {
  const { items, totalAmount, clearCart, updateQuantity, removeItem } =
    useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [zones, setZones] = useState([]);
  const [zoneId, setZoneId] = useState("");
  const [siteSettings, setSiteSettings] = useState(null);
  const [discountRules, setDiscountRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPricingData() {
      const [{ data: zoneData }, { data: settingsData }, { data: ruleData }] =
        await Promise.all([
          supabase
            .from("delivery_zones")
            .select("*")
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),
          supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
          supabase.from("discount_rules").select("*").eq("is_active", true),
        ]);

      setZones(zoneData || []);
      if (zoneData && zoneData.length > 0) setZoneId(zoneData[0].id);
      setSiteSettings(settingsData || null);
      setDiscountRules(ruleData || []);
    }
    loadPricingData();
  }, []);

  const selectedZone = zones.find((z) => z.id === zoneId);
  const baseDeliveryCharge = selectedZone ? Number(selectedZone.charge) : 0;

  const freeDeliveryApplies =
    siteSettings?.free_delivery_enabled &&
    totalAmount >= Number(siteSettings.free_delivery_threshold || 0);

  const deliveryCharge = freeDeliveryApplies ? 0 : baseDeliveryCharge;

  const bestDiscount = pickBestDiscount(discountRules, totalAmount);
  const discountAmount = bestDiscount ? bestDiscount.amount : 0;

  const grandTotal = totalAmount - discountAmount + deliveryCharge;

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (items.length === 0) return;

    if (zones.length > 0 && !zoneId) {
      setError("Please select your delivery area.");
      return;
    }

    setLoading(true);
    setError("");

    const trackingCode = generateTrackingCode();

    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          tracking_code: trackingCode,
          customer_name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          total_amount: grandTotal,
          delivery_zone_id: zoneId || null,
          delivery_charge: deliveryCharge,
          discount_amount: discountAmount,
          discount_label: bestDiscount ? bestDiscount.rule.label : null,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const itemRows = items.map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        product_name: i.product_name,
        price: i.price,
        quantity: i.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemRows);
      if (itemsError) throw itemsError;

      // Decrement stock for each item (atomic, via Postgres function — avoids race conditions)
      await Promise.all(
        items.map((i) =>
          supabase.rpc("decrement_stock", {
            p_product_id: i.product_id,
            p_quantity: i.quantity,
          }),
        ),
      );

      // Fire confirmation emails (customer + admin) — non-blocking for the redirect
      notifyOrderPlaced({
        toEmail: form.email,
        customerName: form.name,
        phone: form.phone,
        address: form.address,
        trackingCode,
        items,
        delivery: selectedZone
          ? `${selectedZone.name} (${freeDeliveryApplies ? "FREE" : `৳${deliveryCharge}`})`
          : "N/A",
        totalAmount: grandTotal,
      }).catch(() => {
        // Order is already placed successfully even if the email fails
      });

      // Fire confirmation SMS — also non-blocking
      sendOrderPlacedSMS({
        phone: form.phone,
        customerName: form.name,
        trackingCode,
      }).catch(() => {
        // Order is already placed successfully even if the SMS fails
      });

      clearCart();
      navigate(`/track/${trackingCode}`, { state: { justPlaced: true } });
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong placing your order. Please try again.",
      );
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FBF8F3]">
        <Navbar />
        <FloatingContactButtons />
        <BackToTop />
        <div className="text-center py-24">
          <p className="text-lg text-[#1F2A24] mb-2">Your cart is empty</p>
          <a href="/" className="text-sm text-[#C77B4C] hover:underline">
            Continue shopping
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      <Navbar />
      <FloatingContactButtons />
      <BackToTop />

      <main className="max-w-4xl mx-auto px-5 py-8">
        <h1
          className="text-2xl sm:text-3xl text-[#1F2A24] mb-8"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Cart summary */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <h2 className="text-sm font-semibold text-[#1F2A24] mb-4">
              Order Summary
            </h2>
            <ul className="space-y-4 mb-4">
              {items.map((item) => (
                <li
                  key={item.product_id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-[#1F2A24] truncate">
                      {item.product_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product_id,
                            Math.max(1, item.quantity - 1),
                          )
                        }
                        className="w-6 h-6 flex items-center justify-center text-xs border border-[#E7E0D3] rounded-full hover:bg-[#F3EEE2]"
                      >
                        −
                      </button>
                      <span className="text-xs text-[#4A5049] w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product_id, item.quantity + 1)
                        }
                        className="w-6 h-6 flex items-center justify-center text-xs border border-[#E7E0D3] rounded-full hover:bg-[#F3EEE2]"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-xs text-red-500 hover:underline ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-[#1F2A24] shrink-0">
                    ৳{(item.price * item.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="border-t border-[#E7E0D3] pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm text-[#4A5049]">
                <span>Subtotal</span>
                <span>৳{totalAmount.toFixed(2)}</span>
              </div>

              {bestDiscount && (
                <div className="flex items-center justify-between text-sm text-emerald-600">
                  <span>{bestDiscount.rule.label}</span>
                  <span>−৳{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-[#4A5049]">
                <span>
                  Delivery{selectedZone ? ` (${selectedZone.name})` : ""}
                </span>
                {freeDeliveryApplies ? (
                  <span className="text-emerald-600 font-medium">FREE</span>
                ) : (
                  <span>৳{deliveryCharge.toFixed(2)}</span>
                )}
              </div>

              {siteSettings?.free_delivery_enabled && !freeDeliveryApplies && (
                <p className="text-xs text-[#8A8578]">
                  Add ৳
                  {(
                    Number(siteSettings.free_delivery_threshold) - totalAmount
                  ).toFixed(2)}{" "}
                  more for free delivery
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[#E7E0D3]">
                <p className="text-sm font-semibold text-[#1F2A24]">Total</p>
                <p className="text-lg font-semibold text-[#C77B4C]">
                  ৳{grandTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <form
              onSubmit={handleSubmit}
              className="space-y-4 bg-white border border-[#E7E0D3] rounded-2xl p-6"
            >
              <div>
                <label className="block text-sm font-medium text-[#1F2A24] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#E7E0D3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1F2A24]/20 focus:border-[#1F2A24]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2A24] mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#E7E0D3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1F2A24]/20 focus:border-[#1F2A24]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2A24] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#E7E0D3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1F2A24]/20 focus:border-[#1F2A24]"
                />
                <p className="text-xs text-[#8A8578] mt-1">
                  We'll send your order confirmation and tracking code here.
                </p>
              </div>
              {zones.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-[#1F2A24] mb-1">
                    Delivery Area
                  </label>
                  <select
                    value={zoneId}
                    onChange={(e) => handleZoneChange(e.target.value)}
                    className="w-full px-3 py-2.5 border border-[#E7E0D3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1F2A24]/20 focus:border-[#1F2A24] bg-white appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: "right 0.75rem center",
                      backgroundSize: "1.5rem",
                      backgroundRepeat: "no-repeat",
                      paddingRight: "2.5rem",
                    }}
                  >
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name} —{" "}
                        {freeDeliveryApplies ? (
                          <span className="text-emerald-600 font-medium">
                            FREE
                          </span>
                        ) : (
                          `৳${zone.charge}`
                        )}
                        {/* ৳{Number(zone.charge).toFixed(2)} */}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[#8A8578] mt-1">
                    Select your delivery area to see the applicable charge.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#1F2A24] mb-1">
                  Delivery Address
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="House, road, area — full address within your selected delivery zone"
                  className="w-full px-3 py-2.5 border border-[#E7E0D3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1F2A24]/20 focus:border-[#1F2A24]"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-[#1F2A24] text-[#FBF8F3] text-sm font-medium hover:bg-[#2D3A32] disabled:opacity-60 transition-colors"
              >
                {loading
                  ? "Placing order..."
                  : `Place Order — ৳${grandTotal.toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
