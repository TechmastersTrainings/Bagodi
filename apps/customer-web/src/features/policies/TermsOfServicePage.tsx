import React from "react";
import {
  Scale,
  ShoppingBag,
  Scissors,
  CreditCard,
  Truck,
  Award,
  AlertTriangle,
  Gavel,
  CheckCircle2,
} from "lucide-react";
import { PolicyLayout } from "./PolicyLayout";
import styles from "./PolicyLayout.module.css";

const TOC_ITEMS = [
  { id: "entity-acceptance", label: "1. Entity & Acceptance of Terms" },
  { id: "account-security", label: "2. Account Registration & OTP" },
  { id: "pricing-origin", label: "3. Pricing, GST & Country of Origin" },
  { id: "order-contract", label: "4. Order Formation & Acceptance" },
  { id: "tailoring-terms", label: "5. Master Tailoring & Bespoke Cuts" },
  { id: "payments-cod", label: "6. UPI & Cash on Delivery (COD)" },
  { id: "shipping-otp", label: "7. Insured Dispatch & Delivery OTP" },
  { id: "intellectual-property", label: "8. Intellectual Property Rights" },
  { id: "dispute-jurisdiction", label: "9. Governing Law & Bidar Jurisdiction" },
];

export const TermsOfServicePage: React.FC = () => {
  return (
    <PolicyLayout
      title="Terms of Service & E-Commerce Agreement"
      leadSubtitle="These Terms of Service govern your access to and shopping experience on the Bagodi digital platform (bagodi.in) and our physical flagship retail mall in Bidar. Formulated in adherence to the Indian Contract Act, 1872, the Information Technology Act, 2000, and the Consumer Protection (E-Commerce) Rules, 2026."
      activePolicy="terms"
      tocItems={TOC_ITEMS}
    >
      {/* 1. Entity */}
      <section id="entity-acceptance" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <Scale size={20} className={styles.sectionIcon} />
          <span>1. Entity Details & Acceptance of Terms</span>
        </h2>
        <p className={styles.paragraph}>
          Welcome to BAGODI Shopping Mall (&ldquo;Bagodi&rdquo;). Established in 1968, our flagship retail mall and atelier
          is situated at <strong>Fort Road Landmark, Bidar, Karnataka - 585401, India</strong>. By accessing our platform,
          registering an account, or purchasing luxury apparel, sarees, suiting fabrics, or accessories via{" "}
          <strong>bagodi.in</strong>, you enter into a legally binding agreement governed by these Terms of Service.
        </p>
        <p className={styles.paragraph}>
          If you do not agree to these terms, please refrain from using this website or placing orders. In accordance with
          Rule 4(1) of the Consumer Protection (E-Commerce) Rules, 2020 (as amended 2026), these terms are prominently
          published and available in plain, accessible language.
        </p>
      </section>

      {/* 2. Account Security */}
      <section id="account-security" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <ShoppingBag size={20} className={styles.sectionIcon} />
          <span>2. Account Registration & Authentication Security</span>
        </h2>
        <p className={styles.paragraph}>
          To transact on Bagodi, you may authenticate via an affirmative mobile OTP or email verification code. You agree
          to provide authentic, accurate, and current contact details.
        </p>
        <ul className={styles.bulletList}>
          <li className={styles.bulletItem}>
            <strong>Credential Confidentiality:</strong> You are solely responsible for maintaining the confidentiality of
            your devices, session logins, and verification codes transmitted to your mobile device.
          </li>
          <li className={styles.bulletItem}>
            <strong>Prohibition of Impersonation:</strong> Registering using fraudulent phone numbers, spoofed identities,
            or unauthorized email addresses constitutes a breach of the Information Technology Act, 2000 and may result in
            immediate account termination and order cancellation.
          </li>
        </ul>
      </section>

      {/* 3. Pricing, GST & Country of Origin */}
      <section id="pricing-origin" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <Award size={20} className={styles.sectionIcon} />
          <span>3. Product Pricing, GST & Mandatory Disclosures</span>
        </h2>
        <p className={styles.paragraph}>
          In accordance with the Legal Metrology (Packaged Commodities) Rules, 2011 and Rule 6(5) of the Consumer
          Protection (E-Commerce) Rules:
        </p>
        <ul className={styles.bulletList}>
          <li className={styles.bulletItem}>
            <strong>All-Inclusive Pricing:</strong> All prices displayed on bagodi.in are expressed in Indian Rupees (INR)
            and are inclusive of applicable Goods and Services Tax (GST). A clear itemized tax breakdown is provided on the
            checkout screen and on the final GST tax invoice.
          </li>
          <li className={styles.bulletItem}>
            <strong>Country of Origin:</strong> All textiles, unstitched suit fabrics, pure silk sarees, and festive apparel
            sold on Bagodi are authentically manufactured or woven in <strong>India</strong>, unless explicitly marked
            otherwise on the product label.
          </li>
          <li className={styles.bulletItem}>
            <strong>Silk Mark & Brand Certification:</strong> Handcrafted pure silk sarees (including Kanjeevaram, Mysore,
            and Banarasi weaves) carry authenticated Silk Mark certification validating 100% natural pure silk fibers.
          </li>
        </ul>
      </section>

      {/* 4. Order Formation */}
      <section id="order-contract" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <CheckCircle2 size={20} className={styles.sectionIcon} />
          <span>4. Order Formation & Acceptance</span>
        </h2>
        <p className={styles.paragraph}>
          When you place an order on bagodi.in, your order represents an offer to purchase the specified merchandise. A
          binding sales contract is concluded only when:
        </p>
        <ol className={styles.bulletList}>
          <li className={styles.bulletItem}>
            We transmit an official Order Confirmation containing your unique Order ID via SMS and/or registered email.
          </li>
          <li className={styles.bulletItem}>
            The garment passes quality inspection and is assigned an air waybill (AWB) tracking number by our logistics
            dispatch team at the Bidar flagship fulfillment center.
          </li>
        </ol>
        <p className={styles.paragraph}>
          Bagodi reserves the right to decline or cancel an order prior to dispatch in instances of pricing typographical
          errors, unexpected stock discrepancies, or non-serviceable pin codes, in which case any prepayment is refunded in
          full immediately.
        </p>
      </section>

      {/* 5. Master Tailoring */}
      <section id="tailoring-terms" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <Scissors size={20} className={styles.sectionIcon} />
          <span>5. Master Tailoring & Custom Cuts</span>
        </h2>
        <p className={styles.paragraph}>
          Bagodi operates an authorized Master Tailoring Atelier in collaboration with premium fabric houses (including
          Raymond and ColorPlus):
        </p>
        <ul className={styles.bulletList}>
          <li className={styles.bulletItem}>
            <strong>Standard Unstitched Fabrics:</strong> Unstitched fabric cuts (e.g. 1.3m trouser + 2.5m shirting) are
            delivered in pristine sealed factory packaging and are eligible for our standard return/replacement window.
          </li>
          <li className={styles.bulletItem}>
            <strong>Custom Tailored & Altered Ensembles:</strong> Garments that have been cut, stitched, or custom-tailored
            to bespoke customer-supplied body dimensions are non-returnable and non-refundable, except in the event of an
            unremedied dimensional defect or material flaw.
          </li>
        </ul>
      </section>

      {/* 6. Payments & COD */}
      <section id="payments-cod" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <CreditCard size={20} className={styles.sectionIcon} />
          <span>6. Payment Processing, UPI & Cash on Delivery (COD)</span>
        </h2>
        <p className={styles.paragraph}>
          Bagodi provides multi-channel encrypted payment options:
        </p>
        <ul className={styles.bulletList}>
          <li className={styles.bulletItem}>
            <strong>Prepaid Transactions:</strong> Processed through RBI-authorized payment aggregators supporting UPI
            (Google Pay, PhonePe, Paytm, BHIM), Net Banking, Credit Cards, and Debit Cards.
          </li>
          <li className={styles.bulletItem}>
            <strong>Cash on Delivery (COD):</strong> Available for select PIN codes across India. For COD orders, payment
            must be made in full in cash or doorstep UPI to the courier agent before opening the secure courier satchel.
          </li>
        </ul>
      </section>

      {/* 7. Shipping & OTP */}
      <section id="shipping-otp" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <Truck size={20} className={styles.sectionIcon} />
          <span>7. Insured Dispatch & Track & Delivery OTP</span>
        </h2>
        <p className={styles.paragraph}>
          All shipments originating from our Bidar flagship mall are insured against loss or damage in transit.
        </p>
        <div className={styles.calloutBox}>
          <AlertTriangle size={18} className={styles.calloutIcon} />
          <div className={styles.calloutContent}>
            <div className={styles.calloutTitle}>Delivery OTP Authentication Rule</div>
            <p className={styles.calloutText}>
              For high-value sarees, suiting fabrics, and luxury parcels, delivery requires sharing a 6-digit delivery OTP
              sent to your registered phone number. Handing over the OTP to the delivery agent certifies complete and
              tamper-free physical possession of the parcel.
            </p>
          </div>
        </div>
      </section>

      {/* 8. IP */}
      <section id="intellectual-property" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <Award size={20} className={styles.sectionIcon} />
          <span>8. Intellectual Property & Trademark Notice</span>
        </h2>
        <p className={styles.paragraph}>
          The wordmark <strong>BAGODI</strong>, logo, typography, bespoke photography, campaign creative, software code,
          and storefront assets are the exclusive intellectual property of Bagodi Shopping Mall. Reproduction, mirroring,
          or commercial exploitation without explicit prior written authorization is strictly prohibited under the
          Copyright Act, 1957 and Trade Marks Act, 1999.
        </p>
      </section>

      {/* 9. Dispute & Jurisdiction */}
      <section id="dispute-jurisdiction" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <Gavel size={20} className={styles.sectionIcon} />
          <span>9. Governing Law & Exclusive Bidar Jurisdiction</span>
        </h2>
        <p className={styles.paragraph}>
          These Terms of Service and any contractual transactions shall be governed by, construed, and enforced exclusively
          in accordance with the laws of the Republic of India.
        </p>
        <p className={styles.paragraph}>
          Subject to the preliminary grievance redressal process, any disputes, controversies, or legal claims arising out
          of or related to platform purchases shall be subject to the exclusive jurisdiction of the competent civil courts
          located at <strong>Bidar, Karnataka, India</strong>.
        </p>
      </section>
    </PolicyLayout>
  );
};
