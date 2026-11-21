import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function getBadgeStyle(status) {
  if (status === "Released") {
    return "bg-black text-white";
  }
  if (status === "Refunded") {
    return "bg-red-600 text-white";
  }
  // pesa zikiwa bado zime-lock kwa escrow
  return "bg-emerald-500/20 text-emerald-900";
}

// tunafuatilia status ya booking kwa ID ama live listener kutoka Firestore
function StatusTracker({ initialBooking, onBookingLoaded, onClear }) {
  const [booking, setBooking] = useState(initialBooking || null);
  const [bookingIdInput, setBookingIdInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [gpsPinInput, setGpsPinInput] = useState("");
  const [confirmingArrival, setConfirmingArrival] = useState(false);


  useEffect(() => {
    setBooking(initialBooking || null);
    
    if (!initialBooking || !initialBooking.id) {
      return undefined;
    }

    const docRef = doc(db, "bookings", initialBooking.id);
    //attach id kwa booking firestore ikichange
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setBooking({ id: snapshot.id, ...snapshot.data() });
      }
    });

    return () => unsubscribe();
  }, [initialBooking]);

  async function handleLookupSubmit(event) {
    event.preventDefault();
    setFeedback("");
   //validate msee ameeka id
    const targetId = bookingIdInput.trim();
    if (!targetId) {
      setFeedback("Weka Booking ID kwanza ndio tu-check status.");
      return;
    }

    setLoadingLookup(true);

    try {
      const snap = await getDoc(doc(db, "bookings", targetId));
      if (!snap.exists()) {
        setFeedback("Hakuna booking iliyopatikana na hiyo Booking ID.");
        return;
      }

      const foundBooking = { id: snap.id, ...snap.data() };
      setBooking(foundBooking);
      if (onBookingLoaded) {
        onBookingLoaded(foundBooking);
      }
    } catch (err) {
      console.error("Booking lookup error:", err);
      setFeedback("Imeshindwa ku-check status sasa hivi.");
    } finally {
      setLoadingLookup(false);
    }
  }
  async function handleConfirmArrival(event) {
  event.preventDefault();
  if (!booking || !booking.id) return;

  const cleanGpsPin = gpsPinInput.trim();
  if (!cleanGpsPin) {
    setFeedback("Weka GPS coordinates au paste Google Maps location pin.");
    return;
  }

  setConfirmingArrival(true);
  setFeedback("");

  try {
    const arrivedAt = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    await updateDoc(doc(db, "bookings", booking.id), {
      status: "Arrived - Ready to Release",
      arrivedAt,
      gpsPin: cleanGpsPin,
    });

    setBooking((prev) => ({
      ...prev,
      status: "Arrived - Ready to Release",
      arrivedAt,
      gpsPin: cleanGpsPin,
    }));
    setGpsPinInput("");
  } catch (err) {
    setFeedback("Imeshindwa ku-confirm arrival, jaribu tena.");
  } finally {
    setConfirmingArrival(false);
  }
}

  const currentStatus = booking ? booking.status || "Held in Escrow" : "";

  return (
    <section
      aria-label="Track your fiance's live status"
      className="bg-zinc-100 p-6 text-black shadow-lg"
    >
      <h2 className="text-center text-2xl font-extrabold tracking-tight text-black sm:text-3xl">
        Track your fiance’s live status
      </h2>

      <form
        onSubmit={handleLookupSubmit}
        className="mx-auto mt-5 flex max-w-2xl flex-col gap-2 sm:flex-row"
      >
        <input
          type="text"
          value={bookingIdInput}
          onChange={(e) => setBookingIdInput(e.target.value)}
          placeholder="Booking ID"
          aria-label="Booking ID"
          className="flex-1 rounded-sm border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-black placeholder-zinc-400 outline-none focus:border-black"
        />

        <button
          type="submit"
          disabled={loadingLookup}
          className="rounded-sm bg-black px-6 py-2.5 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {loadingLookup ? "Checking..." : "Check status"}
        </button>
      </form>

      {feedback && (
        <p className="mt-3 text-center text-xs font-bold text-red-600">
          {feedback}
        </p>
      )}

      {booking && (
        <div className="mx-auto mt-6 max-w-2xl border border-zinc-300 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Booking ID:{" "}
                <span className="font-mono text-black">{booking.id}</span>
              </p>
              <h3 className="mt-0.5 text-base font-extrabold text-black">
                {booking.packageTitle}
              </h3>
              <p className="text-xs text-zinc-700">
                Recipient:{" "}
                <span className="font-bold text-black">
                  {booking.recipientName}
                </span>{" "}
                ({booking.phone}) •{" "}
                <span className="font-extrabold text-black">
                  KES {Number(booking.amount || 0).toLocaleString()}
                </span>
              </p>
              {booking.checkoutRequestId && (
                <p className="mt-0.5 text-[11px] text-zinc-500">
                  STK Ref: {booking.checkoutRequestId}
                </p>
              )}
              {booking.arrivedAt && (
                <p className="mt-0.5 text-xs font-bold text-amber-700">
                  Arrived at {booking.arrivedAt}
                  {booking.gpsPin ? ` • GPS Pin: ${booking.gpsPin}` : ""}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`rounded-sm px-3 py-1 text-xs font-black uppercase ${getBadgeStyle(
                  currentStatus
                )}`}
              >
                {currentStatus}
              </span>

              {onClear && (
                <button
                  type="button"
                  onClick={onClear}
                  className="border border-zinc-300 px-2.5 py-1 text-xs font-bold text-zinc-700 hover:bg-zinc-100"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          {(booking.status || "Held in Escrow") === "Held in Escrow" && (
            <form
              onSubmit={handleConfirmArrival}
              className="mt-3 flex flex-col gap-2 border-t border-zinc-200 pt-3 sm:flex-row"
            >
              <input
                type="text"
                value={gpsPinInput}
                onChange={(e) => setGpsPinInput(e.target.value)}
                placeholder="Paste GPS Pin (-1.3614, 36.6562 or Maps link)"
                aria-label="Location GPS Pin"
                className="flex-1 rounded-sm border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs font-medium text-black outline-none focus:border-black"
              />
              <button
                type="submit"
                disabled={confirmingArrival}
                className="rounded-sm bg-emerald-500 px-4 py-2 text-xs font-extrabold uppercase text-black hover:bg-emerald-400 disabled:opacity-50"
              >
                {confirmingArrival ? "Confirming..." : "Confirm Arrival"}
              </button>
            </form>
          )}
        </div>
      )}
    </section>
  );
}

export default StatusTracker;