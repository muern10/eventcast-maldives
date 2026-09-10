import { useEffect, useRef } from "react";

/** One entrance per mounted element. Content is visible even without this enhancement. */
export function useEditorialMotion(routeIdentity: string) {
  const revealed = useRef(new WeakSet<Element>());

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches || !("IntersectionObserver" in window) || !Element.prototype.animate) return;
    const small = matchMedia("(max-width: 600px)");
    const seen = new WeakSet<Element>();
    const pending = new Set<HTMLElement>();
    const animations = new Map<Animation, HTMLElement>();
    const ease = getComputedStyle(document.documentElement).getPropertyValue("--ease").trim() || "cubic-bezier(.22,1,.36,1)";
    const finish = (target: HTMLElement) => {
      target.removeAttribute("data-motion-pending");
      pending.delete(target);
      revealed.current.add(target);
      if (target.matches(".intro-copy")) target.classList.add("is-revealed");
    };
    const play = (target: HTMLElement, frames: Keyframe[], duration: number, delay: number) => {
      try {
        const animation = target.animate(frames, { duration, delay, easing: ease, fill: "backwards" });
        animations.set(animation, target);
        const release = () => animations.delete(animation);
        animation.onfinish = release;
        animation.oncancel = release;
      } catch {
        // Failed motion must never hide a photograph, a heading or a control.
      }
    };
    const observer = new IntersectionObserver(entries => {
      const entering = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      let order = 0;
      entering.forEach(entry => {
        const target = entry.target as HTMLElement;
        observer.unobserve(target);
        finish(target);
        // Fast scrolling, focus and restoration take precedence over a sequence.
        const active = document.activeElement;
        const focused = target.contains(active) || (active !== document.body && active?.contains(target));
        if (reduced.matches || document.hidden || entry.boundingClientRect.top < 112 || focused) return;
        if (target.matches(".intro-copy")) return;
        const kind = target.dataset.reveal;
        const image = kind === "image";
        const heading = kind === "heading";
        const delay = Math.min(order++, 2) * (small.matches ? 35 : 60);
        if (image) {
          play(target, [
            { opacity: .7, clipPath: "inset(0 0 18% 0)" },
            { opacity: 1, clipPath: "inset(0 0 0% 0)" },
          ], small.matches ? 500 : 700, delay);
        } else {
          play(target, [
            { opacity: heading ? .3 : .55, transform: `translateY(${small.matches ? 10 : heading ? 24 : 16}px)`, ...(heading ? { clipPath: "inset(0 0 70% 0)" } : {}) },
            { opacity: 1, transform: "translateY(0)", ...(heading ? { clipPath: "inset(0 0 0% 0)" } : {}) },
          ], small.matches ? 440 : heading ? 620 : 520, delay);
        }
      });
    }, { threshold: .08, rootMargin: "0px 0px -24px 0px" });
    const observe = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal], .intro-copy").forEach(target => {
        // Gallery advances are immediate interactions, never scroll entrances.
        if (seen.has(target) || target.closest("dialog")) return;
        seen.add(target);
        if (revealed.current.has(target) || target.getBoundingClientRect().top < window.innerHeight - 24) {
          finish(target);
        } else {
          observer.observe(target);
          // Prepare only offscreen nodes after enrollment succeeds. Otherwise a
          // fast scroll can paint the final frame before the observer runs.
          if (!target.matches(".intro-copy")) target.setAttribute("data-motion-pending", "");
          pending.add(target);
        }
      });
    };
    const cancel = () => {
      animations.forEach((_, animation) => animation.cancel());
      animations.clear();
    };
    const focus = (event: FocusEvent) => {
      const focused = event.target;
      if (!(focused instanceof Element)) return;
      pending.forEach(target => {
        if (target.contains(focused) || focused.contains(target)) {
          observer.unobserve(target);
          finish(target);
        }
      });
      animations.forEach((target, animation) => {
        if (target.contains(focused) || focused.contains(target)) animation.cancel();
      });
    };
    const mutation = new MutationObserver(observe);
    const main = document.getElementById("main-content");
    observe();
    if (main) mutation.observe(main, { childList: true, subtree: true });
    const stop = () => {
      if (reduced.matches) {
        cancel();
        observer.disconnect();
        mutation.disconnect();
        pending.forEach(finish);
        document.querySelectorAll<HTMLElement>(".intro-copy").forEach(finish);
      }
    };
    const visibility = () => { if (document.hidden) cancel(); };
    document.addEventListener("focusin", focus);
    document.addEventListener("visibilitychange", visibility);
    reduced.addEventListener("change", stop);
    return () => {
      observer.disconnect();
      mutation.disconnect();
      cancel();
      pending.forEach(target => target.removeAttribute("data-motion-pending"));
      pending.clear();
      document.removeEventListener("focusin", focus);
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", stop);
    };
  }, [routeIdentity]);
}
