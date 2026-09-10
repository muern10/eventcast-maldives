import { test } from "node:test";
import assert from "node:assert/strict";
import { getStatus } from "../src/state.ts";
const now = Date.parse("2026-09-09T12:00:00Z");
test("replay, scheduled and unavailable remain distinct regardless of LIVE in a title", () => {
  for (const status of ["replay", "scheduled", "unavailable"] as const)
    assert.equal(getStatus({ status, endedAt: null }, now), status);
});
test("live requires an unexpired valid verification and no end timestamp", () => {
  const event = {
    status: "live" as const,
    endedAt: null,
    liveVerifiedUntil: "2026-09-09T12:10:00Z",
  };
  assert.equal(getStatus(event, now), "live");
  for (const liveVerifiedUntil of [
    undefined,
    "",
    "garbage",
    "2026-09-09T12:00:00Z",
    "2026-09-09T11:59:59Z",
  ])
    assert.equal(
      getStatus({ ...event, liveVerifiedUntil }, now),
      "unavailable",
    );
  assert.equal(
    getStatus({ ...event, endedAt: "2026-09-09T11:50:00Z" }, now),
    "unavailable",
  );
  assert.equal(getStatus(event, now + 600001), "unavailable");
});
