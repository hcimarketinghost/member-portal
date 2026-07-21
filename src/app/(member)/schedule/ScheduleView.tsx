"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  RectangleGroupIcon,
} from "@heroicons/react/24/outline";
import type { ScheduleEntry } from "@/lib/clubready";

const MAX_DAY_TABS = 14;

type DayTab = { label: string; date: string; iso: string };

/** Local-time ISO date — new Date("YYYY-MM-DD") would parse as UTC and can shift a day. */
function localIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Day tabs derived from the feed itself — the schedule window moves every day,
 * so the tabs can't be a hardcoded list. Days with no classes are skipped
 * (the feed has gaps on light days), which also means a tab is never empty.
 */
function buildDays(entries: ScheduleEntry[]): DayTab[] {
  const todayIso = localIso(new Date());
  const dates = [...new Set(
    entries.flatMap((e) => (e.kind === "class" && e.Date >= todayIso ? [e.Date] : []))
  )]
    .sort()
    .slice(0, MAX_DAY_TABS);

  return dates.map((iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    const label =
      iso === todayIso
        ? "Today"
        : new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short" });
    return { label, date: String(d), iso };
  });
}

function monthLabel(iso: string | undefined) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function capacityText(freeSpots: number, maxSpots: number) {
  const booked = Math.max(0, maxSpots - freeSpots);
  return `${booked}/${maxSpots}`;
}

function entriesForDay(entries: ScheduleEntry[], dateIso: string) {
  return entries.filter((entry) => entry.kind === "open" || entry.Date === dateIso);
}

export default function ScheduleView({ entries }: { entries: ScheduleEntry[] }) {
  const DAYS = useMemo(() => buildDays(entries), [entries]);
  const [selectedDay, setSelectedDay] = useState(() => DAYS[0]?.iso ?? "");
  const selectedDayIndex = DAYS.findIndex((day) => day.iso === selectedDay);
  const selectedEntries = useMemo(() => entriesForDay(entries, selectedDay), [entries, selectedDay]);
  const canGoPrevious = selectedDayIndex > 0;
  const canGoNext = selectedDayIndex >= 0 && selectedDayIndex < DAYS.length - 1;
  const MONTH_LABEL = monthLabel(DAYS[selectedDayIndex >= 0 ? selectedDayIndex : 0]?.iso);

  function shiftDay(direction: -1 | 1) {
    const nextDay = DAYS[selectedDayIndex + direction];
    if (nextDay) {
      setSelectedDay(nextDay.iso);
    }
  }

  return (
    <>
      <div className="hp-schedule-calendar" aria-label={`Schedule for ${MONTH_LABEL}`}>
        <div className="hp-schedule-month">{MONTH_LABEL}</div>
        <div className="hp-daytabs" role="tablist" aria-label="Schedule day">
          {DAYS.map((day) => {
            const active = day.iso === selectedDay;
            return (
              <button
                key={day.iso}
                type="button"
                className={`hp-daytab ${active ? "is-active" : ""}`}
                aria-pressed={active}
                onClick={() => setSelectedDay(day.iso)}
              >
                <span>{day.label}</span>
                <span className="hp-daytab-date">{day.date}</span>
              </button>
            );
          })}
        </div>
        <div className="hp-schedule-controls" aria-label="Schedule controls">
          <button type="button" className="hp-filter-btn" aria-label="Filter schedule">
            <FunnelIcon aria-hidden="true" />
            <span>Filter</span>
          </button>
          <div className="hp-schedule-nav" aria-label="Change day">
            <button
              type="button"
              className="hp-schedule-nav-btn"
              aria-label="Previous day"
              disabled={!canGoPrevious}
              onClick={() => shiftDay(-1)}
            >
              <ChevronLeftIcon aria-hidden="true" />
            </button>
            <button
              type="button"
              className="hp-schedule-nav-btn"
              aria-label="Next day"
              disabled={!canGoNext}
              onClick={() => shiftDay(1)}
            >
              <ChevronRightIcon aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="hp-list hp-schedule-list">
        {selectedEntries.map((entry) => {
          if (entry.kind === "open") {
            return (
              <Link key={entry.Id} href={entry.Href} className="hp-row-item is-open">
                <span className="hp-ri-thumb hp-ri-thumb-icon" aria-hidden="true">
                  <RectangleGroupIcon aria-hidden="true" />
                </span>
                <span className="hp-ri-titleblock">
                  <span className="hp-ri-titleline">
                    <span className="hp-ri-title">{entry.Title}</span>
                    <span className="hp-ri-capacity">Drop-in</span>
                  </span>
                </span>
                <span className="hp-ri-meta hp-ri-instructor" aria-hidden="true" />
                <span className="hp-ri-meta hp-ri-time hp-tabnum">
                  {entry.StartTime}&ndash;{entry.EndTime}
                </span>
                <span className="hp-ri-meta hp-ri-location">{entry.Location}</span>
                <span className="hp-ri-chevron">
                  <ChevronRightIcon aria-hidden="true" />
                </span>
              </Link>
            );
          }

          const full = entry.FreeSpots <= 0;
          const initials = `${entry.InstructorFirstName[0] ?? ""}${entry.InstructorLastName[0] ?? ""}`;
          const instructorShort = `${entry.InstructorFirstName} ${entry.InstructorLastName[0] ?? ""}.`;
          const capacity = capacityText(entry.FreeSpots, entry.MaxSpots);

          return (
            <Link key={entry.ScheduleId} href={`/classes/${entry.ScheduleId}`} className="hp-row-item">
              <span className="hp-ri-thumb">{initials}</span>
              <span className="hp-ri-titleblock">
                <span className="hp-ri-titleline">
                  <span className="hp-ri-title">{entry.Title}</span>
                  <span
                    className={`hp-ri-capacity ${full ? "is-full" : ""}`}
                    aria-label={`${capacity} spots booked`}
                  >
                    {full ? `${capacity} full` : capacity}
                  </span>
                </span>
              </span>
              <span className="hp-ri-meta hp-ri-instructor">{instructorShort}</span>
              <span className="hp-ri-meta hp-ri-time hp-tabnum">
                {entry.StartTime}&ndash;{entry.EndTime}
              </span>
              <span className="hp-ri-meta hp-ri-mobile-meta">
                <span className="hp-tabnum">{entry.StartTime}&ndash;{entry.EndTime}</span>
                {" \u00b7 "}
                <span>{instructorShort}</span>
              </span>
              <span className="hp-ri-meta hp-ri-location">{entry.Location}</span>
              <span className="hp-ri-chevron">
                <ChevronRightIcon aria-hidden="true" />
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
