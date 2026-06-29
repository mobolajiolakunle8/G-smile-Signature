import { useState } from "react";
import { useStore, ADMIN_CREDENTIALS } from "../store/StoreContext";
import { navigate } from "../store/useRouter";
import { Button, Input } from "../components/ui";
import { Icon } from "../components/Icons";

export function AdminLogin() {
  const { adminLogin, admin } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (admin) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4 py-16 text-center">
        <div>
          <Icon.shield className="mx-auto h-14 w-14 text-gold" />
          <h2 className="mt-4 font-display text-2xl font-semibold">Already signed in as Admin</h2>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="dark" onClick={() => navigate("/admin")}>Go to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[80vh] place-items-center bg-cream px-4 py-16">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ink text-white">
            <Icon.shield className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold">Admin Sign In</h1>
          <p className="mt-1 text-sm text-ink/60">Access the G-Smile Signature management panel</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            const ok = adminLogin(email, password);
            if (ok) navigate("/admin");
            else setError("Invalid email or password");
          }}
          className="mt-6 space-y-4"
        >
          <Input label="Admin Email" type="email" value={email} onChange={setEmail} required placeholder="admin@gsmilesignature.com" />
          <Input label="Password" type="password" value={password} onChange={setPassword} required placeholder="••••••••" />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button type="submit" variant="dark" className="w-full">Sign In</Button>
        </form>

        <div className="mt-6 rounded-lg border border-cream bg-cream/40 p-4 text-xs text-ink/60">
          <p className="font-semibold text-ink">Demo Credentials</p>
          <p className="mt-1">Email: <span className="font-mono">{ADMIN_CREDENTIALS.email}</span></p>
          <p>Password: <span className="font-mono">{ADMIN_CREDENTIALS.password}</span></p>
        </div>

        <button onClick={() => navigate("/")} className="mt-6 block w-full text-center text-xs text-ash hover:text-gold">
          ← Back to store
        </button>
      </div>
    </div>
  );
}
