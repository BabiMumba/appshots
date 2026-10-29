/**
 * AppShots wordmark + aperture monogram.
 */

interface BrandMarkProps {
  className?: string;
  /** Show text next to the mark */
  withWordmark?: boolean;
  size?: number;
}

export const BrandMark = ({
  className = "",
  withWordmark = true,
  size = 28,
}: BrandMarkProps) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <img
      src="/brand/logo.svg"
      alt=""
      width={size}
      height={size}
      className="shrink-0"
    />
    {withWordmark && (
      <span
        className="font-semibold tracking-tight text-inherit"
        style={{ fontFamily: "Sora, system-ui, sans-serif" }}
      >
        AppShots
      </span>
    )}
  </span>
);
