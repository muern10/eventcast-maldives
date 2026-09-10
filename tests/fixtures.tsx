// Local QA fixture. Vite production builds only index.html, never this page.
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { events } from "../src/content";
import { MediaCard, PortraitCard, EventTitle } from "../src/media";
import { Detail } from "../src/views";
import "../src/fonts.css";
import "../src/style.css";
const fail = { ...events[0], image: "/assets/intentionally-missing-qa.jpg" };
const longEnglish = { ...events[0], title: events[0].officialTitle };
const longThaana = {
  ...events[3],
  title: events[3].title + " · " + events[3].title,
};
const noop = () => {};
function Fixtures() {
  const [reduced, setReduced] = useState(false);
  const rules = Array.from(document.styleSheets)
    .flatMap((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .filter(
            (rule) =>
              rule instanceof CSSMediaRule &&
              rule.conditionText.includes("prefers-reduced-motion"),
          )
          .map((rule) =>
            Array.from((rule as CSSMediaRule).cssRules)
              .map((r) => r.cssText)
              .join("\n"),
          );
      } catch {
        return [];
      }
    })
    .join("\n");
  return (
    <div className="site-wrap">
      <label style={{ display: "block", padding: 24 }}>
        <input
          type="checkbox"
          checked={reduced}
          onChange={(e) => setReduced(e.target.checked)}
        />{" "}
        Activate the declared reduced-motion rules
      </label>
      {reduced && <style>{rules}</style>}
      <h1 style={{ padding: 24, fontSize: 24 }}>
        QA fixtures — unavailable image, long titles, blocked frame
      </h1>
      <div className="selected-tray">
        <MediaCard event={fail} onOpen={noop} />
        <MediaCard event={longEnglish} onOpen={noop} />
        <MediaCard event={longThaana} onOpen={noop} />
      </div>
      <div className="portrait-grid" style={{ marginTop: 30 }}>
        <PortraitCard event={longEnglish} onOpen={noop} />
        <PortraitCard event={longThaana} onOpen={noop} />
      </div>
      <p style={{ padding: 24 }}>
        Long exact titles remain fully available in detail text:{" "}
        <EventTitle event={longEnglish} />
      </p>
      <Detail
        event={events[0]}
        backUrl="view=broadcasts"
        onBack={noop}
        onOpen={noop}
      />
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<Fixtures />);
