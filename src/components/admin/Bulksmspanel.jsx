import { useState } from "react";
import { sendBulkSMS } from "../../lib/sms";

// Rough GSM-7 check — plain ASCII fits 160 chars/segment, anything with
// Bengali or other unicode characters drops to 70 chars/segment.
const GSM_REGEX = /^[\x00-\x7F]*$/;

export default function BulkSmsPanel({ allCustomers, selectedCustomers }) {
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState(null);

  const recipients = audience === "selected" ? selectedCustomers : allCustomers;
  const phones = recipients.map((c) => c.phone);

  const isGsm = GSM_REGEX.test(message);
  const segmentLimit = isGsm ? 160 : 70;
  const parts =
    message.length === 0 ? 0 : Math.ceil(message.length / segmentLimit);

  function handleAudienceChange(value) {
    setAudience(value);
    setConfirming(false);
    setResult(null);
  }

  function handleMessageChange(value) {
    setMessage(value);
    setConfirming(false);
    setResult(null);
  }

  async function handleSendClick() {
    if (!message.trim() || phones.length === 0 || sending) return;

    if (!confirming) {
      setConfirming(true);
      return;
    }

    setSending(true);
    setResult(null);
    try {
      await sendBulkSMS({ phones, message: message.trim() });
      setResult({
        type: "success",
        text: `Sent to ${phones.length} customer${phones.length !== 1 ? "s" : ""}.`,
      });
      setMessage("");
    } catch (err) {
      setResult({
        type: "error",
        text: err.message || "Failed to send bulk SMS.",
      });
    } finally {
      setSending(false);
      setConfirming(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-slate-900 mb-1">
        Send Offer via SMS
      </h2>
      <p className="text-xs text-slate-500 mb-4">
        Send a marketing message to your customers over SMS — uses the same
        BulkSMSBD sender as order notifications.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => handleAudienceChange("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            audience === "all"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All customers ({allCustomers.length})
        </button>
        <button
          type="button"
          onClick={() => handleAudienceChange("selected")}
          disabled={selectedCustomers.length === 0}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            audience === "selected"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Selected ({selectedCustomers.length})
        </button>
      </div>

      <textarea
        rows={4}
        value={message}
        onChange={(e) => handleMessageChange(e.target.value)}
        placeholder="e.g. This weekend only — 15% off your next order! Reply STOP to opt out."
        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
      />

      <p className="text-xs text-slate-400 mt-2 mb-4">
        {message.length} character{message.length !== 1 ? "s" : ""}
        {parts > 0 &&
          ` · ~${parts} SMS segment${parts !== 1 ? "s" : ""} (${isGsm ? "GSM" : "Unicode"})`}
      </p>

      {result && (
        <p
          className={`text-sm rounded-lg px-3 py-2 mb-4 ${
            result.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {result.text}
        </p>
      )}

      <button
        type="button"
        onClick={handleSendClick}
        disabled={!message.trim() || phones.length === 0 || sending}
        className={`w-full sm:w-auto px-5 py-2.5 rounded-full text-sm font-medium text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
          confirming
            ? "bg-amber-600 hover:bg-amber-700"
            : "bg-emerald-600 hover:bg-emerald-700"
        }`}
      >
        {sending
          ? "Sending..."
          : confirming
            ? `Confirm — send to ${phones.length} customer${phones.length !== 1 ? "s" : ""}?`
            : `Send to ${phones.length} customer${phones.length !== 1 ? "s" : ""}`}
      </button>
    </div>
  );
}
