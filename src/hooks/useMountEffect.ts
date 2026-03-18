import { useEffect } from "react";

type CleanupFn = (() => void) | void;

export function useMountEffect(callback: () => CleanupFn) {
  // Intentional mount-only behavior for external setup/cleanup logic.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, []);
}
