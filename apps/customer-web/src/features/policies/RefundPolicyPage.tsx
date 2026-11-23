import React from "react";
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  Truck,
  RotateCcw,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { PolicyLayout } from "./PolicyLayout";
import styles from "./PolicyLayout.module.css";

const TOC_ITEMS = [
  { id: "return-window", label: "1. 7-Day Return & Exchange Window" },
  { id: "garment-condition", label: "2. Condition & Eligibility Criteria" },
  { id: "non-returnable", label: "3. Non-Returnable Categories" },
  { id: "damaged-defective", label: "4. Transit Damage & Defective Items" },
  { id: "refund-timelines", label: "5. Refund Modes & Timelines (2026)" },
  { id: "order-cancellation", label: "6. Order Cancellation Policy" },
  { id: "step-by-step", label: "7. How to Initiate a Return / Replace" },
];

export const RefundPolicyPage: React.FC = () => {
  return (
    <PolicyLayout
      title="Refund, Return & Cancellation Policy"
      leadSubtitle="Bagodi guarantees confidence and seamless satisfaction for every luxury purchase. This policy outlines clear, transparent guidelines for returns, exchanges, replacements, and automated refunds in strict accordance with Rule 5(3)(e) of the Consumer Protection (E-Commerce) Rules, 2026."
      activePolicy="refund"
      tocItems={TOC_ITEMS}
    >
      {/* 1. Window */}
      <section id="return-window" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <Clock size={20} className={styles.sectionIcon} />
          <span>1. Standard 7-Day Return & Exchange Window</span>
        </h2>
        <p className={styles.paragraph}>
          We offer an affirmative <strong>7-calendar-day return and replacement window</strong> starting from the exact
          date and timestamp when your parcel is marked as delivered by our logistics carrier.
        </p>
        <p className={styles.paragraph}>
          Whether you require a different size in a ready-made suit, wish to exchange an unstitched Raymond fabric cut,
          or request a full refund, our dedicated Bidar Atelier Concierge team processes your request with priority.
        </p>

        <div className={styles.calloutBox}>
          <CheckCircle2 size={18} className={styles.calloutIcon} />
          <div className={styles.calloutContent}>
            <div className={styles.calloutTitle}>Zero Return Shipping Fee</div>
            <p className={styles.calloutText}>
              For all genuine returns, defect replacements, and size exchanges across India, Bagodi arranges complimentary
              reverse doorstep courier pickup at zero cost to the customer.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Condition */}
      <section id="garment-condition" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <RotateCcw size={20} className={styles.sectionIcon} />
          <span>2. Condition & Eligibility Criteria</span>
        </h2>
        <p className={styles.paragraph}>
          To maintain luxury hygiene and authenticity standards, returned garments must satisfy the following criteria:
        </p>
        <ul className={styles.bulletList}>
          <li className={styles.bulletItem}>
            <strong>Original Brand Tags Intact:</strong> The item must retain all original manufacturer tags, Silk Mark
            holograms, Raymond seals, and Bagodi luxury barcodes undamaged and unremoved.
          </li>
          <li className={styles.bulletItem}>
            <strong>Unworn, Unwashed & Pristine:</strong> Apparel must be free from fragrance, perfume, deodorant marks,
            creasing, stains, or signs of wear.
          </li>
          <li className={styles.bulletItem}>
            <strong>Complete Original Packaging:</strong> Fabric cuts and sarees must be neatly repacked inside the
            original luxury gift box, protective polybag, and branded satchel with all accompanying swatches.
          </li>
        </ul>
      </section>

      {/* 3. Non-returnable */}
      <section id="non-returnable" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <XCircle size={20} className={styles.sectionIcon} />
          <span>3. Non-Returnable & Non-Refundable Categories</span>
        </h2>
        <p className={styles.paragraph}>
          In accordance with standard retail hygiene norms and bespoke craftsmanship conventions, the following items are
          non-returnable:
        </p>
        <ul className={styles.bulletList}>
          <li className={styles.bulletItem}>
            <strong>Custom Bespoke Stitched Garments:</strong> Blazers, sherwanis, or trousers that have been tailored,
            altered, hemmed, or personalized to specific customer body measurements by our tailoring atelier.
          </li>
          <li className={styles.bulletItem}>
            <strong>Cut Fabrics from Running Rolls:</strong> Fabrics specifically cut to non-standard custom lengths at
            customer request (as opposed to standard pre-packed 1.3m / 2.5m combo sets).
          </li>
          <li className={styles.bulletItem}>
            <strong>Clearance / Final Sale Archive Pieces:</strong> Garments explicitly demarcated as &ldquo;Final Sale —
            Non-Returnable&rdquo; on the product description page.
          </li>
        </ul>
      </section>

      {/* 4. Damaged/Defective */}
      <section id="damaged-defective" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <AlertCircle size={20} className={styles.sectionIcon} />
          <span>4. Transit Damage & Defective Deliveries</span>
        </h2>
        <p className={styles.paragraph}>
          Every parcel dispatched from our Bidar flagship mall undergoes rigorous 3-stage visual quality inspection. In the
          unlikely event you receive a damaged, soiled, or incorrect item:
        </p>
        <ol className={styles.bulletList}>
          <li className={styles.bulletItem}>
            Notify us within <strong>48 hours of delivery</strong> via your Account Hub or by emailing{" "}
            <strong>support@bagodi.in</strong> with photos of the damaged area and the shipping label.
          </li>
          <li className={styles.bulletItem}>
            Our concierge will instantly authorize an expedited priority replacement dispatched within 24 hours, or
            initiate a 100% full refund with zero deductions.
          </li>
        </ol>
      </section>

      {/* 5. Timelines Table */}
      <section id="refund-timelines" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <CreditCard size={20} className={styles.sectionIcon} />
          <span>5. Refund Settlement Channels & Mandated Timelines (2026)</span>
        </h2>
        <p className={styles.paragraph}>
          Once a returned parcel is inspected at our Bidar fulfillment hub or verified via doorstep courier scan, the
          refund is initiated automatically to your account:
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.policyTable}>
            <thead>
              <tr>
                <th>Payment Mode</th>
                <th>Refund Settlement Channel</th>
                <th>Processing Timeline</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Unified Payments Interface (UPI)</strong></td>
                <td>Reversal to original Virtual Payment Address (VPA)</td>
                <td><strong>24 to 48 Hours</strong></td>
              </tr>
              <tr>
                <td><strong>Credit / Debit Cards</strong></td>
                <td>Reversal to issuing bank account / card network</td>
                <td><strong>3 to 5 Banking Days</strong></td>
              </tr>
              <tr>
                <td><strong>Net Banking</strong></td>
                <td>Direct bank account transfer (NEFT/RTGS)</td>
                <td><strong>2 to 4 Banking Days</strong></td>
              </tr>
              <tr>
                <td><strong>Cash on Delivery (COD)</strong></td>
                <td>Direct Bank Transfer (NEFT) or Instant UPI Transfer to customer-provided VPA</td>
                <td><strong>24 to 48 Hours</strong> upon bank detail submission in Account Hub</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Cancellation */}
      <section id="order-cancellation" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <RefreshCw size={20} className={styles.sectionIcon} />
          <span>6. Order Cancellation Policy</span>
        </h2>
        <p className={styles.paragraph}>
          We understand that occasions and plans change. Bagodi provides a straightforward cancellation structure:
        </p>
        <ul className={styles.bulletList}>
          <li className={styles.bulletItem}>
            <strong>Cancellation Before Dispatch:</strong> You may cancel any ready-made or fabric order anytime before it
            is dispatched from our Bidar flagship atelier directly through your <em>My Orders</em> dashboard with 100%
            instant refund.
          </li>
          <li className={styles.bulletItem}>
            <strong>Cancellation After Dispatch:</strong> If the order has already been handed over to the courier partner,
            you may simply decline to share the Delivery OTP or refuse delivery upon arrival. The package will return to
            our hub and a complete refund will be processed upon reverse scan.
          </li>
        </ul>
      </section>

      {/* 7. Walkthrough */}
      <section id="step-by-step" className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>
          <HelpCircle size={20} className={styles.sectionIcon} />
          <span>7. How to Initiate a Return or Replacement</span>
        </h2>
        <ol className={styles.bulletList}>
          <li className={styles.bulletItem}>
            <strong>Step 1:</strong> Navigate to <strong>My Account &gt; My Orders</strong> on bagodi.in.
          </li>
          <li className={styles.bulletItem}>
            <strong>Step 2:</strong> Select the delivered order and click <em>Return or Replace Item</em>.
          </li>
          <li className={styles.bulletItem}>
            <strong>Step 3:</strong> Choose your preference (Replacement Size / Full Refund) and state the reason.
          </li>
          <li className={styles.bulletItem}>
            <strong>Step 4:</strong> Our logistics partner will arrive at your doorstep within 24–48 hours for reverse
            pickup. Hand over the sealed box and verify pickup via SMS notification.
          </li>
        </ol>
      </section>
    </PolicyLayout>
  );
};
