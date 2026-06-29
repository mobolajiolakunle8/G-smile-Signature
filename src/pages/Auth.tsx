import { useState } from "react";
import { useStore } from "../store/StoreContext";
import { navigate } from "../store/useRouter";
import { Button, Input } from "../components/ui";
import { Icon } from "../components/Icons";

type Mode = "login" | "register" | "forgot" | "reset";

export function Auth({ initial = "login" }: { initial?: Mode }) {
  const { login, register, toast } = useStore();
  const [mode, setMode] = useState<Mode>(initial);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      login(form.email);
      navigate("/dashboard");
    } else if (mode === "register") {
      register({ name: form.name, email: form.email, phone: form.phone });
      navigate("/dashboard");
    } else if (mode === "forgot") {
      toast("Reset code sent to your email.");
      setMode("reset");
    } else {
      toast("Password reset successfully. Please log in.");
      setMode("login");
    }
  };

  const titles: Record<Mode, { t: string; s: string }> = {
    login: { t: "Welcome Back", s: "Sign in to your account to continue" },
    register: { t: "Create Account", s: "Join the G-Smile Signature circle" },
    forgot: { t: "Reset Password", s: "Enter your email to receive a reset code" },
    reset: { t: "New Password", s: "Enter the code and choose a new password" },
  };

  return (
    <div className="grid min-h-[80vh] lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src="/images/category-luxury.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/40" />
        <div className="absolute bottom-12 left-12 max-w-sm text-white">
          <h2 className="font-display text-4xl font-semibold leading-tight">Elegance you can carry.</h2>
          <p className="mt-3 text-white/70">Access your orders, wishlist and exclusive member offers.</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <button onClick={() => navigate("/")} className="font-display text-2xl font-bold">
            G-Smile <span className="text-gold">Signature</span>
          </button>
          <h1 className="mt-8 font-display text-3xl font-semibold">{titles[mode].t}</h1>
          <p className="mt-2 text-sm text-ink/60">{titles[mode].s}</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "register" && <Input label="Full Name" value={form.name} onChange={set("name")} required placeholder="Jane Doe" />}
            {(mode === "login" || mode === "register" || mode === "forgot") && (
              <Input label="Email" type="email" value={form.email} onChange={set("email")} required placeholder="you@email.com" />
            )}
            {mode === "register" && <Input label="Phone Number" value={form.phone} onChange={set("phone")} required placeholder="+234..." />}
            {mode === "reset" && <Input label="Reset Code" placeholder="6-digit code" required />}
            {(mode === "login" || mode === "register" || mode === "reset") && (
              <Input label={mode === "reset" ? "New Password" : "Password"} type="password" value={form.password} onChange={set("password")} required placeholder="••••••••" />
            )}

            {mode === "login" && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-ink/60"><input type="checkbox" className="accent-[#d4a24a]" /> Remember me</label>
                <button type="button" onClick={() => setMode("forgot")} className="text-gold hover:underline">Forgot password?</button>
              </div>
            )}

            <Button type="submit" variant="dark" className="w-full">
              {mode === "login" ? "Sign In" : mode === "register" ? "Create Account" : mode === "forgot" ? "Send Reset Code" : "Reset Password"}
            </Button>
          </form>

          {(mode === "login" || mode === "register") && (
            <>
              <div className="my-6 flex items-center gap-3 text-xs text-ash">
                <span className="h-px flex-1 bg-cream" /> OR <span className="h-px flex-1 bg-cream" />
              </div>
              <p className="text-center text-sm text-ink/60">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="font-semibold text-gold hover:underline">
                  {mode === "login" ? "Register" : "Sign In"}
                </button>
              </p>
            </>
          )}
          {(mode === "forgot" || mode === "reset") && (
            <button onClick={() => setMode("login")} className="mt-6 flex w-full items-center justify-center gap-2 text-sm text-ink/60 hover:text-gold">
              <Icon.arrowRight className="h-4 w-4 rotate-180" /> Back to login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
