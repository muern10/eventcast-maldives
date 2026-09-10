import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Menu,
  Radio,
  X,
  CalendarDays,
  Video,
} from "lucide-react";
import { brand, content, events, byId, type EventRecord } from "./content";
import { MediaCard } from "./media";
import { projectById } from "./projects";
import { Archive, LiveView, Detail, MissingView } from "./views";
import Booking from "./Booking";
import Hero from "./Hero";
import MotionArrow from "./MotionArrow";
import { useEditorialMotion } from "./useEditorialMotion";
import About from "./About";
import Portfolio, { WorkPreview } from "./Portfolio";
import { pageIdentity, usePageTransition } from "./usePageTransition";
import "./fonts.css";
import "./style.css";

function Link({
  to,
  children,
  className = "",
  label,
  onNavigate,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  label?: string;
  onNavigate: (to: string) => void;
}) {
  return (
    <a
      href={"?" + to}
      className={className}
      aria-label={label}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onNavigate(to);
      }}
    >
      {children}
    </a>
  );
}

function App() {
  const [route, setRoute] = useState(
    () => new URLSearchParams(location.search),
  );
  const currentSearch = useRef(location.search);
  const transitionPage = usePageTransition();
  const [drawer, setDrawer] = useState<"menu" | "contact" | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const panelClose = useRef<HTMLButtonElement>(null);
  const view = route.get("view") || "home";
  const event = view === "event" ? byId(route.get("event") || "") : undefined;
  const routeIdentity = pageIdentity(route);
  const previousRoute = useRef(routeIdentity);
  const [statusTick, setStatusTick] = useState(0);
  const [headerSolid, setHeaderSolid] = useState(false);
  const [logoOnPhoto, setLogoOnPhoto] = useState(view === "home");
  useEffect(() => {
    const update = () => {
      setHeaderSolid(window.scrollY > Math.min(window.innerHeight * .6, 500));
      const surface = document.querySelector(".home-editorial")?.getBoundingClientRect();
      const logo = document.querySelector(".brand")?.getBoundingClientRect();
      setLogoOnPhoto(view === "home" && !!surface && !!logo && surface.top > logo.top + logo.height / 2);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [view]);
  useEffect(() => {
    const deadlines = events
      .filter((e) => e.status === "live")
      .map((e) => Date.parse(e.liveVerifiedUntil || ""))
      .filter((t) => Number.isFinite(t) && t > Date.now());
    if (!deadlines.length) return;
    const timer = setTimeout(
      () => setStatusTick((t) => t + 1),
      Math.min(Math.min(...deadlines) - Date.now() + 1, 2147483647),
    );
    return () => clearTimeout(timer);
  }, [statusTick]);
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") setStatusTick((t) => t + 1);
    };
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, []);
  useEffect(() => {
    const project = view === "work" ? projectById(route.get("project") || "") : undefined;
    document.title = project ? `${project.title} — EventCast Maldives` : event
      ? `${event.title} — EventCast Maldives`
      : view === "broadcasts"
        ? "Broadcasts — EventCast Maldives"
        : view === "about"
          ? "About — EventCast Maldives"
          : view === "work"
            ? "Our work — EventCast Maldives"
            : view === "live"
              ? "Live — EventCast Maldives"
              : "EventCast Maldives — Broadcasts & production";
    if (view === "broadcasts" && route.get("focus") === "search")
      document
        .getElementById("broadcast-search")
        ?.focus({ preventScroll: true });
    else if (previousRoute.current !== routeIdentity)
      document
        .querySelector<HTMLElement>("#main-content h1")
        ?.focus({ preventScroll: true });
    previousRoute.current = routeIdentity;
  }, [view, event, routeIdentity, route]);
  const navigate = (params: string, replace = false) => {
    const next = new URLSearchParams(params);
    const changesPage = pageIdentity(next) !== pageIdentity(new URLSearchParams(currentSearch.current));
    transitionPage(() => {
      const url = params ? "?" + params : location.pathname;
      if (!replace) history.replaceState({ ...history.state, scrollY: window.scrollY }, "");
      history[replace ? "replaceState" : "pushState"](replace ? history.state : {}, "", url);
      currentSearch.current = location.search;
      setRoute(next);
    }, () => {
      if (!replace) window.scrollTo({ top: 0, behavior: "instant" });
      if (changesPage && next.get("section") === "services")
        document.getElementById("services")?.scrollIntoView({ behavior: "instant" });
    }, changesPage);
  };
  const openEvent = (event: EventRecord) => {
    const next = new URLSearchParams(route);
    next.delete("focus");
    next.set(
      "from",
      view === "event" ? route.get("from") || "broadcasts" : view,
    );
    next.set("view", "event");
    next.set("event", event.id);
    navigate(next.toString());
  };
  useEditorialMotion(routeIdentity);
  const followLink = (to: string) => {
    close();
    navigate(to);
  };
  const close = () => {
    dialog.current?.close();
    setDrawer(null);
  };
  useEffect(() => {
    const pop = (e: PopStateEvent) => {
      if (location.search === currentSearch.current) return;
      const search = location.search;
      const next = new URLSearchParams(search);
      const changesPage = pageIdentity(next) !== pageIdentity(new URLSearchParams(currentSearch.current));
      transitionPage(() => {
        currentSearch.current = search;
        setRoute(next);
      }, () => window.scrollTo({ top: e.state?.scrollY || 0, behavior: "instant" }), changesPage);
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  useEffect(() => {
    if (drawer) {
      dialog.current?.showModal();
      panelClose.current?.focus();
    }
  }, [drawer]);
  useEffect(() => {
    if (route.get("section") === "services")
      document.getElementById("services")?.scrollIntoView();
  }, [route]);

  return (
    <>
      <svg
        width="0"
        height="0"
        style={{ position: "absolute", pointerEvents: "none" }}
        aria-hidden="true"
      >
        <defs>
          <filter id="eventcast-white" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 1.25 0 0 -0.25"
            />
          </filter>
          <filter id="eventcast-red" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="0 0 0 0 .651  0 0 0 0 .094  0 0 0 0 .157  0 1.25 0 0 -.25" />
          </filter>
        </defs>
      </svg>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className={`site-wrap site-${view}`}>
        <header className={`header ${view !== "home" || headerSolid ? "is-solid" : "on-photo"} ${view === "home" && logoOnPhoto ? "logo-on-photo" : ""}`}>
          <Link onNavigate={followLink} to="" className="brand" label="EventCast Maldives home">
            <img src={brand.logo} width="900" height="900" alt="EventCast Maldives" />
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            <Link onNavigate={followLink} to="view=work" className={view === "work" ? "current" : ""}>Our work</Link>
            <Link onNavigate={followLink} to="view=home&section=services">Services</Link>
            <Link onNavigate={followLink} to="view=about" className={view === "about" ? "current" : ""}>About</Link>
            <Link onNavigate={followLink} to="view=broadcasts" className={view === "broadcasts" || view === "event" ? "current" : ""}>Watch</Link>
          </nav>
          <div className="header-actions">
            <button className="header-contact" aria-haspopup="dialog" onClick={() => setDrawer("contact")}>Let’s talk <MotionArrow size={16} /></button>
            <button className="icon-button menu-toggle" aria-label="Open menu" aria-haspopup="dialog" onClick={() => setDrawer("menu")}><Menu size={24} /></button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          {view === "home" ? (
            <>
              <Hero
                onWork={() => navigate("view=work")}
                onBook={() => setDrawer("contact")}
              />
              <div className="home-editorial">
                <section className="home-introduction" id="introduction">
                  <h2 className="intro-copy"><span>For the moments</span>{" "}<span>that bring us together.</span>{" "}<span>For the stories</span>{" "}<span>that deserve to be seen.</span></h2>
                  <div className="intro-details" data-reveal="copy"><p>We’re EventCast Maldives. A production crew in Thinadhoo, sharing island sport, community occasions and local stories through live streaming, video production and event organising.</p><Link onNavigate={followLink} to="view=about" className="text-link">Meet EventCast <MotionArrow size={18} /></Link></div>
                </section>
                <WorkPreview onAll={() => navigate("view=work")} onOpen={(id) => navigate("view=work&project=" + encodeURIComponent(id))} />
                <Services onContact={() => setDrawer("contact")} />
                <section className="selected-section">
                  <div className="section-heading"><h2 data-reveal="heading">Worth watching.</h2><Link onNavigate={followLink} to="view=broadcasts" className="text-link">All broadcasts <MotionArrow size={18} /></Link></div>
                  <div className="selected-tray">{content.selected.slice(0,3).map(id => <MediaCard key={id} event={byId(id)!} onOpen={openEvent} />)}</div>
                </section>
                <section className="studio-statement">
                  <div className="studio-photo" data-reveal="image"><img src="/assets/social/ig-DQZoUPYDZEQ.jpg" alt="EventCast crew on location in GA. Nilandhoo" width="1080" height="648" loading="lazy" /></div>
                  <div className="studio-copy"><h2 data-reveal="heading">People behind<br />the picture.</h2><p data-reveal="copy">The crew. The cameras. The little things that make a moment worth sharing. Get to know EventCast and the work we do, from Thinadhoo to your screen.</p><Link onNavigate={followLink} to="view=about" className="text-link">Our story <MotionArrow size={18} /></Link></div>
                </section>
              </div>
            </>
          ) : view === "work" ? (
            <Portfolio route={route} onRoute={navigate} />
          ) : view === "about" ? (
            <About
              onBook={() => setDrawer("contact")}
              onBrowse={() => navigate("view=work")}
              images={[
                {
                  src: "/assets/social/ig-DQZoUPYDZEQ.jpg",
                  alt: "The EventCast crew in GA. Nilandhoo.",
                },
                {
                  src: "/assets/social/fb-1514560656858173-original.jpg",
                  alt: "Inside the control room at Hiyala 2025.",
                },
                {
                  src: "/assets/social/fb-1514560700191502-original.jpg",
                  alt: "Ready at the camera. Hiyala 2025.",
                },
              ]}
            />
          ) : view === "broadcasts" ? (
            <Archive
              route={route}
              onFilter={(params) => navigate(params, true)}
              onOpen={openEvent}
            />
          ) : view === "live" ? (
            <LiveView
              onBrowse={() => navigate("view=broadcasts")}
              onOpen={openEvent}
            />
          ) : view === "event" && event ? (
            <Detail
              key={event.id}
              event={event}
              backUrl={(() => {
                const p = new URLSearchParams(route);
                p.set(
                  "view",
                  ["home", "live", "broadcasts", "work"].includes(
                    p.get("from") || "",
                  )
                    ? p.get("from")!
                    : "broadcasts",
                );
                p.delete("from");
                p.delete("event");
                p.delete("focus");
                return p.toString();
              })()}
              onBack={navigate}
              onOpen={openEvent}
            />
          ) : (
            <MissingView onBrowse={() => navigate("view=broadcasts")} />
          )}
        </main>
        <footer className="footer" id="contact">
          <div className="footer-invitation"><div><h2 data-reveal="heading">Have a moment<br />in mind?</h2><p>Let’s bring it into focus.</p></div><button className="contact-orbit" onClick={() => setDrawer("contact")} aria-label="Plan an event with EventCast"><MotionArrow size={40} /></button></div>
          <div className="footer-contact"><a href={"mailto:"+brand.email}>{brand.email}</a><a href={"tel:"+brand.phone.replaceAll(" ","")}>{brand.phone}</a></div>
          <div className="footer-meta"><div className="footer-brand"><img src={brand.logo} alt="EventCast Maldives" width="900" height="900" /><p>Thinadhoo, Maldives.<br />Made of island moments.</p></div><div className="footer-links"><a href={brand.instagram} target="_blank" rel="noreferrer">Instagram <MotionArrow size={14}/></a><a href={brand.facebook} target="_blank" rel="noreferrer">Facebook <MotionArrow size={14}/></a><a href={brand.youtube} target="_blank" rel="noreferrer">YouTube <MotionArrow size={14}/></a><Link onNavigate={followLink} to="view=live">Live broadcasts <MotionArrow size={14}/></Link><Link onNavigate={followLink} to="view=broadcasts&scope=sports">Island sport <MotionArrow size={14}/></Link></div></div>
          <div className="footer-bottom"><span>© {new Date().getFullYear()} EventCast Maldives</span><button className="text-link" onClick={() => window.scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"})}>Back to top <MotionArrow size={14}/></button></div>
        </footer>
      </div>
      <dialog
        ref={dialog}
        className={`side-panel ${drawer === "menu" ? "left-panel" : "right-panel"}`}
        onClose={() => setDrawer(null)}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
        aria-label={
          drawer === "menu" ? "Main menu" : "Contact and book an event"
        }
      >
        <div className="panel-body">
          <div className="panel-top">
            <span>
              {drawer === "menu" ? "Explore EventCast" : "Contact EventCast"}
            </span>
            <button
              ref={panelClose}
              className="icon-button"
              onClick={close}
              aria-label="Close panel"
            >
              <X size={24} />
            </button>
          </div>
          {drawer === "menu" ? (
            <>
              <nav className="drawer-nav" aria-label="Main menu">
                <Link onNavigate={followLink} to="">
                  Home <MotionArrow />
                </Link>
                <Link onNavigate={followLink} to="view=work">
                  Our work <MotionArrow />
                </Link>
                <Link onNavigate={followLink} to="view=broadcasts">Watch broadcasts <MotionArrow /></Link>
                <Link onNavigate={followLink} to="view=live">Live broadcasts <MotionArrow /></Link>
                <Link onNavigate={followLink} to="view=home&section=services">
                  Services <MotionArrow />
                </Link>
                <Link onNavigate={followLink} to="view=about">
                  About us <MotionArrow />
                </Link>
                <button onClick={() => setDrawer("contact")}>
                  Contact <MotionArrow />
                </button>
              </nav>
              <div className="menu-bottom">
                <p>Made of island moments.</p>
                <span>{brand.location}</span>
                <a href={brand.youtube} target="_blank" rel="noreferrer">
                  Visit our YouTube channel <MotionArrow size={18} />
                </a>
              </div>
            </>
          ) : null}
          <div hidden={drawer !== "contact" && drawer !== null}>
            <Booking email={brand.email} phone={brand.phone} />
          </div>
        </div>
      </dialog>
    </>
  );
}
function Services({ onContact }: { onContact: () => void }) {
  const services = [
    { title: "Live streaming", copy: "Bring your event to the people who can’t be there. Share the match, the ceremony and everything in between.", Icon: Radio },
    { title: "Video production", copy: "From a moment on the island to a story on screen. Tell us what you have in mind, and who you want to reach.", Icon: Video },
    { title: "Event organising", copy: "Something worth bringing people together for. Let’s talk about the occasion, the place and what you need.", Icon: CalendarDays },
  ];
  return <section className="services-section" id="services"><div className="services-heading"><h2 data-reveal="heading">From the first idea.<br />To the final frame.</h2><p>Three ways to bring your occasion to life.</p></div><div className="services-list">{services.map(({title,copy,Icon}) => <button key={title} className="service-row" data-reveal="row" onClick={onContact}><Icon size={26}/><h3>{title}</h3><p>{copy}</p><span className="service-arrow"><MotionArrow size={24}/></span></button>)}</div></section>;
}
createRoot(document.getElementById("root")!).render(<App />);
