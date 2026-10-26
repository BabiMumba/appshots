/**
 * ScreenContent Component
 *
 * Renders the content displayed on the device screen with cover-fit + zoom/pan.
 */

interface ScreenContentProps {
  screenshotSrc: string | null;
  imageZoom?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
}

export const ScreenContent = ({
  screenshotSrc,
  imageZoom = 1,
  imageOffsetX = 0,
  imageOffsetY = 0,
}: ScreenContentProps) => {
  if (screenshotSrc) {
    const zoom = Math.max(0.5, Math.min(3, imageZoom || 1));
    return (
      <div className="w-full h-full overflow-hidden relative bg-black">
        <img
          src={screenshotSrc}
          alt="Screenshot"
          className="absolute left-1/2 top-1/2 max-w-none"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `translate(calc(-50% + ${imageOffsetX}%), calc(-50% + ${imageOffsetY}%)) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#1c1c1e]">
      <span className="text-gray-600 text-[10px]">No image</span>
    </div>
  );
};
