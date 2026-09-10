import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { content } from "./content";
import "./Hero.css";
import MotionArrow from "./MotionArrow";

export default function Hero({ onWork, onBook }: { onWork: () => void; onBook: () => void }) {
  const root = useRef<HTMLElement>(null);
  const picture = useRef<HTMLPictureElement>(null);
  const foreground = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const source = content.work.find(item => item.id === "fb-1514560656858173");
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = true;
    const paint = () => {
      frame = 0;
      if (!root.current) return;
      const progress = Math.min(1, Math.max(0, -root.current.getBoundingClientRect().top / root.current.offsetHeight));
      if (picture.current) picture.current.style.transform = media.matches ? "none" : `scale(${1 + progress * 0.035})`;
      if (foreground.current) {
        const top = foreground.current.getBoundingClientRect().top;
        // Clear the fixed navigation before outgoing hero copy crosses its mark.
        const opacity = media.matches ? (top > 112 ? 1 : 0) : Math.min(1, Math.max(0, (top - 112) / 160));
        foreground.current.style.opacity = String(opacity);
      }
    };
    const schedule = () => {
      if (!frame && visible && document.visibilityState === "visible") frame = requestAnimationFrame(paint);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); });
    if (root.current) observer.observe(root.current);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    media.addEventListener("change", paint);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      media.removeEventListener("change", paint);
    };
  }, []);
  return (
    <section className={`film-hero ${failed ? "hero-media-failed" : ""}`} ref={root} aria-label="EventCast Maldives production">
      <div className="hero-still">
        {!failed && <picture ref={picture}>
          <source media="(max-width: 600px)" srcSet="/assets/social/fb-1514560636858175-original.jpg" />
          <img src="/assets/social/fb-1514560656858173-original.jpg" alt="EventCast crew producing the Hiyala handball coverage" width="2048" height="1363" fetchPriority="high" onError={() => setFailed(true)} />
        </picture>}
        <div className="hero-shade" />
      </div>
      <div className="hero-content" ref={foreground} onFocusCapture={event => {
        const target = event.target;
        if (target.matches("a, button") && target.getBoundingClientRect().top < 112) {
          target.scrollIntoView({ block: "center", behavior: "instant" });
        }
      }}>
        <h1 tabIndex={-1}><span><span>Your event.</span></span><span><span>In focus.</span></span></h1>
        <div className="hero-bottom">
          <div className="hero-intent">
            <p>On the ground. Behind the cameras.<br />Bringing island moments to your screen.</p>
            <div className="hero-actions">
              <button className="button hero-primary" onClick={onWork}>Explore our work <MotionArrow size={18} /></button>
              <button className="hero-secondary text-link" onClick={onBook}>Plan an event <MotionArrow size={17} /></button>
            </div>
          </div>
          <a className="hero-credit" href={source?.source || "https://www.facebook.com/eventcastmv"} target="_blank" rel="noreferrer">Behind the scenes · Hiyala 2025 <MotionArrow size={13} /></a>
        </div>
      </div>
      <a className="hero-scroll" href="#introduction" aria-label="Discover EventCast"><ArrowDown size={18} /></a>
    </section>
  );
}
