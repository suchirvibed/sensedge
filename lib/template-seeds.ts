/**
 * Pre-built sample templates. Each one is a real Fabric.js v5 canvas JSON
 * payload that loadFromJSON() can rehydrate directly, with the custom
 * `label` property included on every field so the designer's field list
 * stays meaningful.
 *
 * Coordinates are tuned for the default 87 × 57 mm canvas at 5 px/mm
 * (435 × 285 px) and stay safely inside the 2 mm safe area.
 */

import type { TemplateCategory } from "./template-categories";

export interface SeedTemplate {
  name: string;
  category: TemplateCategory;
  canvasJson: object;
}

/** Convenience helper to build a Fabric Textbox-shaped JSON object. */
function tx(opts: {
  left: number;
  top: number;
  width: number;
  text: string;
  label: string;
  fontSize: number;
  fontWeight?: string | number;
  fontFamily?: string;
  fill?: string;
  textAlign?: "left" | "center" | "right";
}) {
  return {
    type: "textbox",
    version: "5.3.0",
    originX: "left",
    originY: "top",
    left: opts.left,
    top: opts.top,
    width: opts.width,
    height: opts.fontSize * 1.2,
    fill: opts.fill ?? "#0a0a0a",
    fontFamily: opts.fontFamily ?? "Inter",
    fontWeight: opts.fontWeight ?? "normal",
    fontSize: opts.fontSize,
    text: opts.text,
    textAlign: opts.textAlign ?? "left",
    label: opts.label,
  };
}

/** A dashed placeholder box for the photo field. */
function photo(opts: {
  left: number;
  top: number;
  width: number;
  height: number;
  label?: string;
}) {
  return {
    type: "rect",
    version: "5.3.0",
    originX: "left",
    originY: "top",
    left: opts.left,
    top: opts.top,
    width: opts.width,
    height: opts.height,
    fill: "rgba(0,0,0,0.06)",
    stroke: "rgba(0,0,0,0.25)",
    strokeWidth: 1,
    strokeDashArray: [4, 4],
    label: opts.label ?? "Photo",
  };
}

/** Solid coloured stripe (left or top bar). */
function stripe(opts: {
  left: number;
  top: number;
  width: number;
  height: number;
  fill: string;
  label?: string;
}) {
  return {
    type: "rect",
    version: "5.3.0",
    originX: "left",
    originY: "top",
    left: opts.left,
    top: opts.top,
    width: opts.width,
    height: opts.height,
    fill: opts.fill,
    label: opts.label ?? "Accent",
  };
}

function shell(objects: object[]) {
  return {
    version: "5.3.0",
    objects,
    background: "#ffffff",
  };
}

export const SEED_TEMPLATES: SeedTemplate[] = [
  // ───── BUSINESS — Modern Employee ID ─────
  {
    name: "Modern employee ID",
    category: "Business",
    canvasJson: shell([
      stripe({ left: 0, top: 0, width: 12, height: 285, fill: "#E85D04", label: "Accent bar" }),
      photo({ left: 28, top: 30, width: 90, height: 120 }),
      tx({
        left: 132, top: 30, width: 200, text: "EMPLOYEE",
        label: "Role", fontSize: 11, fontWeight: 600, fill: "#737373",
      }),
      tx({
        left: 132, top: 52, width: 260, text: "John Doe",
        label: "Name", fontSize: 26, fontWeight: 800, fill: "#0a0a0a",
      }),
      tx({
        left: 132, top: 95, width: 260, text: "Product Engineer",
        label: "Title", fontSize: 14, fill: "#4b4b4b",
      }),
      tx({
        left: 132, top: 120, width: 260, text: "PrintCard, Inc.",
        label: "Company", fontSize: 13, fontWeight: 600, fill: "#E85D04",
      }),
      tx({
        left: 28, top: 168, width: 200, text: "ID · PCO-000142",
        label: "ID", fontSize: 11, fill: "#737373", fontFamily: "monospace",
      }),
      tx({
        left: 28, top: 198, width: 380, text: "If found, return to printcard.co.in",
        label: "Footer", fontSize: 10, fill: "#a3a3a3",
      }),
    ]),
  },

  // ───── BUSINESS — Dark Executive ─────
  {
    name: "Executive dark",
    category: "Business",
    canvasJson: shell([
      stripe({ left: 0, top: 0, width: 435, height: 285, fill: "#0a0a0a", label: "Background" }),
      stripe({ left: 0, top: 240, width: 435, height: 4, fill: "#E85D04", label: "Accent bar" }),
      tx({
        left: 28, top: 36, width: 380, text: "EXECUTIVE",
        label: "Role", fontSize: 11, fontWeight: 600, fill: "#a3a3a3",
      }),
      tx({
        left: 28, top: 60, width: 380, text: "Aarav Sharma",
        label: "Name", fontSize: 32, fontWeight: 800, fill: "#ffffff",
      }),
      tx({
        left: 28, top: 110, width: 380, text: "Chief Design Officer",
        label: "Title", fontSize: 15, fill: "#cccccc",
      }),
      tx({
        left: 28, top: 180, width: 380, text: "PRINTCARD",
        label: "Brand", fontSize: 14, fontWeight: 700, fill: "#E85D04", textAlign: "left",
      }),
      tx({
        left: 28, top: 200, width: 380, text: "+91 98765 43210 · aarav@printcard.co.in",
        label: "Contact", fontSize: 11, fill: "#737373",
      }),
    ]),
  },

  // ───── EDUCATION — Student ID ─────
  {
    name: "Student ID (school)",
    category: "Education",
    canvasJson: shell([
      stripe({ left: 0, top: 0, width: 145, height: 285, fill: "#E85D04", label: "Sidebar" }),
      tx({
        left: 16, top: 20, width: 120, text: "BHS",
        label: "School code", fontSize: 12, fontWeight: 700, fill: "#ffffff",
      }),
      tx({
        left: 16, top: 42, width: 120, text: "BRIGHT HORIZONS SCHOOL",
        label: "School name", fontSize: 11, fontWeight: 700, fill: "#ffffff",
      }),
      tx({
        left: 16, top: 220, width: 120, text: "Year 2025 – 26",
        label: "Academic year", fontSize: 10, fill: "#ffffff",
      }),
      photo({ left: 165, top: 30, width: 90, height: 120, label: "Student photo" }),
      tx({
        left: 165, top: 162, width: 250, text: "Student",
        label: "Role", fontSize: 10, fontWeight: 600, fill: "#737373",
      }),
      tx({
        left: 165, top: 178, width: 250, text: "Ishani Gupta",
        label: "Student name", fontSize: 22, fontWeight: 800, fill: "#0a0a0a",
      }),
      tx({
        left: 165, top: 215, width: 250, text: "Class XII-B · Roll 22",
        label: "Class + roll", fontSize: 13, fill: "#4b4b4b",
      }),
      tx({
        left: 165, top: 240, width: 250, text: "DOB 18-Jul-2008",
        label: "DOB", fontSize: 11, fill: "#737373",
      }),
    ]),
  },

  // ───── EDUCATION — University ─────
  {
    name: "University ID",
    category: "Education",
    canvasJson: shell([
      tx({
        left: 20, top: 20, width: 395, text: "STATE UNIVERSITY",
        label: "Org", fontSize: 12, fontWeight: 700, fill: "#1f4fa8", textAlign: "center",
      }),
      stripe({ left: 20, top: 42, width: 395, height: 2, fill: "#1f4fa8", label: "Divider" }),
      photo({ left: 28, top: 60, width: 100, height: 130 }),
      tx({
        left: 148, top: 70, width: 250, text: "Aditya Verma",
        label: "Name", fontSize: 22, fontWeight: 800,
      }),
      tx({
        left: 148, top: 108, width: 250, text: "BS Computer Science · Year 3",
        label: "Programme", fontSize: 13, fill: "#4b4b4b",
      }),
      tx({
        left: 148, top: 132, width: 250, text: "Student #: 22-CS-1184",
        label: "Student id", fontSize: 12, fill: "#737373", fontFamily: "monospace",
      }),
      tx({
        left: 148, top: 156, width: 250, text: "Library access · Hostel A",
        label: "Privileges", fontSize: 11, fill: "#737373",
      }),
      tx({
        left: 28, top: 218, width: 395, text: "Valid until 31 May 2027",
        label: "Validity", fontSize: 11, fill: "#4b4b4b", textAlign: "center",
      }),
    ]),
  },

  // ───── HEALTHCARE — Staff ─────
  {
    name: "Healthcare staff badge",
    category: "Healthcare",
    canvasJson: shell([
      stripe({ left: 0, top: 0, width: 435, height: 50, fill: "#246a14", label: "Header bar" }),
      tx({
        left: 20, top: 16, width: 395, text: "LUMEN HEALTH",
        label: "Hospital", fontSize: 16, fontWeight: 800, fill: "#ffffff", textAlign: "center",
      }),
      photo({ left: 28, top: 70, width: 95, height: 120 }),
      tx({
        left: 138, top: 72, width: 270, text: "Dr. Priya Nair",
        label: "Name", fontSize: 22, fontWeight: 800,
      }),
      tx({
        left: 138, top: 108, width: 270, text: "Cardiology Consultant",
        label: "Department", fontSize: 13, fill: "#246a14", fontWeight: 600,
      }),
      tx({
        left: 138, top: 132, width: 270, text: "Reg #: KMC-2019-44120",
        label: "Registration", fontSize: 11, fill: "#737373", fontFamily: "monospace",
      }),
      stripe({ left: 28, top: 220, width: 380, height: 1, fill: "#cccccc", label: "Divider" }),
      tx({
        left: 28, top: 226, width: 200, text: "EMERGENCY: 112",
        label: "Emergency", fontSize: 10, fontWeight: 700, fill: "#c0003c",
      }),
    ]),
  },

  // ───── EVENT — Conference Pass ─────
  {
    name: "Event pass — conference",
    category: "Event",
    canvasJson: shell([
      stripe({ left: 0, top: 0, width: 435, height: 285, fill: "#1c1c1c", label: "Background" }),
      tx({
        left: 28, top: 28, width: 380, text: "TECH SUMMIT 2026",
        label: "Event", fontSize: 14, fontWeight: 700, fill: "#E85D04",
      }),
      tx({
        left: 28, top: 50, width: 380, text: "ALL ACCESS PASS",
        label: "Pass type", fontSize: 11, fontWeight: 600, fill: "#a3a3a3",
      }),
      tx({
        left: 28, top: 110, width: 380, text: "Rohan Mehta",
        label: "Attendee", fontSize: 26, fontWeight: 800, fill: "#ffffff",
      }),
      tx({
        left: 28, top: 152, width: 380, text: "Operations Manager · Devraj Industries",
        label: "Title", fontSize: 13, fill: "#cccccc",
      }),
      tx({
        left: 28, top: 220, width: 200, text: "12 – 14 Mar 2026",
        label: "Dates", fontSize: 11, fontWeight: 600, fill: "#E85D04",
      }),
      tx({
        left: 28, top: 240, width: 380, text: "Bangalore International Exhibition Centre",
        label: "Venue", fontSize: 10, fill: "#a3a3a3",
      }),
      tx({
        left: 300, top: 220, width: 110, text: "TS-441",
        label: "Pass code", fontSize: 12, fill: "#E85D04", fontFamily: "monospace", textAlign: "right",
      }),
    ]),
  },

  // ───── MEMBERSHIP — Loyalty Gold ─────
  {
    name: "Gold membership",
    category: "Membership",
    canvasJson: shell([
      stripe({ left: 0, top: 0, width: 435, height: 285, fill: "#1c1c1c", label: "Background" }),
      stripe({ left: 0, top: 0, width: 435, height: 6, fill: "#d4af37", label: "Gold bar" }),
      tx({
        left: 28, top: 28, width: 380, text: "MEMBER",
        label: "Tier label", fontSize: 11, fontWeight: 600, fill: "#a3a3a3",
      }),
      tx({
        left: 28, top: 46, width: 380, text: "Aisha Khan",
        label: "Member name", fontSize: 26, fontWeight: 800, fill: "#ffffff",
      }),
      tx({
        left: 28, top: 96, width: 380, text: "GOLD",
        label: "Tier", fontSize: 38, fontWeight: 800, fill: "#d4af37",
      }),
      tx({
        left: 28, top: 168, width: 380, text: "Member since 2023",
        label: "Since", fontSize: 12, fill: "#a3a3a3",
      }),
      tx({
        left: 28, top: 220, width: 380, text: "MEM · 009021",
        label: "Member id", fontSize: 12, fill: "#cccccc", fontFamily: "monospace",
      }),
      tx({
        left: 28, top: 240, width: 380, text: "PrintCard Loyalty Club",
        label: "Brand", fontSize: 10, fill: "#737373",
      }),
    ]),
  },

  // ───── GOVERNMENT — Visitor ─────
  {
    name: "Government visitor pass",
    category: "Government",
    canvasJson: shell([
      stripe({ left: 0, top: 0, width: 435, height: 36, fill: "#4c45a8", label: "Header" }),
      tx({
        left: 20, top: 10, width: 395, text: "GOVERNMENT OF INDIA",
        label: "Org", fontSize: 14, fontWeight: 700, fill: "#ffffff", textAlign: "center",
      }),
      tx({
        left: 28, top: 60, width: 200, text: "VISITOR",
        label: "Pass type", fontSize: 11, fontWeight: 600, fill: "#737373",
      }),
      tx({
        left: 28, top: 80, width: 280, text: "Name & Designation",
        label: "Name", fontSize: 18, fontWeight: 700, fill: "#0a0a0a",
      }),
      photo({ left: 320, top: 60, width: 90, height: 110, label: "Photo" }),
      tx({
        left: 28, top: 130, width: 280, text: "Purpose: Office meeting",
        label: "Purpose", fontSize: 12, fill: "#4b4b4b",
      }),
      tx({
        left: 28, top: 156, width: 280, text: "Host: Reception desk",
        label: "Host", fontSize: 12, fill: "#4b4b4b",
      }),
      tx({
        left: 28, top: 200, width: 280, text: "Issued: 12 Jun 2026 · Valid 1 day",
        label: "Validity", fontSize: 11, fill: "#737373",
      }),
      tx({
        left: 28, top: 240, width: 380, text: "VST-220031",
        label: "Pass code", fontSize: 13, fontWeight: 700, fill: "#4c45a8", fontFamily: "monospace",
      }),
    ]),
  },
];
