import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

// page ya login na Google sign-in/up ndio user au admin aingie bila friction
function Login() {
  const navigate = useNavigate();
  const { loginWithEmail, loginWithGoogle } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleEmailAuth(event) {
    event.preventDefault();
    setErrorMessage("");

    const cleanEmail = email.trim();
    if (!cleanEmail || password.length < 6) {
      setErrorMessage("Weka email sawa na password ya atleast 6 characters.");
      return;
    }

    setSubmitting(true);

    try {
      if (isSignUp) {
        // tunafungua account mpya ya email/password kwa Firebase Auth
        await createUserWithEmailAndPassword(auth, cleanEmail, password);
      } else {
        await loginWithEmail(cleanEmail, password);
      }

      navigate("/");
    } catch (err) {
      console.error("Email auth failed:", err);
      setErrorMessage(err.message || "Imeshindwa ku-authenticate, jaribu tena.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleAuth() {
    setErrorMessage("");
    setSubmitting(true);

    try {
      // Google popup inafanya sign-in au sign-up automatic kwa account mpya
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      console.error("Google auth failed:", err);
      setErrorMessage(err.message || "Google sign-in imefail.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[75vh] max-w-md items-center px-6 py-12 text-white">
      <div className="w-full border border-zinc-800 bg-black p-7 shadow-2xl">
        <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
          “I TRUST YOU YOU TRUST ME BUT TRUST IS NOT SURE”
        </p>

        <h1 className="mt-2 text-2xl font-black tracking-tight text-white">
          {isSignUp ? "Create SoftLife Account" : "SoftLife Login"}
        </h1>

        <p className="mt-1 text-xs text-zinc-400">
          Sign in or sign up with Google or email to manage escrow bookings.
        </p>

        <form onSubmit={handleEmailAuth} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-bold uppercase tracking-wider text-zinc-300"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@softlife.co.ke"
              className="mt-1.5 w-full border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-emerald-400"
              required
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-bold uppercase tracking-wider text-zinc-300"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-emerald-400"
              required
            />
          </div>

          {errorMessage && (
            <p className="border border-red-500/40 bg-red-950/60 px-3 py-2 text-xs font-semibold text-red-300">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-500 py-2.5 text-xs font-black uppercase tracking-wider text-black transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {submitting
              ? "hakuna presha..."
              : isSignUp
                ? "Sign Up with Email"
                : "Sign In with Email"}
          </button>
        </form>

        <div className="mt-4 border-t border-zinc-800 pt-4">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={submitting}
            className="w-full bg-white py-2.5 text-xs font-black uppercase tracking-wider text-black transition hover:bg-zinc-200 disabled:opacity-50"
          >
            Continue with Google
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsSignUp((prev) => !prev);
            setErrorMessage("");
          }}
          className="mt-5 w-full text-center text-xs font-semibold text-zinc-400 hover:text-emerald-400"
        >
          {isSignUp
            ? "Uko na account tayari? Sign in hapa"
            : "Huna account bado? Sign up hapa"}
        </button>
      </div>
    </main>
  );
}

export default Login;