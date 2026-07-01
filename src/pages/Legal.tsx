import { useRouter, navigate } from "../store/useRouter";

export function Legal() {
  const { route } = useRouter();
  const path = route.path;

  let title = "";
  let lastUpdated = "June 2026";
  let content: React.ReactNode = null;

  if (path === "/privacy-policy") {
    title = "Privacy Policy";
    content = (
      <>
        <p className="mb-4">At G-Smile Signature, we are committed to protecting your privacy and ensuring the security of your personal information in compliance with the Nigeria Data Protection Regulation (NDPR).</p>
        
        <h3 className="mt-8 font-display text-lg font-semibold text-ink">1. Information We Collect</h3>
        <p className="mt-2">We collect information you provide directly to us, such as when you create an account, make a purchase, or subscribe to our newsletter. This includes your name, email address, phone number, shipping address, and payment details (bank transfer proofs).</p>
        
        <h3 className="mt-8 font-display text-lg font-semibold text-ink">2. How We Use Your Information</h3>
        <p className="mt-2">We use the information we collect to process and fulfill your orders, communicate with you via WhatsApp or email regarding your order status, improve our website, and send you marketing communications (if you have opted in).</p>
        
        <h3 className="mt-8 font-display text-lg font-semibold text-ink">3. Third-Party Services</h3>
        <p className="mt-2">We share your information with trusted third-party service providers to help us operate our business, including:</p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li><strong>Firebase:</strong> For secure database storage and real-time synchronization.</li>
          <li><strong>Cloudinary:</strong> For image hosting and optimization.</li>
          <li><strong>Web3Forms:</strong> For secure transactional email delivery.</li>
        </ul>

        <h3 className="mt-8 font-display text-lg font-semibold text-ink">4. Data Security</h3>
        <p className="mt-2">We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>

        <h3 className="mt-8 font-display text-lg font-semibold text-ink">5. Your Rights</h3>
        <p className="mt-2">Under the NDPR, you have the right to access, correct, or delete your personal data. You may contact us at gsmilebags@gmail.com to exercise these rights.</p>
      </>
    );
  } else if (path === "/terms-of-service") {
    title = "Terms of Service";
    content = (
      <>
        <p className="mb-4">Welcome to G-Smile Signature. By accessing or using our website, you agree to be bound by these Terms of Service.</p>
        
        <h3 className="mt-8 font-display text-lg font-semibold text-ink">1. General Conditions</h3>
        <p className="mt-2">We reserve the right to refuse service to anyone for any reason at any time. You understand that your content may be transferred unencrypted and involve transmissions over various networks.</p>
        
        <h3 className="mt-8 font-display text-lg font-semibold text-ink">2. Products and Pricing</h3>
        <p className="mt-2">All prices are listed in Nigerian Naira (₦) and are subject to change without notice. We reserve the right to modify or discontinue any product at any time. We strive to display the colors and images of our products as accurately as possible, but we cannot guarantee that your device's display is accurate.</p>
        
        <h3 className="mt-8 font-display text-lg font-semibold text-ink">3. Payment and Orders</h3>
        <p className="mt-2">We currently accept payment via direct bank transfer. Orders are only processed and shipped after payment has been confirmed by our admin team. You are responsible for providing accurate shipping information.</p>

        <h3 className="mt-8 font-display text-lg font-semibold text-ink">4. Limitation of Liability</h3>
        <p className="mt-2">G-Smile Signature shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>
      </>
    );
  } else if (path === "/returns") {
    title = "Return & Refund Policy";
    content = (
      <>
        <p className="mb-4">We want you to love your G-Smile Signature bag. If you are not completely satisfied, we are here to help.</p>
        
        <h3 className="mt-8 font-display text-lg font-semibold text-ink">1. 7-Day Return Policy</h3>
        <p className="mt-2">You have 7 calendar days from the date of delivery to initiate a return. To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging (including the dust bag).</p>
        
        <h3 className="mt-8 font-display text-lg font-semibold text-ink">2. Non-Returnable Items</h3>
        <p className="mt-2">Customized or personalized bags, and items marked as "Final Sale" cannot be returned unless they arrive damaged or defective.</p>
        
        <h3 className="mt-8 font-display text-lg font-semibold text-ink">3. Refunds</h3>
        <p className="mt-2">Once we receive your returned item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item. If your return is approved, we will initiate a refund to your bank account within 5-10 business days.</p>

        <h3 className="mt-8 font-display text-lg font-semibold text-ink">4. Shipping Costs</h3>
        <p className="mt-2">You will be responsible for paying for your own shipping costs for returning your item, unless the item arrived damaged or incorrect.</p>
      </>
    );
  }

  if (!content) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <button onClick={() => navigate("/")} className="mb-8 flex items-center gap-2 text-sm font-medium text-ash hover:text-gold transition-colors">
        <span className="text-lg">←</span> Back to Home
      </button>
      
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-ash">Last updated: {lastUpdated}</p>
      
      <div className="mt-10 space-y-6 text-[15px] leading-relaxed text-ink/70">
        {content}
      </div>

      <div className="mt-16 border-t border-cream pt-8">
        <p className="text-sm text-ash">
          If you have any questions regarding these policies, please contact us at{" "}
          <a href="mailto:gsmilebags@gmail.com" className="font-medium text-gold hover:underline">gsmilebags@gmail.com</a> or{" "}
          <a href="https://wa.me/2348065653384" className="font-medium text-gold hover:underline">+234 806 565 3384</a>.
        </p>
      </div>
    </div>
  );
}
