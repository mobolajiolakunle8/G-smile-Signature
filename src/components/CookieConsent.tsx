import { useState, useEffect } from "react";
import { navigate } from "../store/useRouter";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("gs_cookie_consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("gs_cookie_consent", "accepted");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("gs_cookie_consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-cream bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:p-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-ink/70 text-center sm:text-left">
          We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. Read our{" "}
          <button onClick={() => navigate("/privacy-policy")} className="font-semibold text-gold underline hover:text-ink">
            Privacy Policy
          </button>.
        </p>
        <div className="flex gap-3">
          <button onClick={handleDecline} className="rounded border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-cream">
            Decline
          </button>
          <button onClick={handleAccept} className="rounded bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gold hover:text-ink">
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
