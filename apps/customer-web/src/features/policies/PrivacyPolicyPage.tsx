import React from "react";
import {
  ShieldCheck,
  Lock,
  UserCheck,
  Database,
  Eye,
  FileCheck2,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { PolicyLayout } from "./PolicyLayout";
import styles from "./PolicyLayout.module.css";

const TOC_ITEMS = [
  { id: "statutory-framework", label: "1. Statutory Framework & Scope" },
  { id: "data-collection", label: "2. Personal Data We Collect" },
  { id: "purpose-processing", label: "3. Purpose & Lawful Grounds" },
  { id: "principal-rights", label: "4. Your Rights under DPDP Act 2023" },
  { id: "sharing-disclosures", label: "5. Strict Sharing & No-Sale Pledge" },
  { id: "security-retention", label: "6. Security Architecture & Retention" },
  { id: "cookies-tracking", label: "7. Cookies & Session Authentication" },
  { id: "children-privacy", label: "8. Minor Data Protection" },
];

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <PolicyLayout
      title="Privacy & Data Protection Policy"
      leadSubtitle="At Bagodi Shopping Mall, we hold customer confidentiality and data sovereignty in the highest regard. This policy details how your digital personal data is handled in strict compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and Consumer Protection (E-Commerce) Rules, 2026."
      activePolicy="privacy"
      tocItems={TOC_ITEMS}
    >
      {/* 1. Framework */}
      <section id="statutory-framework" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <ShieldCheck size={20} className={styles.sectionIcon} />
          <span>1. Statutory Framework & Commitment</span>
        </h2>
        <p className={styles.paragraph}>
          BAGODI Shopping Mall (&ldquo;Bagodi&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;),
          operating our flagship retail shopping destination situated at Fort Road Landmark, Bidar, Karnataka - 585401
          and our digital e-commerce storefront at <strong>bagodi.in</strong>, serves as the Data Fiduciary under the
          Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023).
        </p>
        <p className={styles.paragraph}>
          We are committed to processing digital personal data only with unambiguous, affirmative, and itemised consent,
          or under legitimate uses authorized under Section 7 of the DPDP Act 2023 and the Consumer Protection (E-Commerce)
          Rules, 2020 (as amended 2026).
        </p>

        <div className={styles.calloutBox}>
          <Lock size={18} className={styles.calloutIcon} />
          <div className={styles.calloutContent}>
            <div className={styles.calloutTitle}>Strict Data Sovereignty Pledge</div>
            <p className={styles.calloutText}>
              Bagodi adheres to zero-sale data integrity. We do not sell, rent, monetize, or trade customer browsing or
              transaction data with advertising networks, third-party brokers, or data analytics syndicates.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Data Collection */}
      <section id="data-collection" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <Database size={20} className={styles.sectionIcon} />
          <span>2. Personal Data We Collect</span>
        </h2>
        <p className={styles.paragraph}>
          We collect only the minimum digital personal data necessary to curate, authenticate, process, tailor, and
          dispatch your luxury garments and orders:
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.policyTable}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Data Points Collected</th>
                <th>Necessity / Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Identity & Contact</strong></td>
                <td>Full Name, Mobile Number, Email Address</td>
                <td>Session authentication, 6-digit OTP verification, GST tax invoicing.</td>
              </tr>
              <tr>
                <td><strong>Delivery Logistics</strong></td>
                <td>Flat/House No., Landmark, City, State, PIN Code, Geolocation tag</td>
                <td>Insured courier delivery, doorstep dispatch, reverse pickup logistics.</td>
              </tr>
              <tr>
                <td><strong>Bespoke Tailoring</strong></td>
                <td>Collar, chest, sleeve, waist, trouser inseam dimensions, fit preferences</td>
                <td>Master tailoring atelier customization (e.g. Raymond bespoke suiting).</td>
              </tr>
              <tr>
                <td><strong>Financial / Transactional</strong></td>
                <td>Order ID, UPI transaction reference, payment status, payment method</td>
                <td>Payment reconciliation via RBI-licensed gateways. (We never store card CVV or UPI PIN).</td>
              </tr>
              <tr>
                <td><strong>Technical & Session</strong></td>
                <td>IP address, browser type, device OS, request ID, session tokens</td>
                <td>Account security, fraud prevention, bot deterrence, and shopping bag persistence.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Purpose */}
      <section id="purpose-processing" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <FileCheck2 size={20} className={styles.sectionIcon} />
          <span>3. Purpose & Lawful Grounds of Processing</span>
        </h2>
        <p className={styles.paragraph}>
          Under Section 6 of the DPDP Act 2023, personal data is processed strictly for specified, lawful purposes for
          which the customer (&ldquo;Data Principal&rdquo;) has granted explicit notice-backed consent:
        </p>
        <ul className={styles.bulletList}>
          <li className={styles.bulletItem}>
            <strong>Contractual Order Fulfillment:</strong> Processing transactions, generating GST tax invoices, cutting
            and packaging fabrics, and dispatching orders via insured freight carriers.
          </li>
          <li className={styles.bulletItem}>
            <strong>Authentication & OTP Verification:</strong> Transmitting 6-digit one-time passcodes via SMS/Email for
            secure customer login and doorstep package handover validation (Track & Delivery OTP).
          </li>
          <li className={styles.bulletItem}>
            <strong>Customer Concierge Support:</strong> Assisting customers with sizing recommendations, exchange
            requests, alterations, and refund disbursements.
          </li>
          <li className={styles.bulletItem}>
            <strong>Statutory Compliance:</strong> Maintaining audit trails and fiscal tax records mandated by the Central
            Goods and Services Tax Act, 2017 and Consumer Protection Act, 2019.
          </li>
        </ul>
      </section>

      {/* 4. Data Principal Rights */}
      <section id="principal-rights" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <UserCheck size={20} className={styles.sectionIcon} />
          <span>4. Your Statutory Rights under DPDP Act 2023</span>
        </h2>
        <p className={styles.paragraph}>
          As an Indian citizen and Data Principal under the DPDP Act 2023, you enjoy statutory control over your personal
          information:
        </p>
        <ul className={styles.bulletList}>
          <li className={styles.bulletItem}>
            <strong>Right to Access Information (Section 11):</strong> You may request a summary of your personal data
            held by Bagodi, the processing activities carried out, and identities of data processors shared with.
          </li>
          <li className={styles.bulletItem}>
            <strong>Right to Correction & Updating (Section 12):</strong> You can edit and update delivery addresses,
            contact details, or sizing profiles anytime via your Account Hub or by emailing support.
          </li>
          <li className={styles.bulletItem}>
            <strong>Right to Erasure / Data Deletion (Section 12):</strong> You may request deletion of your account and
            personal data, subject only to ongoing orders or mandatory statutory tax retention obligations.
          </li>
          <li className={styles.bulletItem}>
            <strong>Right of Grievance Redressal (Section 13):</strong> You have the right to accessible grievance
            redressal from our Grievance Officer and escalation to the Data Protection Board of India.
          </li>
          <li className={styles.bulletItem}>
            <strong>Right to Nominate (Section 14):</strong> You may designate a nominee to exercise your data rights in
            the event of death or incapacity.
          </li>
        </ul>

        <div className={styles.calloutBox}>
          <CheckCircle2 size={18} className={styles.calloutIcon} />
          <div className={styles.calloutContent}>
            <div className={styles.calloutTitle}>How to Exercise Your Rights</div>
            <p className={styles.calloutText}>
              Send a request from your registered email address to <strong>privacy@bagodi.in</strong> or{" "}
              <strong>grievance@bagodi.in</strong>. Requests are acknowledged within 48 hours and resolved within 30 days
              without charge.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Sharing */}
      <section id="sharing-disclosures" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <Eye size={20} className={styles.sectionIcon} />
          <span>5. Strict Sharing & No-Sale Pledge</span>
        </h2>
        <p className={styles.paragraph}>
          We share your data only on a strict need-to-know basis with trusted Data Processors operating under binding
          non-disclosure and DPDP-compliant data processing agreements:
        </p>
        <ul className={styles.bulletList}>
          <li className={styles.bulletItem}>
            <strong>Logistics & Freight Partners:</strong> Regulated courier and freight carriers (e.g. BlueDart,
            Delhivery, India Post) receive your name, shipping address, and phone number solely for parcel delivery and
            doorstep OTP verification.
          </li>
          <li className={styles.bulletItem}>
            <strong>Payment Gateways:</strong> RBI-licensed payment aggregators (e.g. Razorpay, Cashfree, UPI networks)
            to process encrypted payment intents. Bagodi never accesses or stores bank account passwords, UPI PINs, or
            credit card CVVs.
          </li>
          <li className={styles.bulletItem}>
            <strong>Transactional SMS/Email Gateways:</strong> Telecommunication providers registered with TRAI to deliver
            order confirmations and 6-digit authentication passcodes.
          </li>
        </ul>
      </section>

      {/* 6. Security */}
      <section id="security-retention" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <Lock size={20} className={styles.sectionIcon} />
          <span>6. Security Architecture & Data Retention</span>
        </h2>
        <p className={styles.paragraph}>
          Bagodi implements comprehensive technical, organizational, and physical safeguards matching modern 2026
          cybersecurity standards:
        </p>
        <ul className={styles.bulletList}>
          <li className={styles.bulletItem}>
            <strong>256-Bit SSL/TLS Encryption:</strong> All data transmitted between your device and Bagodi is protected
            by high-grade TLS encryption with strict HTTP Strict Transport Security (HSTS).
          </li>
          <li className={styles.bulletItem}>
            <strong>Isolated Sovereign Storage:</strong> Data is hosted on ISO 27001-certified cloud infrastructure within
            the territory of the Republic of India.
          </li>
          <li className={styles.bulletItem}>
            <strong>Retention Timelines:</strong> Inactive customer records are scheduled for automated anonymization
            after 3 years of account dormancy, preserving only legal GST invoices required for statutory auditing.
          </li>
        </ul>
      </section>

      {/* 7. Cookies */}
      <section id="cookies-tracking" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <Clock size={20} className={styles.sectionIcon} />
          <span>7. Cookies & Session Authentication</span>
        </h2>
        <p className={styles.paragraph}>
          Bagodi uses only strictly necessary and functional cookies. These secure session identifiers keep you logged in,
          remember the contents of your shopping bag, and safeguard against Cross-Site Request Forgery (CSRF). We do not
          employ invasive third-party cross-site behavioral tracking cookies.
        </p>
      </section>

      {/* 8. Children's Data */}
      <section id="children-privacy" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <AlertCircle size={20} className={styles.sectionIcon} />
          <span>8. Minor Data Protection (DPDP Section 9)</span>
        </h2>
        <p className={styles.paragraph}>
          In accordance with Section 9 of the DPDP Act 2023, Bagodi does not undertake targeted advertising or profiling
          directed at minors under the age of 18. Garments in our Kid&rsquo;s Wear section are sold exclusively for purchase
          by legal adult guardians.
        </p>
      </section>
    </PolicyLayout>
  );
};
