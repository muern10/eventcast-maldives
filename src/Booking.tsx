import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import "./Booking.css";
import { ArrowUpRight } from "lucide-react";

const eventTypes = [
  "Live streaming",
  "Video production",
  "Event organising",
  "Other",
] as const;

type BookingProps = {
  email: string;
  phone: string;
  initialType?: string;
};

type Enquiry = {
  name: string;
  contact: string;
  eventType: string;
  date: string;
  undecided: boolean;
  location: string;
  brief: string;
};

type PreparedEnquiry = { summary: string; mailto: string };

function serviceFrom(value?: string) {
  return (
    eventTypes.find((type) => type.toLowerCase() === value?.toLowerCase()) ?? ""
  );
}

function readableDate(value: string) {
  if (!value) return "To be decided";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export default function Booking({ email, phone, initialType }: BookingProps) {
  const id = useId();
  const [enquiry, setEnquiry] = useState<Enquiry>(() => ({
    name: "",
    contact: "",
    eventType: serviceFrom(initialType),
    date: "",
    undecided: false,
    location: "",
    brief: "",
  }));
  const [prepared, setPrepared] = useState<PreparedEnquiry | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const summaryRef = useRef<HTMLTextAreaElement>(null);
  const summaryTitleRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const focusAfterEdit = useRef(false);

  useEffect(() => {
    const eventType = serviceFrom(initialType);
    if (eventType) {
      setEnquiry((current) => ({ ...current, eventType }));
      setPrepared(null);
      setCopyStatus("");
    }
  }, [initialType]);

  useEffect(() => {
    if (prepared) summaryTitleRef.current?.focus();
    else if (focusAfterEdit.current) {
      nameRef.current?.focus();
      focusAfterEdit.current = false;
    }
  }, [prepared]);

  function update<K extends keyof Enquiry>(field: K, value: Enquiry[K]) {
    setEnquiry((current) => ({ ...current, [field]: value }));
    setPrepared(null);
    setCopyStatus("");
  }

  function prepareEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const cleaned: Enquiry = {
      ...enquiry,
      name: enquiry.name.trim(),
      contact: enquiry.contact.trim(),
      location: enquiry.location.trim(),
      brief: enquiry.brief.trim(),
    };

    for (const [field, message] of [
      ["name", "Please enter your name."],
      ["location", "Please enter the island or event location."],
      ["brief", "Please add a few details about your event."],
    ] as const) {
      const control = form.elements.namedItem(field) as
        | HTMLInputElement
        | HTMLTextAreaElement;
      control.setCustomValidity(cleaned[field] ? "" : message);
    }

    const contactControl = form.elements.namedItem(
      "contact",
    ) as HTMLInputElement;
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned.contact);
    const phoneDigits = cleaned.contact.replace(/\D/g, "");
    const phoneIsValid =
      /^\+?[\d\s().-]+$/.test(cleaned.contact) &&
      phoneDigits.length >= 7 &&
      phoneDigits.length <= 15;
    contactControl.setCustomValidity(
      emailIsValid || phoneIsValid
        ? ""
        : "Please enter a valid email address or phone number.",
    );
    setEnquiry(cleaned);
    if (!form.reportValidity()) return;

    const summary = [
      "Hello EventCast Maldives,",
      "",
      "I would like to enquire about an event.",
      "",
      `Name: ${cleaned.name}`,
      `Preferred contact: ${cleaned.contact}`,
      `Service: ${cleaned.eventType}`,
      `Event date: ${cleaned.undecided ? "To be decided" : readableDate(cleaned.date)}`,
      `Island / location: ${cleaned.location}`,
      "",
      "Event details:",
      cleaned.brief,
    ].join("\n");
    const subject = `EventCast enquiry — ${cleaned.eventType}`;
    setPrepared({
      summary,
      mailto: `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`,
    });
  }

  async function copySummary() {
    if (!prepared) return;
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(prepared.summary);
      setCopyStatus(
        "Summary copied. You can paste it into an email or message.",
      );
    } catch {
      summaryRef.current?.focus();
      summaryRef.current?.select();
      setCopyStatus(
        "Select and copy the summary below using your device’s copy command.",
      );
    }
  }

  return (
    <section className="booking" aria-label="Booking enquiry">
      <header className="booking__intro">
        <h2>
          Let’s make
          <br />
          it happen.
        </h2>
        <p>Tell us what you have in mind. We’ll help you take it from there.</p>
      </header>

      {prepared ? (
        <div className="booking__review">
          <h3 ref={summaryTitleRef} tabIndex={-1}>
            Draft ready — nothing has been sent.
          </h3>
          <p>
            Review your details below. “Open email draft” opens your email app
            with this enquiry addressed to EventCast. You choose when to send
            it.
          </p>
          <label className="booking__label" htmlFor={`${id}-summary`}>
            Your enquiry
          </label>
          <textarea
            className="booking__summary"
            id={`${id}-summary`}
            ref={summaryRef}
            value={prepared.summary}
            readOnly
            rows={13}
            spellCheck={false}
          />
          <a className="booking__primary" href={prepared.mailto}>
            Open email draft <ArrowUpRight size={19} aria-hidden="true" />
          </a>
          <div className="booking__review-actions">
            <button
              className="booking__secondary"
              type="button"
              onClick={copySummary}
            >
              Copy summary
            </button>
            <button
              className="booking__text-button"
              type="button"
              onClick={() => {
                focusAfterEdit.current = true;
                setPrepared(null);
                setCopyStatus("");
              }}
            >
              Edit details
            </button>
          </div>
          <p className="booking__copy-status" role="status">
            {copyStatus ||
              "No email app? Copy the summary and send it to the address below."}
          </p>
          <a className="booking__email" href={`mailto:${email}`}>
            {email}
          </a>
        </div>
      ) : (
        <form className="booking__form" onSubmit={prepareEmail}>
          <div className="booking__field">
            <label htmlFor={`${id}-name`}>Your name</label>
            <input
              id={`${id}-name`}
              ref={nameRef}
              name="name"
              autoComplete="name"
              required
              maxLength={100}
              placeholder="How should we address you?"
              value={enquiry.name}
              onChange={(event) => {
                event.currentTarget.setCustomValidity("");
                update("name", event.target.value);
              }}
            />
          </div>
          <div className="booking__field">
            <label htmlFor={`${id}-contact`}>Email or phone</label>
            <input
              id={`${id}-contact`}
              name="contact"
              type="text"
              required
              maxLength={180}
              autoCapitalize="none"
              spellCheck={false}
              aria-describedby={`${id}-contact-hint`}
              placeholder="Your preferred way to hear from us"
              value={enquiry.contact}
              onChange={(event) => {
                event.currentTarget.setCustomValidity("");
                update("contact", event.target.value);
              }}
            />
            <p className="booking__hint" id={`${id}-contact-hint`}>
              For a phone number, include your country code.
            </p>
          </div>
          <div className="booking__field">
            <label htmlFor={`${id}-type`}>What do you need?</label>
            <select
              id={`${id}-type`}
              name="eventType"
              required
              value={enquiry.eventType}
              onChange={(event) => update("eventType", event.target.value)}
            >
              <option value="" disabled>
                Choose a service
              </option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="booking__field">
            <label htmlFor={`${id}-date`}>Event date</label>
            <input
              id={`${id}-date`}
              name="date"
              type="date"
              required={!enquiry.undecided}
              disabled={enquiry.undecided}
              value={enquiry.date}
              onChange={(event) => update("date", event.target.value)}
            />
            <label className="booking__checkbox" htmlFor={`${id}-undecided`}>
              <input
                id={`${id}-undecided`}
                type="checkbox"
                checked={enquiry.undecided}
                onChange={(event) => update("undecided", event.target.checked)}
              />
              <span>Date to be decided</span>
            </label>
          </div>
          <div className="booking__field">
            <label htmlFor={`${id}-location`}>Island / location</label>
            <input
              id={`${id}-location`}
              name="location"
              required
              maxLength={160}
              placeholder="Island, venue or online"
              value={enquiry.location}
              onChange={(event) => {
                event.currentTarget.setCustomValidity("");
                update("location", event.target.value);
              }}
            />
          </div>
          <div className="booking__field">
            <label htmlFor={`${id}-brief`}>A little about your event</label>
            <textarea
              id={`${id}-brief`}
              name="brief"
              required
              maxLength={2000}
              rows={4}
              placeholder="The occasion, your audience and what you’re planning…"
              value={enquiry.brief}
              onChange={(event) => {
                event.currentTarget.setCustomValidity("");
                update("brief", event.target.value);
              }}
            />
          </div>
          <button className="booking__primary" type="submit">
            Prepare email <ArrowUpRight size={19} aria-hidden="true" />
          </button>
          <p className="booking__submit-note">
            You’ll review your enquiry before opening your email app. This form
            doesn’t send anything.
          </p>
        </form>
      )}

      <footer className="booking__contact">
        <span>Prefer a conversation?</span>
        <a href={`tel:${phone.replace(/[^+\d]/g, "")}`}>
          Call {phone} <ArrowUpRight size={19} aria-hidden="true" />
        </a>
      </footer>
    </section>
  );
}
