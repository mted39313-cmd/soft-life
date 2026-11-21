import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
//Nav bar inacontain ma links ma text na user za admin ukilogin na mwenye bado anapelekwa kwa login page
function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-zinc-800 bg-black px-6 py-4">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/" className="text-xl font-bold tracking-tight text-white">
            SoftLife Escrow
          </Link>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            “I TRUST YOU YOU TRUST ME BUT TRUST IS NOT SURE”
          </span>
        </div>
       <div className="flex items-center gap-3">

          {user ? (
            <>
              <Link
                to="/admin"
                className="rounded bg-emerald-500 px-4 py-2 text-xs font-bold uppercase text-black hover:bg-emerald-400"
              >
                Admin Panel
              </Link>
              <button
                onClick={logout}
                className="rounded bg-white px-4 py-2 text-xs font-bold uppercase text-black hover:bg-zinc-200"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-black hover:bg-zinc-200"
            >
              ADMIN LOGIN
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
} 
export default Navbar;