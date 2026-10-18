import { useState, useEffect } from "react";
import { getAvatarUrl } from "../../../utils/avatar";

export function useNavCajero(userName: string) {
  const [time, setTime] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      const timeString = now.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      setTime(timeString);
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const avatarUrl = getAvatarUrl(userName);

  return {
    time,
    isMobileMenuOpen,
    toggleMobileMenu,
    avatarUrl,
  };
}
