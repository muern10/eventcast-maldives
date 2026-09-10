import { useEffect, useRef, useState } from "react";
import {
  Search,
  X,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Play,
  Radio,
  CalendarDays,
  MapPin,
  Film,
  Clock3,
} from "lucide-react";
import {
  brand,
  content,
  events,
  categories,
  sports,
  getStatus,
  dateLabel,
  durationLabel,
  type EventRecord,
} from "./content";
import { EventTitle, EventImage, Status } from "./media";
import "./views.css";

type OnOpen = (event: EventRecord) => void;
export function Archive({
  route,
  onFilter,
  onOpen,
}: {
  route: URLSearchParams;
  onFilter: (params: string) => void;
  onOpen: OnOpen;
}) {
  const query = route.get("q") || "";
  const category = categories.includes(route.get("category") || "")
    ? route.get("category")!
    : "All broadcasts";
  const sportOnly = route.get("scope") === "sports";
  const input = useRef<HTMLInputElement>(null);
  const availableCategories = categories
    .slice(1)
    .filter((c) => !sportOnly || sports.includes(c));
  const filtered = events.filter(
    (event) =>
      (!sportOnly || sports.includes(event.category)) &&
      (category === "All broadcasts" || event.category === category) &&
      `${event.title} ${event.officialTitle} ${event.category} ${event.subtitle}`
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase()),
  );
  const set = (key: string, value: string) => {
    const params = new URLSearchParams(route);
    params.delete("focus");
    if (value && value !== "All broadcasts") params.set(key, value);
    else params.delete(key);
    onFilter(params.toString());
  };
  const reset = () => {
    const params = new URLSearchParams(route);
    params.delete("q");
    params.delete("category");
    params.delete("scope");
    params.delete("focus");
    onFilter(params.toString());
  };
  useEffect(() => {
    if (route.get("focus") === "search") input.current?.focus();
  }, [route]);
  return (
    <div className="archive-view">
      <div className="archive-heading">
        <h1 tabIndex={-1}>
          {sportOnly
            ? "Island sport"
            : query
              ? "Search results"
              : "The broadcast collection"}
        </h1>
        <span role="status" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "broadcast" : "broadcasts"}
        </span>
      </div>
      <div className="browse-controls">
        <div className="search-field">
          <Search size={21} />
          <label className="sr-only" htmlFor="broadcast-search">
            Search broadcasts
          </label>
          <input
            ref={input}
            id="broadcast-search"
            type="search"
            autoComplete="off"
            placeholder="Find a moment. Search broadcasts…"
            value={query}
            onChange={(e) => set("q", e.target.value)}
          />
          {query && (
            <button
              className="icon-button"
              onClick={() => {
                set("q", "");
                input.current?.focus();
              }}
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div
          className="category-controls"
          role="group"
          aria-label="Broadcast categories"
        >
          {availableCategories.map((c, i) => (
            <button
              key={c}
              className={`category-chip category-tone-${i % 3}`}
              aria-pressed={category === c}
              onClick={() =>
                set("category", category === c ? "All broadcasts" : c)
              }
            >
              {c}
            </button>
          ))}
        </div>
        <div className="filter-summary">
          <span>
            {sportOnly
              ? "Sports collection"
              : category === "All broadcasts"
                ? "Every kind of island moment"
                : category}
          </span>
          {(query || category !== "All broadcasts" || sportOnly) && (
            <button className="text-link" onClick={reset}>
              Reset filters <X size={14} />
            </button>
          )}
        </div>
      </div>
      {filtered.length ? (
        <div className="archive-grid">
          {filtered.map((event) => (
            <ArchiveCard key={event.id} event={event} onOpen={onOpen} />
          ))}
        </div>
      ) : (
        <div className="empty-panel">
          <Search size={36} />
          <h2>No broadcasts found</h2>
          <p>Try an event name, an island or another category.</p>
          <button className="button light" onClick={reset}>
            Reset search & filters <ArrowRight size={18} />
          </button>
        </div>
      )}
      <p className="collection-note">
        A selection from the official EventCast Maldives archive.{" "}
        <a href={brand.youtube} target="_blank" rel="noreferrer">
          Explore the channel <ArrowUpRight size={14} />
        </a>
      </p>
    </div>
  );
}
function ArchiveCard({
  event,
  onOpen,
}: {
  event: EventRecord;
  onOpen: OnOpen;
}) {
  return (
    <a
      href={`?view=event&event=${event.id}&from=broadcasts`}
      className="archive-card"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onOpen(event);
      }}
    >
      <div className="archive-image">
        <EventImage event={event} />
        <div className="archive-image-meta">
          <Status event={event} />
          <span className="duration">
            {durationLabel(event.durationSeconds)}
          </span>
        </div>
        <span className="archive-play">
          <Play size={23} fill="currentColor" />
        </span>
      </div>
      <div className="archive-card-copy">
        <div className="archive-card-meta">
          <span>{event.category}</span>
          <span>{dateLabel(event.broadcastDate)}</span>
        </div>
        <h2>
          <EventTitle event={event} />
        </h2>
        <p>{event.subtitle}</p>
        <span className="archive-watch">
          Watch broadcast <ArrowUpRight size={17} />
        </span>
      </div>
    </a>
  );
}
export function LiveView({
  onBrowse,
  onOpen,
}: {
  onBrowse: () => void;
  onOpen: OnOpen;
}) {
  const current = events.filter((e) => getStatus(e) === "live");
  const scheduled = events.filter((e) => getStatus(e) === "scheduled");
  return (
    <div className="live-view">
      <div className="live-heading">
        <h1 tabIndex={-1}>Live, from our islands.</h1>
        <p>Find EventCast’s current broadcasts here.</p>
      </div>
      {current.length ? (
        <div className="archive-grid">
          {current.map((e) => (
            <ArchiveCard key={e.id} event={e} onOpen={onOpen} />
          ))}
        </div>
      ) : (
        <div className="live-empty">
          <Radio size={40} aria-hidden="true" />
          <h2>
            No live broadcast to show.
          </h2>
          <p>
            There’s still plenty to watch. Catch a sporting final, revisit a
            community moment, or explore a story from Thinadhoo.
          </p>
          <div className="live-actions">
            <button className="button light" onClick={onBrowse}>
              Explore replays <Play size={15} />
            </button>
            <a
              className="button outline"
              href={brand.youtube + "/streams"}
              target="_blank"
              rel="noreferrer"
            >
              Check YouTube <ArrowUpRight size={16} />
            </a>
          </div>
          <p className="live-check-note">
            Collection checked {dateLabel(content.checkedAt)}. Updates are
            curated; this page doesn’t automatically track the channel.
          </p>
        </div>
      )}
      {scheduled.length > 0 && (
        <section className="scheduled-section">
          <h2>Coming up</h2>
          <div className="archive-grid">
            {scheduled.map((e) => (
              <ArchiveCard key={e.id} event={e} onOpen={onOpen} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
export function Detail({
  event,
  backUrl,
  onBack,
  onOpen,
}: {
  event: EventRecord;
  backUrl: string;
  onBack: (params: string) => void;
  onOpen: OnOpen;
}) {
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef<HTMLElement>(null);
  const status = getStatus(event);
  const related = events
    .filter((e) => e.id !== event.id)
    .sort(
      (a, b) =>
        Number(b.category === event.category) -
        Number(a.category === event.category),
    )
    .slice(0, 3);
  const watch = () => {
    setPlaying(true);
    requestAnimationFrame(() => {
      playerRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "center",
      });
      playerRef.current?.focus({ preventScroll: true });
    });
  };
  return (
    <div className="detail-view">
      <a
        className="detail-back text-link"
        href={"?" + backUrl}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          onBack(backUrl);
        }}
      >
        <ArrowLeft size={17} />
        {backUrl.includes("view=home")
          ? "Back to home"
          : backUrl.includes("view=live")
            ? "Back to live"
            : new URLSearchParams(backUrl).get("view") === "work"
              ? new URLSearchParams(backUrl).has("project")
                ? "Back to project"
                : "Back to our work"
            : "Back to broadcasts"}
      </a>
      <section className="detail-feature">
        <div className="detail-title"><Status event={event}/><h1 tabIndex={-1}><EventTitle event={event}/></h1><p>{event.subtitle}</p></div>
        <div className="detail-image"><EventImage event={event} eager /></div>
        <div className="detail-meta">
          <div><Film size={18}/><span>{event.category}<small>{status === "replay" ? "Recorded broadcast" : status === "live" ? "Verified live" : status === "scheduled" ? "Scheduled broadcast" : "Check official channel"}</small></span></div>
          <div><CalendarDays size={18}/><span>{dateLabel(event.broadcastDate)}<small>Broadcast date</small></span></div>
          <div>{event.location ? <><MapPin size={18}/><span>{event.location}</span></> : <><Clock3 size={18}/><span>{durationLabel(event.durationSeconds)}<small>Recording length</small></span></>}</div>
          <button className="button" aria-label={status === "scheduled" ? "Open scheduled broadcast on YouTube" : "Watch " + event.title} disabled={status === "unavailable"} onClick={status === "scheduled" ? () => window.open(event.source, "_blank", "noopener,noreferrer") : watch}><Play size={16}/>{status === "scheduled" ? "Open on YouTube" : status === "unavailable" ? "Unavailable" : "Watch now"}</button>
        </div>
      </section>
      <section
        className="playback-section"
        ref={playerRef}
        tabIndex={-1}
        aria-label="Broadcast player"
      >
        <div className="playback-heading">
          <h2>{playing ? "Your broadcast" : "Watch this broadcast"}</h2>
          <a
            className="text-link"
            href={event.source}
            target="_blank"
            rel="noreferrer"
          >
            Open on YouTube <ArrowUpRight size={17} />
          </a>
        </div>
        {playing && event.embeddable && status !== "unavailable" ? (
          <div className="player-frame">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${event.id}?autoplay=0&rel=0&playsinline=1`}
              title={event.officialTitle}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ) : (
          <button
            className="player-cover"
            onClick={watch}
            disabled={status === "unavailable" || !event.embeddable}
            aria-label={"Load player for " + event.title}
          >
            <EventImage event={event} />
            <span>
              <Play size={27} fill="currentColor" />
              {status === "unavailable"
                ? "This recording is unavailable"
                : !event.embeddable
                  ? "Watch on the official channel"
                  : "Load YouTube player"}
            </span>
          </button>
        )}
        <p className="player-help">
          {playing
            ? "Player not loading? Use the YouTube link above. Playback may be restricted by your browser or the platform."
            : "The YouTube player loads when you choose to watch. It won’t start playing automatically."}{" "}
          <a href={brand.facebook} target="_blank" rel="noreferrer">
            EventCast on Facebook <ArrowUpRight size={12} />
          </a>
        </p>
      </section>
      <section className="event-notes">
        <div>
          <h2>About the broadcast</h2>
          <p>{event.description}</p>
        </div>
        <div className="official-title">
          <span>Official title</span>
          <p
            lang={event.language}
            dir={event.language === "dv" ? "rtl" : "ltr"}
          >
            {event.officialTitle}
          </p>
          <a href={event.source} target="_blank" rel="noreferrer">
            EventCast Maldives · YouTube <ArrowUpRight size={14} />
          </a>
        </div>
      </section>
      <section className="related-section">
        <div className="section-heading">
          <h2>More island moments</h2>
        </div>
        <div className="archive-grid">
          {related.map((e) => (
            <ArchiveCard key={e.id} event={e} onOpen={onOpen} />
          ))}
        </div>
      </section>
    </div>
  );
}
export function MissingView({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="empty-panel">
      <Film size={36} />
      <h1 tabIndex={-1}>Broadcast not found</h1>
      <p>This link doesn’t match a broadcast in our collection.</p>
      <button className="button light" onClick={onBrowse}>
        Browse broadcasts <ArrowRight size={18} />
      </button>
    </div>
  );
}
