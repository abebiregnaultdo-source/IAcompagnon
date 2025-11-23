import { useState, useEffect } from "react";

/**
 * Hook pour détecter le type d'appareil (mobile, tablette, desktop)
 * et les dimensions de l'écran
 */
export function useDeviceDetection() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
    orientation: "landscape",
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const orientation = width > height ? "landscape" : "portrait";

      // Breakpoints
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        width,
        height,
        orientation,
        // Détection tactile
        isTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
        // User agent (fallback)
        isMobileUA: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
      });
    };

    // Initialisation
    updateDeviceInfo();

    // Écouter les changements de taille
    window.addEventListener("resize", updateDeviceInfo);
    window.addEventListener("orientationchange", updateDeviceInfo);

    return () => {
      window.removeEventListener("resize", updateDeviceInfo);
      window.removeEventListener("orientationchange", updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

/**
 * Hook pour obtenir la classe CSS selon l'appareil
 */
export function useDeviceClass() {
  const device = useDeviceDetection();

  const classes = [];
  if (device.isMobile) classes.push("device-mobile");
  if (device.isTablet) classes.push("device-tablet");
  if (device.isDesktop) classes.push("device-desktop");
  if (device.isTouch) classes.push("device-touch");
  if (device.orientation === "portrait") classes.push("orientation-portrait");
  if (device.orientation === "landscape") classes.push("orientation-landscape");

  return classes.join(" ");
}
