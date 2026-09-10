import { content, events } from "./content";

export type ProjectStory = {
  id: string;
  title: string;
  category: string;
  year: string;
  location?: string;
  coverWorkId?: string;
  coverReplayId?: string;
  summary: string;
  introduction: string;
  contextTitle: string;
  context: string[];
  role: string;
  galleryIds: string[];
  replayId?: string;
  sources: { label: string; url: string }[];
};

// Editorial groupings only. Asset metadata and original captions remain in content.json.
// Hiyala images share the verified parent post 1514575443523361; no other
// handball campaign, tournament, client or production credit is inferred.
export const projects: ProjectStory[] = [
  {
    id: "hiyala-handball-2025",
    title: "Behind the replay.",
    category: "Hiyala Handball Tournament 7",
    year: "2025",
    location: "Thinadhoo, Maldives",
    coverWorkId: "fb-1514560656858173",
    summary: "A look inside EventCast’s video replay work for the Thinadhoo City WDC Hiyala Handball Tournament 7.",
    introduction: "On the court, the game moves quickly. Behind it, a crew follows every moment. EventCast’s photographs from Hiyala 2025 bring that work into view.",
    contextTitle: "The people behind the picture.",
    context: [
      "In its November 2025 post, EventCast Maldives reported completing video replay checks for the Thinadhoo City WDC Hiyala Handball Tournament 7. The accompanying photographs document camera positions, the production desk and the crew at work.",
      "This selection comes from that single EventCast post. It moves from the court to the control room, showing the people and working environment behind the replay.",
    ],
    role: "Video replay checks, documented in EventCast’s own tournament post.",
    galleryIds: ["fb-1514560636858175", "fb-1514560656858173", "fb-1514560700191502", "fb-1514559530191619", "fb-1514559483524957", "fb-1514559563524949"],
    sources: [{ label: "EventCast’s Hiyala production post", url: "https://www.facebook.com/eventcastmv/posts/1514575443523361" }],
  },
  {
    id: "raaveriyaa-volleyball-2025",
    title: "An island. A final.",
    category: "Raaveriyaa Volleyball Tournament",
    year: "2025",
    location: "GA. Nilandhoo, Maldives",
    coverWorkId: "ig-DQZoUPYDZEQ",
    summary: "From the crew’s arrival in Nilandhoo to the women’s division final, follow EventCast’s coverage of Raaveriyaa 2025.",
    introduction: "The occasion starts before the first point. EventCast’s crew post from GA. Nilandhoo and the recorded women’s final tell two sides of the same tournament.",
    contextTitle: "From the island to the audience.",
    context: [
      "EventCast’s October 2025 crew post announced coverage of the Raaveriya Volleyball Tournament from GA. Nilandhoo. The photograph places the people behind the coverage in the island where it happened.",
      "The official EventCast YouTube collection also holds the women’s division final, broadcast on 10 November 2025. Watch the recording to return to the match.",
    ],
    role: "Tournament coverage announced by EventCast, with the women’s final recorded on its official YouTube channel.",
    galleryIds: [],
    replayId: "qGpNzUR68sw",
    sources: [
      { label: "The EventCast crew in Nilandhoo", url: "https://www.instagram.com/p/DQZoUPYDZEQ/" },
      { label: "Women’s division final on YouTube", url: "https://www.youtube.com/watch?v=qGpNzUR68sw" },
    ],
  },
  {
    id: "mirata-lebeehkun-varihamai",
    title: "A story remembered.",
    category: "Mirata Lebeehkun Varihamai",
    year: "2026",
    coverReplayId: "NjNBBs3KCIA",
    summary: "A short film remembering the displacement, hardship and resilience of Thinadhoo’s people.",
    introduction: "Some stories belong to a place and to everyone who carries its memory. Mirata Lebeehkun Varihamai remembers a chapter of Thinadhoo’s story through film.",
    contextTitle: "Thinadhoo, held in memory.",
    context: [
      "Mirata Lebeehkun Varihamai is a short film remembering the displacement, hardship and resilience of Thinadhoo’s people. It is available on EventCast Maldives’ official YouTube channel.",
      "The film is presented by EventCast Maldives, Chappala Studio, Bunnaru Studio and Studio 33. The shared presentation credit is retained here as part of the work’s story.",
    ],
    role: "Presented by EventCast Maldives with Chappala Studio, Bunnaru Studio and Studio 33.",
    galleryIds: [],
    replayId: "NjNBBs3KCIA",
    sources: [{ label: "Watch the official film and credits", url: "https://www.youtube.com/watch?v=NjNBBs3KCIA" }],
  },
];

export const projectById = (id: string) => projects.find((project) => project.id === id);
export function projectCover(project: ProjectStory) {
  const work = content.work.find((item) => item.id === project.coverWorkId);
  if (work) return { src: work.image, alt: work.alt, width: work.width, height: work.height, contain: false };
  const replay = events.find((item) => item.id === project.coverReplayId);
  if (replay) return { src: replay.image, alt: replay.title, width: 1280, height: 720, contain: true };
  return undefined;
}
