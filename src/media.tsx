import { useState } from "react";
import { Radio, Play, ArrowUpRight } from "lucide-react";
import { getStatus, dateLabel, type EventRecord } from "./content";
export function EventTitle({
  event,
  className = "",
}: {
  event: EventRecord;
  className?: string;
}) {
  return (
    <span
      className={className}
      lang={event.language}
      dir={event.language === "dv" ? "rtl" : "ltr"}
    >
      {event.title}
    </span>
  );
}
export function EventImage({
  event,
  className = "",
  eager = false,
}: {
  event: EventRecord;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div className={`image-fallback ${className}`}>
      <Radio size={32} />
      <span>Preview unavailable</span>
    </div>
  ) : (
    <img
      className={className}
      src={event.image}
      alt=""
      width="1280"
      height="720"
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      onError={() => setFailed(true)}
    />
  );
}
export function Status({ event }: { event: EventRecord }) {
  const state = getStatus(event);
  return (
    <span className={`status status-${state}`}>
      {state === "live" ? <Radio size={12} /> : <Play size={10} />}{" "}
      {state === "unavailable"
        ? "Unavailable"
        : state[0].toUpperCase() + state.slice(1)}
    </span>
  );
}
export function MediaCard({
  event,
  onOpen,
}: {
  event: EventRecord;
  onOpen: (event: EventRecord) => void;
}) {
  return (
    <a
      className="media-card"
      href={`?view=event&event=${event.id}`}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onOpen(event);
      }}
      aria-label={`Watch ${event.title} — ${getStatus(event)}`}
    >
      <div className="media-art" data-reveal="image">
        <EventImage event={event} className="media-original" />
      </div>
      <span className="mini-play">
        <Play size={13} fill="currentColor" />
      </span>
      <div className="media-caption" data-reveal="copy">
        <span>{event.category}</span>
        <h3>
          <EventTitle event={event} />
        </h3>
      </div>
    </a>
  );
}
export function PortraitCard({
  event,
  onOpen,
}: {
  event: EventRecord;
  onOpen: (event: EventRecord) => void;
}) {
  return (
    <a
      className={`portrait-card portrait-${event.category.split(" ")[0].toLowerCase()}`}
      href={`?view=event&event=${event.id}`}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onOpen(event);
      }}
      aria-label={`Watch ${event.title}`}
    >
      <EventImage event={event} className="portrait-backdrop" />
      <EventImage event={event} className="portrait-original" />
      <div className="portrait-fade" />
      <div className="portrait-top">
        <span>{event.category}</span>
        <ArrowUpRight size={20} />
      </div>
      <div className="portrait-copy">
        <Status event={event} />
        <h3>
          <EventTitle event={event} />
        </h3>
        <span>{dateLabel(event.broadcastDate)}</span>
      </div>
    </a>
  );
}
