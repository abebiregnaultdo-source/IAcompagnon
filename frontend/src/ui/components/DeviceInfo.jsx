import { useDeviceDetection } from "../../hooks/useDeviceDetection";

/**
 * Composant de debug pour afficher les informations de l'appareil
 * À utiliser uniquement en développement
 */
export default function DeviceInfo({ show = false }) {
  const device = useDeviceDetection();

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "8px",
        fontSize: "12px",
        zIndex: 9999,
        fontFamily: "monospace",
        maxWidth: "250px",
      }}
    >
      <div>
        <strong>Device Info:</strong>
      </div>
      <div>
        Type:{" "}
        {device.isMobile ? "Mobile" : device.isTablet ? "Tablet" : "Desktop"}
      </div>
      <div>Width: {device.width}px</div>
      <div>Height: {device.height}px</div>
      <div>Orientation: {device.orientation}</div>
      <div>Touch: {device.isTouch ? "Yes" : "No"}</div>
    </div>
  );
}
