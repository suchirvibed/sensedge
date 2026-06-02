/**
 * Default field layouts for each card type. Coordinates are in canvas
 * pixels for horizontal orientation; the canvas hook will display them
 * faithfully (and warn via the print validator if anything ends up
 * outside the safe area).
 *
 * Numbers were picked for the default 87 × 57 mm card at 5 px/mm
 * (435 × 285 px). They look sensible at smaller sizes too.
 */

import type { CardType } from "./types";

export interface DefaultTextField {
  kind: "text";
  label: string;
  text: string;
  left: number;
  top: number;
  width: number;
  fontSize: number;
  fontWeight?: string | number;
  fill?: string;
  textAlign?: "left" | "center" | "right";
}

export interface DefaultPhotoField {
  kind: "photo";
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

export type DefaultField = DefaultTextField | DefaultPhotoField;

const COMPANY: DefaultField[] = [
  { kind: "photo", label: "Photo", left: 22, top: 28, width: 90, height: 120 },
  {
    kind: "text",
    label: "Role",
    text: "EMPLOYEE",
    left: 132,
    top: 30,
    width: 200,
    fontSize: 11,
    fontWeight: 600,
    fill: "#737373",
  },
  {
    kind: "text",
    label: "Name",
    text: "John Doe",
    left: 132,
    top: 50,
    width: 240,
    fontSize: 24,
    fontWeight: 800,
    fill: "#0a0a0a",
  },
  {
    kind: "text",
    label: "Title",
    text: "Software Engineer",
    left: 132,
    top: 90,
    width: 240,
    fontSize: 14,
    fill: "#4b4b4b",
  },
  {
    kind: "text",
    label: "Company",
    text: "PrintCard, Inc.",
    left: 132,
    top: 115,
    width: 240,
    fontSize: 13,
    fontWeight: 600,
    fill: "#E85D04",
  },
  {
    kind: "text",
    label: "ID",
    text: "ID · PCO-000142",
    left: 22,
    top: 165,
    width: 200,
    fontSize: 11,
    fontFamily: "monospace" as never,
    fill: "#737373",
  } as DefaultTextField,
];

const SCHOOL: DefaultField[] = [
  {
    kind: "text",
    label: "School name",
    text: "BRIGHT HORIZONS SCHOOL",
    left: 22,
    top: 18,
    width: 390,
    fontSize: 13,
    fontWeight: 700,
    fill: "#E85D04",
    textAlign: "center",
  },
  { kind: "photo", label: "Photo", left: 22, top: 50, width: 90, height: 120 },
  {
    kind: "text",
    label: "Student name",
    text: "Ishani Gupta",
    left: 132,
    top: 56,
    width: 240,
    fontSize: 22,
    fontWeight: 800,
    fill: "#0a0a0a",
  },
  {
    kind: "text",
    label: "Class",
    text: "Class XII-B",
    left: 132,
    top: 92,
    width: 240,
    fontSize: 14,
    fill: "#4b4b4b",
  },
  {
    kind: "text",
    label: "Roll number",
    text: "Roll · 22",
    left: 132,
    top: 116,
    width: 240,
    fontSize: 14,
    fill: "#4b4b4b",
  },
  {
    kind: "text",
    label: "Academic year",
    text: "Academic year 2025 – 26",
    left: 132,
    top: 140,
    width: 240,
    fontSize: 11,
    fill: "#737373",
  },
];

export function getDefaultFields(type: CardType): DefaultField[] {
  if (type === "COMPANY") return COMPANY;
  if (type === "SCHOOL") return SCHOOL;
  return [];
}
