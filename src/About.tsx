import { useState } from "react";
import { ArrowRight, Film, MapPin } from "lucide-react";
import { brand, events } from "./content";
import "./About.css";
import MotionArrow from "./MotionArrow";

export type AboutImage = { src: string; alt: string };

type AboutProps = {
  onBook: () => void;
  onBrowse: () => void;
  images?: AboutImage[];
};

const services = [
  {
    title: "Live streaming",
    description:
      "Bring an audience closer to the occasion. EventCast’s recorded broadcasts include island sport, community ceremonies and faith programmes.",
    prompt: "Tell us the occasion, the location and who you want to reach.",
    action: "Discuss a broadcast",
  },
  {
    title: "Video production",
    description:
      "Give a moment a life beyond the day. Our work spans event coverage and stories on film, including Mirata, a short film about Thinadhoo’s displacement and resilience.",
    prompt: "Share your idea, your audience and how you want to tell the story.",
    action: "Discuss a production",
  },
  {
    title: "Event organising",
    description:
      "Have an occasion in mind? Start a conversation about the event you’re planning and the support you need to bring people together.",
    prompt: "A first idea is enough to begin. Let us know what you have in mind.",
    action: "Discuss an event",
  },
];

const enquirySteps = [
  {
    title: "Share the occasion.",
    description:
      "Tell us a little about the event, the island or venue, and what you’re planning.",
  },
  {
    title: "Add the details you know.",
    description:
      "Choose a service and a date. Still working out the timing? Select “Date to be decided.”",
  },
  {
    title: "Review, then get in touch.",
    description:
      "Check your enquiry and open it in your email app. You choose when to send it, or copy the summary to share yourself.",
  },
];

function PortfolioPhoto({
  photo,
  eager = false,
  className = "",
}: {
  photo: AboutImage;
  eager?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className={`about-photo ${className}`}>
      <div className="about-photo__frame" data-reveal="image">
        {failed ? (
          <div className="about-photo__fallback" role="group" aria-label={photo.alt}>
            <Film size={28} strokeWidth={1.5} aria-hidden="true" />
            <span>This photograph is unavailable.</span>
            <a href={brand.facebook} target="_blank" rel="noreferrer">
              View EventCast on Facebook <MotionArrow size={16} />
            </a>
          </div>
        ) : (
          <img
            src={photo.src}
            alt={photo.alt}
            width="1280"
            height="720"
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={eager ? "high" : "auto"}
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <figcaption>{photo.alt}</figcaption>
    </figure>
  );
}

export default function About({ onBook, onBrowse, images }: AboutProps) {
  const fallbackOrder = ["Culture", "Volleyball", "Community", "Futsal"];
  const fallbackPhotos = fallbackOrder.flatMap((category) => {
    const event = events.find((item) => item.category === category);
    return event
      ? [{ src: event.image, alt: event.language === "dv" ? event.subtitle : event.title }]
      : [];
  });
  const suppliedPhotos = images?.filter((photo) => photo.src.trim()) ?? [];
  const photos = [...suppliedPhotos, ...fallbackPhotos].filter(
    (photo, index, all) => all.findIndex((item) => item.src === photo.src) === index,
  );

  return (
    <div className="about-page">
      <header className="about-introduction">
        <h1 tabIndex={-1}>
          <span className="sr-only">About EventCast Maldives. </span>
          People behind<br />the picture.
        </h1>
        <div className="about-introduction__copy">
          <p className="about-introduction__lead">
            Island sport. Shared occasions.<br />Stories worth keeping.
          </p>
          <p>
            EventCast Maldives is based in Thinadhoo, working in live streaming,
            video production and event organising. Our work follows the moments
            that bring island communities together.
          </p>
          <div className="about-place">
            <MapPin size={17} strokeWidth={1.6} aria-hidden="true" />
            <span>Thinadhoo, Maldives</span>
          </div>
        </div>
      </header>

      {photos[0] && (
        <div className="about-introduction__media">
          <PortfolioPhoto key={photos[0].src} photo={photos[0]} eager className="about-photo--hero" />
        </div>
      )}

      <section className="about-services" aria-labelledby="about-services-title">
        <div className="about-section-heading">
          <h2 data-reveal="heading" id="about-services-title">What we do.</h2>
          <p>From the first idea to the way it’s shared.<br />Here’s where the conversation can start.</p>
        </div>
        <div className="about-service-list">
          {services.map(({ title, description, prompt, action }) => (
            <article className="about-service" data-reveal="row" key={title}>
              <h3>{title}</h3>
              <div className="about-service__copy">
                <p>{description}</p>
                <p className="about-service__prompt">{prompt}</p>
                <button className="about-text-action" type="button" onClick={onBook}>
                  {action} <MotionArrow size={19} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-work" aria-labelledby="about-work-title">
        <div className="about-section-heading">
          <h2 data-reveal="heading" id="about-work-title">A closer look.</h2>
          <div>
            <p>On the court and behind the cameras. See the people and occasions in our work.</p>
            <button className="about-text-action" type="button" onClick={onBrowse}>
              Explore our work <MotionArrow size={19} />
            </button>
          </div>
        </div>
        <div className="about-work__images">
          {photos.slice(1, 3).map((photo, index) => (
            <PortfolioPhoto
              key={photo.src}
              photo={photo}
              className={index === 0 ? "about-photo--wide" : "about-photo--portrait"}
            />
          ))}
        </div>
        <div className="about-work__social">
          <p>Follow the work as it unfolds.</p>
          <div>
            <a href={brand.facebook} target="_blank" rel="noreferrer">Facebook <MotionArrow size={16} /></a>
            <a href={brand.instagram} target="_blank" rel="noreferrer">Instagram <MotionArrow size={16} /></a>
            <a href={brand.youtube} target="_blank" rel="noreferrer">YouTube <MotionArrow size={16} /></a>
          </div>
        </div>
      </section>

      <section className="about-process" aria-labelledby="about-process-title">
        <div className="about-section-heading">
          <h2 data-reveal="heading" id="about-process-title">It starts with<br />a conversation.</h2>
          <p>You don’t need to have everything worked out. Use our enquiry form to put the first details together.</p>
        </div>
        <ol className="about-process__steps" role="list">
          {enquirySteps.map(({ title, description }) => (
            <li key={title} data-reveal="copy">
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="about-conversation" aria-labelledby="about-conversation-title">
        <div className="about-conversation__copy">
          <h2 data-reveal="heading" id="about-conversation-title">Your next<br />occasion.</h2>
          <button className="about-action" type="button" onClick={onBook}>
            Plan an event <ArrowRight size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="about-conversation__contact">
          <p>Tell us what you have in mind.<br />We’d like to hear about it.</p>
          <a href={`mailto:${brand.email}`}>{brand.email}<MotionArrow size={20} /></a>
          <a href={`tel:${brand.phone.replace(/[^+\d]/g, "")}`}>{brand.phone}<MotionArrow size={20} /></a>
          <span>Based in Thinadhoo, Maldives.</span>
        </div>
      </section>
    </div>
  );
}
