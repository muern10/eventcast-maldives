import { useCallback, useEffect, useRef } from "react";
import { flushSync } from "react-dom";

/** Compare destinations, excluding filters, gallery items and in-page anchors. */
export function pageIdentity(query: URLSearchParams) {
  const view = query.get("view") || "home";
  if (view === "work") return `${view}:${query.get("project") || "archive"}`;
  if (view === "event") return `${view}:${query.get("event") || "missing"}`;
  return view;
}

export function usePageTransition() {
  const sequence = useRef(0);
  const active = useRef<ViewTransition | null>(null);
  const fallback = useRef<Animation | null>(null);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const stopMotion = () => {
      if (!media.matches) return;
      active.current?.skipTransition();
      fallback.current?.cancel();
    };
    media.addEventListener("change", stopMotion);
    return () => {
      sequence.current++;
      active.current?.skipTransition();
      fallback.current?.cancel();
      media.removeEventListener("change", stopMotion);
    };
  }, []);

  return useCallback((update: () => void, position: () => void, changesPage: boolean) => {
    const request = ++sequence.current;
    active.current?.skipTransition();
    active.current = null;
    fallback.current?.cancel();
    fallback.current = null;
    if (!changesPage) {
      update();
      position();
      return;
    }
    let committed = false;
    const commit = () => {
      // A skipped native transition still invokes its update callback.
      if (request !== sequence.current || committed) return;
      committed = true;
      flushSync(update);
      position();
    };
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced && document.visibilityState === "visible" && document.startViewTransition) {
      try {
        const transition = document.startViewTransition(commit);
        active.current = transition;
        // Skipping an interrupted transition rejects ready, but navigation is valid.
        void transition.ready.catch(() => {});
        const clear = () => { if (active.current === transition) active.current = null; };
        void transition.finished.then(clear, clear);
        return;
      } catch {
        // Enhancement failure must not prevent reaching the destination.
      }
    }
    commit();
    const main = document.getElementById("main-content");
    if (!reduced && document.visibilityState === "visible" && main?.animate) {
      // Opacity keeps the fixed hero's containing block unchanged in older browsers.
      fallback.current = main.animate([{ opacity: .35 }, { opacity: 1 }], {
        duration: 240, easing: "cubic-bezier(.22,1,.36,1)",
      });
    }
  }, []);
}
