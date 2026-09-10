import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Instagram,
  Facebook,
  Play,
  Search,
  X,
  Images,
} from "lucide-react";
import { content, brand, dateLabel } from "./content";
import ProjectDetail, { ProjectCards, ProjectPhoto } from "./ProjectStories";
import { projectById } from "./projects";
import "./Portfolio.css";
export type WorkItem = (typeof content.work)[number];
const platformName = (p: string) =>
  p === "instagram" ? "Instagram" : "Facebook";
export const workItems = content.work;
export function WorkPreview({
  onOpen,
  onAll,
}: {
  onOpen: (id: string) => void;
  onAll: () => void;
}) {
  return (
    <section className="work-preview">
      <div className="project-selection-heading">
        <h2 data-reveal="heading">Selected work.</h2>
        <button className="text-link" onClick={onAll}>
          Explore all our work <ArrowUpRight size={17} aria-hidden="true" />
        </button>
      </div>
      <ProjectCards onOpen={onOpen} />
    </section>
  );
}
export default function Portfolio({
  route,
  onRoute,
}: {
  route: URLSearchParams;
  onRoute: (query: string, replace?: boolean) => void;
}) {
  const types = ["All work", "Production", "Highlights", "Campaigns"];
  const platforms = ["All platforms", "Facebook", "Instagram"];
  const type = types.includes(route.get("type") || "") ? route.get("type")! : "All work",
    platform = platforms.includes(route.get("platform") || "") ? route.get("platform")! : "All platforms",
    query = route.get("q") || "";
  const projectId = route.get("project");
  const project = projectId ? projectById(projectId) : undefined;
  const [limit, setLimit] = useState(12),
    [embeddedItem, setEmbeddedItem] = useState<string | null>(null),
    [feed, setFeed] = useState<"facebook" | "instagram" | null>(null),
    [feedWidth, setFeedWidth] = useState(320),
    [feedLogoFailed, setFeedLogoFailed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    copyPane = useRef<HTMLDivElement>(null),
    feedWindow = useRef<HTMLDivElement>(null),
    page = useRef<HTMLDivElement>(null),
    heading = useRef<HTMLHeadingElement>(null),
    initiatingCard = useRef<HTMLButtonElement>(null),
    previousItem = useRef<string | null>(null),
    previousProject = useRef(projectId);
  const item = workItems.find((x) => x.id === route.get("item"));
  const embed = !!item && embeddedItem === item.id;
  const filtered = workItems.filter(
    (x) =>
      (type === "All work" || type === x.type) &&
      (platform === "All platforms" || platformName(x.platform) === platform) &&
      `${x.title} ${x.description} ${x.type}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const set = (key: string, value: string) => {
    const p = new URLSearchParams(route);
    p.delete("item");
    if (value && value !== "All work" && value !== "All platforms")
      p.set(key, value);
    else p.delete(key);
    setLimit(12);
    onRoute(p.toString(), true);
  };
  const open = (id: string) => {
    const p = new URLSearchParams(route);
    p.set("item", id);
    onRoute(p.toString(), true);
  };
  const openProject = (id: string) => {
    const p = new URLSearchParams(route);
    p.set("view", "work");
    p.set("project", id);
    p.delete("item");
    onRoute(p.toString());
  };
  const closeProject = () => {
    const p = new URLSearchParams(route);
    p.delete("project");
    p.delete("item");
    onRoute(p.toString());
  };
  const openReplay = (id: string) => {
    const p = new URLSearchParams(route);
    p.set("view", "event");
    p.set("event", id);
    p.set("from", "work");
    p.delete("item");
    onRoute(p.toString());
  };
  const reset = () => {
    const p = new URLSearchParams(route);
    ["q", "type", "platform", "item"].forEach((key) => p.delete(key));
    setLimit(12);
    onRoute(p.toString(), true);
  };
  const close = () => {
    if (!route.has("item")) return;
    const p = new URLSearchParams(route);
    p.delete("item");
    onRoute(p.toString(), true);
  };
  const advance = (delta: number) => {
    if (!item) return;
    const projectItems = project?.galleryIds.flatMap((id) => { const work = workItems.find((entry) => entry.id === id); return work ? [work] : []; });
    const list = projectItems?.length ? projectItems : filtered.length ? filtered : workItems;
    const i = list.findIndex((x) => x.id === item.id);
    open(list[i < 0 ? delta > 0 ? 0 : list.length - 1 : (i + delta + list.length) % list.length].id);
  };
  useEffect(() => {
    if (previousProject.current !== projectId && !route.has("item"))
      page.current?.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
    previousProject.current = projectId;
  }, [projectId, route]);
  useEffect(() => {
    const element = feedWindow.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const width = Math.min(500, Math.floor(entry.contentRect.width));
      if (width > 0) setFeedWidth(width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [projectId]);
  useEffect(() => {
    if (item) {
      setEmbeddedItem(null);
      if (!dialog.current?.open) dialog.current?.showModal();
      dialog.current?.scrollTo(0, 0);
      copyPane.current?.scrollTo(0, 0);
      previousItem.current = item.id;
      return;
    }

    const lastViewed = previousItem.current;
    dialog.current?.close();
    previousItem.current = null;
    if (!lastViewed) return;

    const frame = requestAnimationFrame(() => {
      if (!page.current?.isConnected || document.querySelector("dialog[open]"))
        return;
      const origin = initiatingCard.current;
      const viewedCard = Array.from(
        page.current.querySelectorAll<HTMLButtonElement>("button[data-work-id]"),
      ).find((card) => card.dataset.workId === lastViewed);
      const target =
        origin?.isConnected && page.current.contains(origin)
          ? origin
          : viewedCard || heading.current || page.current.querySelector<HTMLElement>("h1");
      target?.focus();
      initiatingCard.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [item]);
  return (
    <div className="portfolio-page" ref={page}>
      {projectId ? project ? <ProjectDetail
        key={project.id}
        project={project}
        onBack={closeProject}
        onProject={openProject}
        onImage={(id, trigger) => { initiatingCard.current = trigger; open(id); }}
        onReplay={openReplay}
      /> : <div className="portfolio-empty"><Images size={32} aria-hidden="true" /><h1 tabIndex={-1}>Project not found.</h1><p>This link doesn’t match a project in our collection.</p><button className="button" onClick={closeProject}>Explore our work <ArrowRight size={18} aria-hidden="true" /></button></div> : <>
      <header className="portfolio-intro">
        <h1 tabIndex={-1} ref={heading}>
          Our work.
        </h1>
        <div>
          <p>People, places and moments. Brought into focus.</p>
          <p>
            A selection of EventCast’s productions, broadcasts and the people behind them.
          </p>
          <div className="social-inline">
            <a href={brand.facebook} target="_blank" rel="noreferrer">
              <Facebook size={17} /> Facebook <ArrowUpRight size={14} />
            </a>
            <a href={brand.instagram} target="_blank" rel="noreferrer">
              <Instagram size={17} /> Instagram <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </header>
      <section className="portfolio-featured" aria-labelledby="selected-project-stories"><h2 id="selected-project-stories" className="sr-only">Selected project stories</h2><ProjectCards onOpen={openProject} /></section>
      <section className="portfolio-archive" aria-labelledby="photo-archive-title">
      <div className="portfolio-archive-heading"><div><h2 id="photo-archive-title">From the archive.</h2><p>Photographs and posts from our official social channels.</p></div><a className="text-link" href="?view=broadcasts" onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onRoute("view=broadcasts"); }}>Watch broadcasts <Play size={15} aria-hidden="true" /></a></div>
      <div className="portfolio-toolbar">
        <div className="work-types" role="group" aria-label="Work categories">
          {types.map((t) => (
            <button
              key={t}
              aria-pressed={type === t}
              onClick={() => set("type", t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="portfolio-search">
          <Search size={18} />
          <label className="sr-only" htmlFor="work-search">
            Search our work
          </label>
          <input
            type="search"
            id="work-search"
            placeholder="Search photos and posts"
            value={query}
            onChange={(e) => set("q", e.target.value)}
          />
        </div>
      </div>
      <div className="portfolio-result-line">
        <span role="status">
          {filtered.length}{" "}
          {filtered.length === 1 ? "photo or post" : "photos & posts"}
        </span>
        {(query || type !== "All work" || platform !== "All platforms") && <button className="text-link portfolio-reset" onClick={reset}>Reset filters <X size={14} aria-hidden="true" /></button>}
        <label>
          Source{" "}
          <select
            value={platform}
            onChange={(e) => set("platform", e.target.value)}
          >
            <option>All platforms</option>
            <option>Facebook</option>
            <option>Instagram</option>
          </select>
        </label>
      </div>
      {filtered.length ? (
        <div className="portfolio-grid">
          {filtered.slice(0, limit).map((x) => (
            <button
              key={x.id}
              className="portfolio-card"
              data-work-id={x.id}
              onClick={(event) => {
                initiatingCard.current = event.currentTarget;
                open(x.id);
              }}
              aria-label={`View ${x.title} on ${platformName(x.platform)}`}
            >
              <span className="portfolio-image">
                <ProjectPhoto media={{src: x.image, alt: x.alt, width: x.width, height: x.height, contain: true}} />
                <span className="work-kind">
                  {x.platform === "instagram" ? (
                    <Instagram size={16} />
                  ) : (
                    <Facebook size={16} />
                  )}
                </span>
                <span className="work-open">
                  {x.type === "Highlights" ? (
                    <Play size={20} fill="currentColor" />
                  ) : (
                    <ArrowUpRight size={23} />
                  )}
                </span>
              </span>
              <span className="portfolio-card-title">{x.title}</span>
              <span className="portfolio-card-meta">
                {x.type}
                <span>{x.date ? dateLabel(x.date) : "EventCast Maldives"}</span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="portfolio-empty">
          <Images size={34} />
          <h2>No matching moments.</h2>
          <p>Try a different search or explore the full collection.</p>
          <button
            className="button"
            onClick={reset}
          >
            Reset filters
          </button>
        </div>
      )}
      {filtered.length > limit && (
        <button className="more-work" onClick={() => setLimit((n) => n + 12)}>
          Show more work <span>{filtered.length - limit} more</span>
          <ArrowRight size={18} />
        </button>
      )}
      <p className="portfolio-collection-note">A curated collection of photographs and posts. Related images may belong to the same production.</p>
      </section>
      <section className="social-feed-section">
        <div>
          <h2>
            There’s more
            <br />
            in the feed.
          </h2>
          <p>
            Follow the coverage as it happens, and explore the full official
            channels.
          </p>
          <div className="social-feed-actions">
            <button
              onClick={() => setFeed("facebook")}
              aria-pressed={feed === "facebook"}
            >
              <Facebook size={17} /> Facebook feed
            </button>
            <button
              onClick={() => setFeed("instagram")}
              aria-pressed={feed === "instagram"}
            >
              <Instagram size={17} /> Instagram feed
            </button>
          </div>
        </div>
        <div className="social-feed-window" ref={feedWindow}>
          {feed ? (
            <>
              <iframe
                key={feed}
                title={`EventCast ${platformName(feed)} profile feed`}
                src={
                  feed === "instagram"
                    ? "https://www.instagram.com/eventcastmv/embed/"
                    : `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(brand.facebook)}&tabs=timeline&width=${feedWidth}&height=600&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`
                }
                loading="lazy"
                allow="encrypted-media"
              />
              <a
                href={feed === "instagram" ? brand.instagram : brand.facebook}
                target="_blank"
                rel="noreferrer"
              >
                Open the full {platformName(feed)} profile{" "}
                <ArrowUpRight size={15} />
              </a>
            </>
          ) : (
            <>
              <div className="feed-monogram">
                {feedLogoFailed ? (
                  <span className="feed-monogram-fallback">{brand.name}</span>
                ) : (
                  <img
                    src={brand.logo}
                    alt="EventCast Maldives"
                    width="900"
                    height="900"
                    onError={() => setFeedLogoFailed(true)}
                  />
                )}
              </div>
              <p>Choose a channel to load its official feed.</p>
              <span>
                Our collection is curated from public posts. The full channels
                hold the rest.
              </span>
            </>
          )}
        </div>
      </section>
      </>}
      <dialog
        ref={dialog}
        className="work-dialog"
        aria-label={item ? item.title : "EventCast work"}
        onClose={close}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
        onKeyDown={(e) => {
          if (e.ctrlKey || e.metaKey || e.altKey) return;
          if (e.key === "ArrowRight") {
            e.preventDefault();
            advance(1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            advance(-1);
          }
        }}
      >
        {item && (
          <>
            <button
              className="work-dialog-close"
              onClick={close}
              aria-label="Close work"
            >
              <X size={24} />
            </button>
            <div className="work-dialog-media">
              {embed ? (
                <iframe
                  title={`${platformName(item.platform)} post: ${item.title}`}
                  src={
                    item.platform === "instagram"
                      ? item.source.replace(/\/$/, "") + "/embed/"
                      : `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(item.source)}&show_text=true&width=750`
                  }
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <ProjectPhoto key={item.id} media={{src: item.image, alt: item.alt, width: item.width, height: item.height, contain: true}} eager />
              )}
              <div className="work-dialog-arrows">
                <button
                  onClick={() => advance(-1)}
                  aria-label="Previous photo or post"
                >
                  <ArrowLeft />
                </button>
                <button
                  onClick={() => advance(1)}
                  aria-label="Next photo or post"
                >
                  <ArrowRight />
                </button>
              </div>
            </div>
            <div className="work-dialog-copy" ref={copyPane}>
              <span className="sr-only" role="status">{item.title}</span>
              <span className="work-dialog-platform">
                {item.platform === "instagram" ? (
                  <Instagram size={19} />
                ) : (
                  <Facebook size={19} />
                )}{" "}
                {platformName(item.platform)}
                {item.date && <span>{dateLabel(item.date)}</span>}
              </span>
              <h2>{item.title}</h2>
              <span className="work-caption-label">Original post caption</span>
              <p>{item.description || item.alt}</p>
              <button
                className="button"
                onClick={() =>
                  setEmbeddedItem((current) =>
                    current === item.id ? null : item.id,
                  )
                }
              >
                {embed
                  ? "Back to photograph"
                  : item.type === "Highlights"
                    ? "Load reel"
                    : "Load original post"}{" "}
                {item.type === "Highlights" ? (
                  <Play size={15} />
                ) : (
                  <Images size={16} />
                )}
              </button>
              <a
                className="text-link"
                href={item.source}
                target="_blank"
                rel="noreferrer"
              >
                Open on {platformName(item.platform)} <ArrowUpRight size={16} />
              </a>
              <small>
                Posted by EventCast Maldives. If the embed is restricted, use
                the original post link.
              </small>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
