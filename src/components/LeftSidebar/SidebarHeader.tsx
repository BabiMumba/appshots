/**
 * SidebarHeader — brand + link back to landing.
 */

import { Link } from "@tanstack/react-router";
import { BrandMark } from "../Brand/BrandMark";
import { STYLES } from "./constants";

export const SidebarHeader = () => (
  <div className={STYLES.header}>
    <Link to="/" className="group block">
      <BrandMark
        className="text-[var(--ed-fg)] text-base group-hover:text-sky-500 transition-colors"
        size={26}
      />
      <p className="text-xs text-[var(--ed-fg-muted)] mt-2">
        Phone, tablet &amp; feature graphic — separate projects
      </p>
    </Link>
  </div>
);
