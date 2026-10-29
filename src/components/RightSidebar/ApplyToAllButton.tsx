/**
 * Compact action to copy the active screen's style onto every other screen.
 */

interface ApplyToAllButtonProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export const ApplyToAllButton = ({
  label,
  disabled = false,
  onClick,
}: ApplyToAllButtonProps) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    title={
      disabled
        ? "Add another screenshot to use this"
        : "Copy from this screen to all others"
    }
    className="w-full mt-2 rounded-md border border-white/10 bg-transparent px-2.5 py-1.5 text-[11px] text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-zinc-400"
  >
    {label}
  </button>
);
