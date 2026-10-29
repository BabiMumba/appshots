/**
 * SidebarHeader — brand + link back to landing.
 */

import { Link } from "@tanstack/react-router";
import { STYLES } from "./constants";

export const SidebarHeader = () => (
  <div className={STYLES.header}>
    <Link to="/" className="group block">
      <h1 className="text-lg font-semibold group-hover:text-[#c8f542] transition-colors">
        AppShots
      </h1>
      <p className="text-xs text-gray-400 mt-1">
        Create App Store and Google Play screenshots
      </p>
    </Link>
  </div>
);
