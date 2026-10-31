/**
 * Flag icon via country-flag-icons (tree-shakeable per-flag imports).
 */

import type { ComponentType } from "react";
import US from "country-flag-icons/react/3x2/US";
import GB from "country-flag-icons/react/3x2/GB";
import AU from "country-flag-icons/react/3x2/AU";
import CA from "country-flag-icons/react/3x2/CA";
import FR from "country-flag-icons/react/3x2/FR";
import DE from "country-flag-icons/react/3x2/DE";
import ES from "country-flag-icons/react/3x2/ES";
import MX from "country-flag-icons/react/3x2/MX";
import IT from "country-flag-icons/react/3x2/IT";
import PT from "country-flag-icons/react/3x2/PT";
import BR from "country-flag-icons/react/3x2/BR";
import NL from "country-flag-icons/react/3x2/NL";
import PL from "country-flag-icons/react/3x2/PL";
import RU from "country-flag-icons/react/3x2/RU";
import JP from "country-flag-icons/react/3x2/JP";
import KR from "country-flag-icons/react/3x2/KR";
import CN from "country-flag-icons/react/3x2/CN";
import TW from "country-flag-icons/react/3x2/TW";
import SA from "country-flag-icons/react/3x2/SA";
import TR from "country-flag-icons/react/3x2/TR";
import SE from "country-flag-icons/react/3x2/SE";
import DK from "country-flag-icons/react/3x2/DK";
import FI from "country-flag-icons/react/3x2/FI";
import NO from "country-flag-icons/react/3x2/NO";
import CZ from "country-flag-icons/react/3x2/CZ";
import HU from "country-flag-icons/react/3x2/HU";
import RO from "country-flag-icons/react/3x2/RO";
import UA from "country-flag-icons/react/3x2/UA";
import TH from "country-flag-icons/react/3x2/TH";
import VN from "country-flag-icons/react/3x2/VN";
import ID from "country-flag-icons/react/3x2/ID";
import IN from "country-flag-icons/react/3x2/IN";

type FlagComp = ComponentType<{ className?: string }>;

const FLAGS: Record<string, FlagComp> = {
  US, GB, AU, CA, FR, DE, ES, MX, IT, PT, BR, NL, PL, RU, JP, KR, CN, TW, SA,
  TR, SE, DK, FI, NO, CZ, HU, RO, UA, TH, VN, ID, IN,
};

interface LocaleFlagProps {
  countryCode: string;
  className?: string;
  title?: string;
  /** Circular crop like language pickers in store tools */
  round?: boolean;
}

export const LocaleFlag = ({
  countryCode,
  className,
  title,
  round = true,
}: LocaleFlagProps) => {
  const Comp = FLAGS[countryCode.toUpperCase()];
  const shell = round
    ? `inline-flex h-5 w-5 shrink-0 overflow-hidden rounded-full ring-1 ring-black/10 ${className ?? ""}`
    : `inline-flex h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] shadow-sm ${className ?? ""}`;

  if (!Comp) {
    return (
      <span
        className={`${shell} items-center justify-center bg-[var(--ed-muted)] text-[8px] font-semibold text-[var(--ed-fg-muted)]`}
        title={title ?? countryCode}
      >
        {countryCode.slice(0, 2)}
      </span>
    );
  }

  return (
    <span title={title} className={shell}>
      <Comp className="h-full w-full scale-150 object-cover" />
    </span>
  );
};
