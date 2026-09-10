import type { BroadcastState, EventRecord } from "./content";
// A source title containing LIVE is never a status signal. Manual live verification expires closed.
export function getStatus(
  event: Pick<EventRecord, "status" | "liveVerifiedUntil" | "endedAt">,
  now = Date.now(),
): BroadcastState {
  if (event.status !== "live") return event.status;
  const until = Date.parse(event.liveVerifiedUntil || "");
  return !event.endedAt && Number.isFinite(until) && until > now
    ? "live"
    : "unavailable";
}
