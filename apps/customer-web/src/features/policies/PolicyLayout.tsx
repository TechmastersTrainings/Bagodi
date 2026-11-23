import React, { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  Scale,
  RefreshCw,
  Clock,
  Building2,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import styles from "./PolicyLayout.module.css";

interface TocItem {
  id: string;
  label: string;
}

interface PolicyLayoutProps {
  title: string;
  leadSubtitle: string;
  activePolicy: "privacy" | "terms" | "refund";
  tocItems: TocItem[];
  children: ReactNode;
}

export const PolicyLayout: React.FC<PolicyLayoutProps> = ({
  title,
  leadSubtitle,
  activePolicy,
  tocItems,
  children,
}) => {
  const location = useLocation();

  return (
    <div className={styles.pageRoot}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumbNav} aria-label="Breadcrumb">
          <Link to="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <ChevronRight size={13} />
          <span>Policies</span>
          <ChevronRight size={13} />
          <span className={styles.breadcrumbCurrent}>{title}</span>
        </nav>

        {/* Policy Header Banner */}
        <header className={styles.policyHeader}>
          <div className={styles.complianceBadge}>
            <ShieldCheck size={14} />
            <span>Digital Personal Data Protection Act 2023 & E-Commerce Rules 2026</span>
          </div>

          <h1 className={styles.title}>{title}</h1>
          <p className={styles.leadSubtitle}>{leadSubtitle}</p>

          <div className={styles.metaRow}>
            <div className={styles.metaItem}>
              <Clock size={14} />
              <span>Effective Date: January 1, 2026</span>
            </div>
            <div className={styles.metaItem}>
              <Building2 size={14} />
              <span>Entity: Bagodi Shopping Mall (Bidar Flagship Atelier)</span>
            </div>
            <div className={styles.metaItem}>
              <MapPin size={14} />
              <span>Jurisdiction: Bidar, Karnataka, India</span>
            </div>
          </div>
        </header>

        {/* Policy Nav Tabs */}
        <nav className={styles.tabsTrack} aria-label="Legal Policy Navigation">
          <Link
            to="/policies/privacy"
            className={`${styles.tabBtn} ${activePolicy === "privacy" ? styles.tabBtnActive : ""}`}
          >
            <ShieldCheck size={16} />
            <span>Privacy Policy</span>
          </Link>
          <Link
            to="/policies/terms"
            className={`${styles.tabBtn} ${activePolicy === "terms" ? styles.tabBtnActive : ""}`}
          >
            <Scale size={16} />
            <span>Terms of Service</span>
          </Link>
          <Link
            to="/policies/refund"
            className={`${styles.tabBtn} ${activePolicy === "refund" ? styles.tabBtnActive : ""}`}
          >
            <RefreshCw size={16} />
            <span>Refund & Returns Policy</span>
          </Link>
        </nav>

        {/* Content Grid */}
        <div className={styles.layoutGrid}>
          {/* Left Table of Contents */}
          <aside className={styles.tocSidebar}>
            <div className={styles.tocTitle}>Table of Contents</div>
            <ul className={styles.tocList}>
              {tocItems.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className={styles.tocLink}>
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#grievance-redressal" className={styles.tocLink}>
                  Grievance Officer (2026 Statutory)
                </a>
              </li>
            </ul>
          </aside>

          {/* Main Content Article */}
          <main className={styles.mainArticle}>
            {children}

            {/* Statutory Grievance Redressal Card required by Consumer Protection E-Commerce Rules */}
            <section id="grievance-redressal" className={styles.grievanceCard}>
              <div className={styles.grievanceHeader}>
                <span className={styles.grievanceBadge}>Statutory Compliance</span>
                <h3 className={styles.grievanceTitle}>
                  Grievance Redressal Officer & Nodal Contact (Rule 5(6), E-Commerce Rules 2026)
                </h3>
              </div>
              <p className={styles.paragraph} style={{ marginBottom: "0.5rem" }}>
                Under the Consumer Protection (E-Commerce) Rules, 2020 (as amended 2026) and the
                Digital Personal Data Protection Act, 2023, Bagodi has appointed a designated Grievance
                Officer to address customer complaints, data requests, and dispute escalation within 48
                hours acknowledgment and 30 days resolution.
              </p>

              <div className={styles.grievanceGrid}>
                <div className={styles.grievanceItem}>
                  <UserCheck size={16} className={styles.grievanceIcon} />
                  <div>
                    <strong>Officer In-Charge</strong>
                    <span>Head of Customer Assurance & Legal Compliance</span>
                  </div>
                </div>

                <div className={styles.grievanceItem}>
                  <Mail size={16} className={styles.grievanceIcon} />
                  <div>
                    <strong>Dedicated Grievance Email</strong>
                    <a
                      href="mailto:grievance@bagodi.in"
                      style={{ color: "#A51F27", textDecoration: "underline" }}
                    >
                      grievance@bagodi.in
                    </a>
                  </div>
                </div>

                <div className={styles.grievanceItem}>
                  <Phone size={16} className={styles.grievanceIcon} />
                  <div>
                    <strong>Direct Concierge Support</strong>
                    <span>+91 98450 12345 / +91 98807 68222</span>
                  </div>
                </div>

                <div className={styles.grievanceItem}>
                  <MapPin size={16} className={styles.grievanceIcon} />
                  <div>
                    <strong>Physical Flagship Mall Address</strong>
                    <span>BAGODI Shopping Mall, Fort Road Landmark, Bidar, Karnataka 585401, India</span>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};
