import { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Image as ImageIcon, Play } from "lucide-react";
import { content, events, dateLabel } from "./content";
import { projects, projectCover, type ProjectStory } from "./projects";
import "./Projects.css";

type ProjectMedia = { src: string; alt: string; width: number; height: number; contain?: boolean };

export function ProjectPhoto({ media, alternate, eager = false, className = "" }: { media?: ProjectMedia; alternate?: ProjectMedia; eager?: boolean; className?: string }) {
  const [failed, setFailed] = useState(false);
  const [alternateReady, setAlternateReady] = useState(false);
  const [alternateFailed, setAlternateFailed] = useState(false);
  return <span data-reveal="image" className={`project-photo ${media?.contain ? "project-photo--contain" : ""} ${className}`}>
    {media && !failed ? <img src={media.src} alt={media.alt} width={media.width} height={media.height} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} onError={() => setFailed(true)} /> : <span className="project-photo-fallback"><ImageIcon size={26} aria-hidden="true" /><span>Photograph unavailable</span></span>}
    {media && !failed && alternate && !alternateFailed && <img
      className={`project-photo-secondary ${alternateReady ? "is-ready" : ""}`}
      src={alternate.src}
      alt=""
      aria-hidden="true"
      width={alternate.width}
      height={alternate.height}
      loading="lazy"
      decoding="async"
      onLoad={() => setAlternateReady(true)}
      onError={() => setAlternateFailed(true)}
    />}
  </span>;
}

export function ProjectCards({ onOpen }: { onOpen: (id: string) => void }) {
  return <div className="project-grid">{projects.map((project, index) => {
    const alternate = project.galleryIds
      .filter(id => id !== project.coverWorkId)
      .map(id => content.work.find(item => item.id === id))
      .find(item => item && item.width >= 1000);
    return <a key={project.id} className={`project-card ${index === 0 ? "project-card--lead" : ""}`} href={`?view=work&project=${project.id}`} onClick={(event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); onOpen(project.id);
  }}>
    <ProjectPhoto media={projectCover(project)} alternate={alternate ? { src: alternate.image, alt: alternate.alt, width: alternate.width, height: alternate.height } : undefined} />
    <div className="project-card-copy" data-reveal="copy"><div><span className="project-card-category">{project.category} <span>· {project.year}</span></span><h3>{project.title}</h3></div><ArrowUpRight className="project-card-arrow" size={27} aria-hidden="true" /></div>
    <p data-reveal="copy">{project.summary}</p>
  </a>;
  })}</div>;
}

export default function ProjectDetail({ project, onBack, onProject, onImage, onReplay }: {
  project: ProjectStory;
  onBack: () => void;
  onProject: (id: string) => void;
  onImage: (id: string, trigger: HTMLButtonElement) => void;
  onReplay: (id: string) => void;
}) {
  const gallery = project.galleryIds.flatMap((id) => { const item = content.work.find((work) => work.id === id); return item ? [item] : []; });
  const replay = events.find((event) => event.id === project.replayId);
  const next = projects[(projects.findIndex((item) => item.id === project.id) + 1) % projects.length];
  return <article className="project-detail">
    <button className="text-link project-back" onClick={onBack}><ArrowLeft size={17} aria-hidden="true" /> All our work</button>
    <header className="project-detail-heading"><h1 tabIndex={-1}>{project.title}</h1><div><p>{project.summary}</p><span className="project-detail-category">{project.category} · {project.year}</span></div></header>
    <ProjectPhoto key={project.id} media={projectCover(project)} eager className="project-detail-cover" />
    <div className="project-context"><div className="project-context-main"><p className="project-introduction" data-reveal="copy">{project.introduction}</p><h2 data-reveal="heading">{project.contextTitle}</h2>{project.context.map((paragraph) => <p key={paragraph} data-reveal="copy">{paragraph}</p>)}</div><aside className="project-facts" aria-label="Project information"><dl><div><dt>The occasion</dt><dd>{project.category}</dd></div>{project.location && <div><dt>Place</dt><dd>{project.location}</dd></div>}<div><dt>EventCast’s role</dt><dd>{project.role}</dd></div></dl><div className="project-sources">{project.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}<ArrowUpRight size={16} aria-hidden="true" /></a>)}</div></aside></div>
    {gallery.length > 0 && <section className="project-gallery" aria-labelledby="project-gallery-heading"><div className="project-section-heading"><h2 id="project-gallery-heading" data-reveal="heading">Inside the production.</h2><p data-reveal="copy">Selected photographs from EventCast’s original Hiyala post.</p></div><div className="project-gallery-grid">{gallery.map((item) => <button key={item.id} className="project-gallery-card" data-work-id={item.id} onClick={(event) => onImage(item.id, event.currentTarget)} aria-label={`Open photograph: ${item.title}`}><ProjectPhoto media={{ src: item.image, alt: item.alt, width: item.width, height: item.height, contain: true }} /><span>{item.title}<ArrowUpRight size={17} aria-hidden="true" /></span></button>)}</div></section>}
    {replay && <section className="project-replay" aria-labelledby="project-replay-heading"><div><h2 id="project-replay-heading" data-reveal="heading">{project.id === "mirata-lebeehkun-varihamai" ? "Watch the film." : "Return to the final."}</h2><p data-reveal="copy">{replay.description}</p><span className="project-replay-date">Recorded {dateLabel(replay.broadcastDate)}</span><button className="button" onClick={() => onReplay(replay.id)}>Watch recording <Play size={16} aria-hidden="true" /></button><a className="text-link" href={replay.source} target="_blank" rel="noreferrer">Open on YouTube <ArrowUpRight size={15} aria-hidden="true" /></a></div><button className="project-replay-image" onClick={() => onReplay(replay.id)} aria-label={`Watch ${replay.title}`}><ProjectPhoto media={{ src: replay.image, alt: replay.title, width: 1280, height: 720, contain: true }} /><span className="project-replay-play"><Play size={26} fill="currentColor" aria-hidden="true" /></span></button></section>}
    <nav className="next-project" aria-label="Next project"><a href={`?view=work&project=${next.id}`} onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onProject(next.id); }}><span>Next project</span><span className="next-project-title">{next.title}<ArrowRight size={34} aria-hidden="true" /></span><span>{next.category}</span></a></nav>
  </article>;
}
