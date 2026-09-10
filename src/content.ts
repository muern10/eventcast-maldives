import data from "./content.json";
export type BroadcastState = "live" | "scheduled" | "replay" | "unavailable";
export type EventRecord = {
  id: string;
  title: string;
  officialTitle: string;
  subtitle: string;
  description: string;
  category: string;
  status: BroadcastState;
  broadcastDate: string;
  publishedAt: string;
  endedAt: string | null;
  durationSeconds: number;
  location: string | null;
  language: string;
  image: string;
  imageSource: string;
  source: string;
  verifiedAt: string;
  embeddable: boolean;
  liveVerifiedUntil?: string;
};
export const content = data;
export const events = data.events as EventRecord[];
export const brand = data.brand;
export const categories = [
  "All broadcasts",
  "Football",
  "Futsal",
  "Volleyball",
  "Community",
  "Faith & community",
  "Culture",
];
export const sports = ["Football", "Futsal", "Volleyball"];
export const byId = (id: string) => events.find((event) => event.id === id);
export { getStatus } from "./state";
export const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Indian/Maldives",
  }).format(new Date(value.length === 10 ? value + "T12:00:00Z" : value));
export const durationLabel = (seconds: number) =>
  `${Math.floor(seconds / 3600) ? Math.floor(seconds / 3600) + ":" : ""}${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
