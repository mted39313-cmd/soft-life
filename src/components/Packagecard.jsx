// props zikona vitu tunahitaji data na kupass down kutoka kwa parent component na kuopen
function Packagecard({pkg,onSelect}) {

    function handleBookClick() {
    onSelect(pkg);
  }
}
return (
    <article className="flex flex-col justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-6">
      <div>
        <h3 className="text-lg font-bold text-white">{pkg.title}</h3>
        <ul className="mt-4 space-y-2 text-sm font-medium text-zinc-200">
          <li>-Venue: {pkg.venue}</li>
          <li>-Fare & Needs: KES ({pkg.price}).</li>
        </ul>
      </div>
      <div className="mt-6 space-y-3">
        <p className="rounded border border-emerald-500 bg-emerald-500/20 px-4 py-2 text-center text-sm font-bold text-emerald-100">
          M-pesa Escrow
        </p>
        <button
          type="button"
          onClick={handleBookClick}
          className="w-full rounded bg-emerald-500 px-4 py-2.5 text-sm font-bold text-black hover:bg-emerald-400"
        >
          Book & Lock M-pesa Fare
        </button>
      </div>
    </article>
  );
export default PackageCard;