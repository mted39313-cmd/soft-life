import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import PackageCard from "../components/PackageCard";
import StatusTracker from "../components/StatusTracker";
import BookingModal from "../components/BookingModal";

// Ndio musiboeke hii ni yenu ya kuwa display before admin afanye hiyo kitu
const DEFAULT_PACKAGES = [
  {
    id: "pkg-1",
    title: "The Campus Hostel Movie & Indomie date",
    venue: "At anyone’s campus.",
    price: 1200,
  },
  {
    id: "pkg-2",
    title: "The Liquor store date (Ukikataliwa tuta kataliquor)",
    venue: "At any near liquor store.",
    price: 1500,
  },
  {
    id: "pkg-3",
    title: "The indoor chill date (Place ya watu wawili only)",
    venue: "At anyone’s house.",
    price: 1000,
  },
];
function Home() {
    //list data packages
  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  //kutrack nani ameselect package 
  const [selectedPackage, setSelectedPackage] = useState(null);

  // load data package zenye ziko kwa firestore
  useEffect(() => {
    async function loadPackages() {
      try {
        // connect kwa packages na itainstall kutoka kwa cloudstore
        const snapshot = await getDocs(collection(db, "packages"));
        //kukuwa loaded ndio ikuwa empy inatrace na kuzicombine 
        if (!snapshot.empty) {
          const loadedItems = [];
          snapshot.forEach((doc) => {
            loadedItems.push({ id: doc.id, ...doc.data() });
          });
          setPackages(loadedItems);
        }
      } catch (err) {
        console.error("Failed to fetch packages:", err);
      }
    }

    loadPackages();
  }, []);
// user akiselect  inasave kwa pkg
function handleSelectPackage(pkg) {
    setSelectedPackage(pkg);
  }
// Reset ka hajaselect
  function handleCloseModal() {
    setSelectedPackage(null);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
          TRUST ISSUES MEDICINE.
        </h1>
      </header>

      <section className="mt-8">
        <StatusTracker />
      </section>

      <section className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            onSelect={handleSelectPackage}
          />
        ))}
      </section>

      {selectedPackage && (
        <BookingModal pkg={selectedPackage} onClose={handleCloseModal} />
      )}
    </main>
  );
}

export default Home;