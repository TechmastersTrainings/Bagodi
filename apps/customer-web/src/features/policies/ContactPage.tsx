import React from "react";
import { Building2, Clock, Mail, MapPin, Phone, HelpCircle } from "lucide-react";
import styles from "./PolicyLayout.module.css";

export const ContactPage: React.FC = () => {
  return (
    <div className={styles.pageRoot}>
      <div className={styles.container}>
        <header className={styles.policyHeader}>
          <div className={styles.complianceBadge}>
            <Building2 size={14} />
            <span>Bagodi Flagship Shopping Mall • Bidar, Karnataka</span>
          </div>
          <h1 className={styles.title}>Contact Us & Store Directory</h1>
          <p className={styles.subtitle}>
            Visit our Bidar flagship showroom or connect with Bagodi concierge support, bespoke tailoring desk, and partner relations.
          </p>
        </header>

        <div className={styles.mainContent} style={{ display: "grid", gap: "1.5rem" }}>
          <section style={{ padding: "1.5rem", background: "#FBF9F6", border: "1px solid #E5DED3", borderRadius: 14 }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 0 }}>
              <MapPin size={18} color="#A51F27" /> Flagship Store Address
            </h2>
            <p>
              <strong>Bagodi Shopping Mall</strong>
              <br />
              Meenakshi Tower, Udgir Road, Opp. Reliance Petrol Pump, Near Raymond Shop,
              <br />
              Bidar, Karnataka — 585401
            </p>
            <p style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={15} /> Open All 7 Days: 10:00 AM – 9:30 PM IST
            </p>
            <p style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Phone size={15} /> Customer Helpline: +91 99720 00805
            </p>
            <p style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Mail size={15} /> Concierge & Support: support@bagodi.in
            </p>
          </section>

          <section style={{ padding: "1.5rem", background: "#FFFFFF", border: "1px solid #E5DED3", borderRadius: 14 }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 0 }}>
              <HelpCircle size={18} color="#A51F27" /> Frequently Asked Questions & Partner Inquiries
            </h2>
            <p>
              <strong>Orders, Delivery & OTP Handover:</strong> Hyperlocal Bidar orders ship via our dedicated fleet with 6-digit OTP verification; outstation shipments include full tracking in My Orders.
            </p>
            <p>
              <strong>Returns & Size Exchanges:</strong> Eligible delivered garments can be returned or exchanged directly from Account → Return & Replace.
            </p>
            <p>
              <strong>Careers & Brand Partnerships:</strong> For boutique partnerships, designer collaborations, or careers in Bidar, write to partners@bagodi.in or visit our store office.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

