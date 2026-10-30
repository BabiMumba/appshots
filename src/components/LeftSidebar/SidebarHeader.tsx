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
        className="text-white text-base group-hover:text-sky-300 transition-colors"
        size={26}
      />
      <p className="text-xs text-gray-400 mt-2">
        Phone, tablet &amp; feature graphic — separate projects
      </p>
    </Link>
  </div>
);
