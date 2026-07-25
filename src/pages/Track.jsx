// new
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingContactButtons from "../components/FloatingContactButtons";
import BackToTop from "../components/BackToTop";

const STEPS = [
  { key: "pending", label: "Received" },
  { key: "confirmed", label: "Confirmed" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

export default function Track() {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const justPlaced = location.state?.justPlaced;

  const [inputCode, setInputCode] = useState(code || "");
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(!!code);
  const [error, setError] = useState("");

  useEffect(() => {
    if (code) {
      lookupOrder(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function lookupOrder(trackingCode) {
    setLoading(true);
    setError("");
    setOrder(null);

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("tracking_code", trackingCode.trim().toUpperCase())
      .maybeSingle();

    if (orderError || !orderData) {
      setError(
        "No order found with that tracking code. Please check and try again.",
      );
      setLoading(false);
      return;
    }

    const { data: itemRows } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderData.id);

    setOrder(orderData);
    setItems(itemRows || []);
    setLoading(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    if (!inputCode.trim()) return;
    navigate(`/track/${inputCode.trim().toUpperCase()}`);
  }

  const isCancelled = order?.status === "cancelled";
  const currentStepIndex = order
    ? STEPS.findIndex((s) => s.key === order.status)
    : -1;

  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      <Navbar />
      <FloatingContactButtons />
      <BackToTop />

      <main className="max-w-2xl mx-auto px-5 py-12">
        {justPlaced && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl px-5 py-4 mb-8">
            Your order has been placed! A confirmation email is on its way —
            save this tracking code to check your order status anytime.
          </div>
        )}

        <h1
          className="text-2xl sm:text-3xl text-[#1F2A24] mb-6"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Track Your Order
        </h1>

        <form onSubmit={handleSearch} className="flex gap-2 mb-10">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Enter tracking code, e.g. TRK-8F2K9"
            className="flex-1 px-4 py-3 border border-[#E7E0D3] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1F2A24]/20 focus:border-[#1F2A24]"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-full bg-[#1F2A24] text-[#FBF8F3] text-sm font-medium hover:bg-[#2D3A32] transition-colors"
          >
            Track
          </button>
        </form>

        {loading && (
          <p className="text-sm text-[#8A8578]">Looking up your order...</p>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {order && (
          <div className="bg-white border border-[#E7E0D3] rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#8A8578] mb-1">
                  Tracking Code
                </p>
                <p className="text-lg font-semibold text-[#1F2A24]">
                  {order.tracking_code}
                </p>
              </div>
              <p className="text-sm text-[#8A8578]">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>

            {isCancelled ? (
              <div className="mb-8 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                This order has been cancelled.
              </div>
            ) : (
              <div className="mb-8">
                <div className="flex items-start">
                  {STEPS.map((step, i) => (
                    <div
                      key={step.key}
                      className="flex items-center flex-1 last:flex-none"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-medium shrink-0 ${
                            i <= currentStepIndex
                              ? "bg-[#1F2A24] text-[#FBF8F3]"
                              : "bg-[#F3EEE2] text-[#8A8578]"
                          }`}
                        >
                          {i < currentStepIndex ? "✓" : i + 1}
                        </div>
                        <p
                          className={`text-[9px] sm:text-xs mt-1.5 sm:mt-2 text-center w-12 sm:w-20 leading-tight ${
                            i <= currentStepIndex
                              ? "text-[#1F2A24] font-medium"
                              : "text-[#8A8578]"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-0.5 sm:mx-1 mt-3 sm:mt-4 ${
                            i < currentStepIndex
                              ? "bg-[#1F2A24]"
                              : "bg-[#F3EEE2]"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-[#E7E0D3] pt-5">
              <p className="text-sm font-medium text-[#1F2A24] mb-3">Items</p>
              <ul className="space-y-2 mb-5">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between text-sm text-[#4A5049]"
                  >
                    <span>
                      {item.product_name} × {item.quantity}
                    </span>
                    <span>৳{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-1.5 border-t border-[#E7E0D3] pt-3">
                <div className="flex justify-between text-sm text-[#4A5049]">
                  <span>Subtotal</span>
                  <span>
                    ৳
                    {(
                      Number(order.total_amount) -
                      Number(order.delivery_charge || 0) +
                      Number(order.discount_amount || 0)
                    ).toFixed(2)}
                  </span>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>{order.discount_label || "Discount"}</span>
                    <span>−৳{Number(order.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-[#4A5049]">
                  <span>Delivery</span>
                  <span>
                    {Number(order.delivery_charge) === 0 ? (
                      <span className="text-emerald-600 font-medium">FREE</span>
                    ) : (
                      `৳${Number(order.delivery_charge || 0).toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#1F2A24] border-t border-[#E7E0D3] pt-2">
                  <span>Total</span>
                  <span>৳{order.total_amount}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#E7E0D3] mt-5 pt-5 text-sm text-[#4A5049]">
              <p className="font-medium text-[#1F2A24] mb-1">
                Delivery Address
              </p>
              <p>{order.address}</p>
              <p className="mt-1">{order.phone}</p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
