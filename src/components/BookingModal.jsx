import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

/*const STK_ENDPOINT = "http://localhost:5001/api/mpesa/stkpush";


// tunatuma request kwa server ya port 5001 ndio tenje ipate M-Pesa STK prompt
async function sendStkRequest(phone, amount, packageTitle) {
  const response = await fetch(STK_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone,
      amount,
      packageTitle,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "STK Push haikuenda.");
  }

  return data.checkoutRequestId;
}*/
  async function sendStkRequest(phone, amount, packageTitle) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return `ws_CO_${Date.now()}`;
  }
function getPackageFare(pkg) {
  return Number(pkg.price ?? pkg.fare ?? 0);
}

// ku-lock fare kwa escrow kabla mambo hayajaeleweka
function BookingModal({ pkg, onClose, onBookingCreated }) {
  const { user } = useAuth();
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [venueNote, setVenueNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!pkg) {
    return null;
  }

  const fareAmount = getPackageFare(pkg);
  const formattedFare = fareAmount.toLocaleString();
   // browser isi reload
  async function handleFormSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    // safisha spaces 
    const cleanName = recipientName.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || !cleanPhone) {
      setErrorMessage("Weka jina na namba ya M-Pesa kwanza ndio tu-lock fare.");
      return;
    }

    setSubmitting(true);

    let checkoutRequestId = `ESCROW-${Date.now()}`;
    let paymentMode = "Escrow Lock (Offline Fallback)";

    try {
      checkoutRequestId = await sendStkRequest(cleanPhone, fareAmount, pkg.title);
      paymentMode = "Safaricom Daraja STK Push";
    } catch {
      // kama server ya port 5001 haijawashwa, bado tunasave escrow booking kwa Firestore
    }

    const bookingRecord = {
      packageId: pkg.id,
      packageTitle: pkg.title,
      venue: venueNote.trim() || pkg.venue || "Indoor / Hostel Spot",
      amount: fareAmount,
      recipientName: cleanName,
      phone: cleanPhone,
      status: "Held in Escrow",
      checkoutRequestId,
      paymentMode,
      senderEmail: user ? user.email : "guest@softlife.co.ke",
      senderId: user ? user.uid : "guest",
    };
     // save kwa firestore iki fail 
    try {
      const docRef = await addDoc(collection(db, "bookings"), {
        ...bookingRecord,
        createdAt: serverTimestamp(),
      });

      if (onBookingCreated) {
        onBookingCreated({ id: docRef.id, ...bookingRecord });
      }
      onClose();
    } catch (err) {
      console.error("Failed to save escrow booking:", err);
      setErrorMessage("Imeshindwa kusave booking kwa Firestore. Check rules ama network.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Book and Lock M-pesa Fare"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4"
    >
      <div className="w-full max-w-md border border-zinc-800 bg-black p-6 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <span className="inline-block bg-emerald-500/15 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-400">
              M-pesa Escrow
            </span>
            <h2 className="mt-2 text-xl font-extrabold text-white">
              {pkg.title}
            </h2>
            <p className="mt-1 text-sm font-bold text-emerald-400">
              -Fare &amp; Needs: KES ({formattedFare}).
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="border border-zinc-700 px-2.5 py-1 text-xs font-bold text-zinc-300 hover:border-white hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="recipient-name"
              className="block text-xs font-bold uppercase tracking-wider text-zinc-300"
            >
              Recipient Name
            </label>
            <input
              id="recipient-name"
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Stacy wa Rongai"
              className="mt-1.5 w-full border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-emerald-400"
              required
            />
          </div>

          <div>
            <label
              htmlFor="mpesa-phone"
              className="block text-xs font-bold uppercase tracking-wider text-zinc-300"
            >
              M-Pesa Phone Number
            </label>
            <input
              id="mpesa-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0794860835"
              className="mt-1.5 w-full border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-emerald-400"
              required
            />
          </div>

          <div>
            <label
              htmlFor="venue-note"
              className="block text-xs font-bold uppercase tracking-wider text-zinc-300"
            >
              Venue / Spot
            </label>
            <input
              id="venue-note"
              type="text"
              value={venueNote}
              onChange={(e) => setVenueNote(e.target.value)}
              placeholder={pkg.venue || "e.g. Gate B Hostels"}
              className="mt-1.5 w-full border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-emerald-400"
            />
          </div>

          {errorMessage && (
            <p className="border border-red-500/40 bg-red-950/60 px-3 py-2 text-xs font-semibold text-red-300">
              {errorMessage}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border border-zinc-700 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:border-white hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-500 px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {submitting
                ? "Locking Fare..."
                : `Book & Lock M-pesa Fare (KES ${formattedFare})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingModal;