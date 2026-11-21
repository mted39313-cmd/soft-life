import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

// colour za escrow 
function getStatusClasses(status) {
  if (status === "Released") {
    return "bg-emerald-500 text-black";
  }

  if (status === "Refunded") {
    return "bg-red-600 text-white";
  }

  if (status === "Arrived - Ready to Release") {
    return "bg-amber-400 text-black";
  }

  return "bg-zinc-800 text-emerald-300";
}

// admin dashboard inashughulikia CRUD yote ya bookings kwa Firestore
function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // fields za kuongeza booking mpya manually
  const [packageTitle, setPackageTitle] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  // inaleta bookings zote kutoka collection ya "bookings"
  async function fetchBookings() {
    setLoading(true);
    setErrorMsg("");

    try {
      const snap = await getDocs(collection(db, "bookings"));
      const list = snap.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));
      setBookings(list);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setErrorMsg("Hatukuweza kuleta bookings sasa hivi, check connection aki.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  // Create anaongeza record mpya ya escrow
  async function handleAddBooking(event) {
    event.preventDefault();
    setErrorMsg("");

    const cleanPackage = packageTitle.trim();
    const cleanName = recipientName.trim();
    const cleanPhone = phone.trim();
    const numericAmount = Number(amount);

    if (!cleanPackage || !cleanName || !cleanPhone || numericAmount <= 0) {
      setErrorMsg("Weka package, jina, namba ya simu, na amount valid.");
      return;
    }

    setSaving(true);

    const newRecord = {
      packageTitle: cleanPackage,
      recipientName: cleanName,
      phone: cleanPhone,
      amount: numericAmount,
      status: "Held in Escrow",
      paymentMode: "Admin Manual",
      checkoutRequestId: `MANUAL-${Date.now()}`,
    };

    try {
      const docRef = await addDoc(collection(db, "bookings"), {
        ...newRecord,
        createdAt: serverTimestamp(),
      });

      setBookings((prev) => [{ id: docRef.id, ...newRecord }, ...prev]);
      setPackageTitle("");
      setRecipientName("");
      setPhone("");
      setAmount("");
    } catch (err) {
      console.error("Error creating booking:", err);
      setErrorMsg("Imeshindwa kusave booking mpya.");
    } finally {
      setSaving(false);
    }
  }

  // Update anabadilisha status kuwa Released au Refunded
  async function handleStatusChange(id, nextStatus) {
    setActiveId(id);
    setErrorMsg("");

    try {
      await updateDoc(doc(db, "bookings", id), {
        status: nextStatus,
      });

      setBookings((prev) =>
        prev.map((row) => (row.id === id ? { ...row, status: nextStatus } : row))
      );
    } catch (err) {
      console.error("Error updating booking status:", err);
      setErrorMsg("Imeshindwa ku update status ya booking.");
    } finally {
      setActiveId("");
    }
  }

  // delete anadelete booking document kwa Firestore
  async function handleDelete(id) {
    setActiveId(id);
    setErrorMsg("");

    try {
      await deleteDoc(doc(db, "bookings", id));
      setBookings((prev) => prev.filter((row) => row.id !== id));
    } catch (err) {
      console.error("Error deleting booking:", err);
      setErrorMsg("Imeshindwa kufuta hiyo booking.");
    } finally {
      setActiveId("");
    }
  }

  // Ganji yote yenye bado ziko ndani ya escrow
  const escrowTotal = bookings
    .filter((row) => {
      const current = row.status || "Held in Escrow";
      return current === "Held in Escrow" || current === "Arrived - Ready to Release";
    })
    .reduce((sum, row) => sum + Number(row.amount || 0), 0);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 text-white">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
            SoftLife Escrow Desk
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white">
            Admin Dashboard
          </h1>
        </div>

        <div className="border border-zinc-800 bg-zinc-950 px-5 py-3">
          <p className="text-xs font-bold uppercase text-zinc-400">
            Active Escrow Balance
          </p>
          <p className="text-2xl font-black text-emerald-400">
            KES {escrowTotal.toLocaleString()}
          </p>
        </div>
      </div>
      
      <form
        onSubmit={handleAddBooking}
        className="mt-8 grid gap-3 border border-zinc-800 bg-zinc-950 p-5 md:grid-cols-5"
      >
        <input
          type="text"
          value={packageTitle}
          onChange={(e) => setPackageTitle(e.target.value)}
          placeholder="Package (e.g. SoftLife Linkup)"
          aria-label="Package Title"
          className="border border-zinc-700 bg-black px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-400"
        />

        <input
          type="text"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          placeholder="Recipient Name"
          aria-label="Recipient Name"
          className="border border-zinc-700 bg-black px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-400"
        />

        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0712345678"
          aria-label="Phone Number"
          className="border border-zinc-700 bg-black px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-400"
        />

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (KES)"
          aria-label="Amount"
          className="border border-zinc-700 bg-black px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-400"
        />

        <button
          type="submit"
          disabled={saving}
          className="bg-emerald-500 px-4 py-2 text-xs font-extrabold uppercase text-black transition hover:bg-emerald-400 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add Booking"}
        </button>
      </form>

      {errorMsg && (
        <p className="mt-6 border border-red-500/40 bg-red-950/60 px-4 py-3 text-xs font-semibold text-red-300">
          {errorMsg}
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-zinc-400">Tunaleta bookings aki...</p>
      ) : bookings.length === 0 ? (
        <div className="mt-8 border border-zinc-800 bg-zinc-950 p-8 text-center text-sm text-zinc-400">
          Bado hakuna bookings kwa list.
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {bookings.map((row) => {
            const status = row.status || "Held in Escrow";
            const busy = activeId === row.id;

            return (
              <article
                key={row.id}
                className="flex flex-col justify-between gap-4 border border-zinc-800 bg-zinc-950 p-5 md:flex-row md:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-base font-extrabold text-white">
                      {row.packageTitle}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold uppercase ${getStatusClasses(
                        status
                      )}`}
                    >
                      {status}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-zinc-300">
                    Recipient:{" "}
                    <span className="font-bold text-white">
                      {row.recipientName}
                    </span>{" "}
                    ({row.phone}) •{" "}
                    <span className="font-extrabold text-white">
                      KES {Number(row.amount || 0).toLocaleString()}
                    </span>
                  </p>

                  {row.arrivedAt && (
                    <p className="mt-1 text-xs font-bold text-amber-400">
                      Arrived at {row.arrivedAt}
                      {row.gpsPin ? ` • GPS Pin: ${row.gpsPin}` : ""}
                    </p>
                  )}

                  <p className="mt-1 font-mono text-[11px] text-zinc-500">
                    ID: {row.id} • Ref: {row.checkoutRequestId || "N/A"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={busy || status === "Released"}
                    onClick={() => handleStatusChange(row.id, "Released")}
                    className="bg-emerald-500 px-3.5 py-2 text-xs font-extrabold uppercase text-black transition hover:bg-emerald-400 disabled:opacity-40"
                  >
                    Release
                  </button>

                  <button
                    type="button"
                    disabled={busy || status === "Refunded"}
                    onClick={() => handleStatusChange(row.id, "Refunded")}
                    className="bg-white px-3.5 py-2 text-xs font-extrabold uppercase text-black transition hover:bg-zinc-200 disabled:opacity-40"
                  >
                    Refund
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDelete(row.id)}
                    className="border border-red-500/50 px-3.5 py-2 text-xs font-bold uppercase text-red-400 transition hover:bg-red-950 disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default AdminDashboard;