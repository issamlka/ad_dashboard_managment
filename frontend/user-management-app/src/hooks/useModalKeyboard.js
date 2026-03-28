import { useEffect } from "react";

export function useModalKeyboard({ onEscape, onEnter, isOpen }) {
  useEffect(() => {
    // Don't listen if modal is closed
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onEscape) {
        onEscape();
      }
      if (e.key === "Enter" && onEnter) {
        // Prevent default form submission
        e.preventDefault();
        onEnter();
      }
    };

    // Add listener when modal opens
    window.addEventListener("keydown", handleKeyDown);

    // Remove listener when modal closes
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onEscape, onEnter]);
}
