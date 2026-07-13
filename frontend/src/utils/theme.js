import {
  Dumbbell, Code2, BookMarked, Wind, Droplets, Footprints, Briefcase,
  Wallet, HeartHandshake, GraduationCap, Target, Moon,
} from "lucide-react";

export const BRAND = {
  blue: "#3B5BDB",
  blueSoft: "#EEF1FD",
  green: "#0EA968",
  greenSoft: "#E9F9F1",
  orange: "#E8850C",
  orangeSoft: "#FDF1E3",
  purple: "#7C5CFC",
  purpleSoft: "#F1EDFE",
  teal: "#0DA5B0",
  tealSoft: "#E6F7F8",
  pink: "#E0568C",
  pinkSoft: "#FCEAF1",
};

// One entry per Goal.category enum value from the backend model.
export const GOAL_CATEGORY_META = {
  Gym: { icon: Dumbbell, color: BRAND.green, soft: BRAND.greenSoft },
  Coding: { icon: Code2, color: BRAND.blue, soft: BRAND.blueSoft },
  Reading: { icon: BookMarked, color: BRAND.purple, soft: BRAND.purpleSoft },
  Meditation: { icon: Wind, color: BRAND.pink, soft: BRAND.pinkSoft },
  Water: { icon: Droplets, color: BRAND.green, soft: BRAND.greenSoft },
  Running: { icon: Footprints, color: BRAND.green, soft: BRAND.greenSoft },
  Sleep: { icon: Moon, color: BRAND.teal, soft: BRAND.tealSoft },
  Learning: { icon: GraduationCap, color: BRAND.purple, soft: BRAND.purpleSoft },
  Business: { icon: Briefcase, color: BRAND.blue, soft: BRAND.blueSoft },
  Finance: { icon: Wallet, color: BRAND.orange, soft: BRAND.orangeSoft },
  Relationship: { icon: HeartHandshake, color: BRAND.pink, soft: BRAND.pinkSoft },
  Career: { icon: Briefcase, color: BRAND.blue, soft: BRAND.blueSoft },
  Health: { icon: Dumbbell, color: BRAND.green, soft: BRAND.greenSoft },
  Custom: { icon: Target, color: BRAND.orange, soft: BRAND.orangeSoft },
};

// Matches the six life-score dimensions the backend computes.
export const DIMENSION_META = {
  discipline: { label: "Discipline", color: BRAND.orange },
  health: { label: "Health", color: BRAND.green },
  career: { label: "Career", color: BRAND.blue },
  learning: { label: "Learning", color: BRAND.purple },
  consistency: { label: "Consistency", color: BRAND.teal },
  mindfulness: { label: "Mindfulness", color: BRAND.pink },
};

export function themeVars(dark) {
  return dark
    ? {
        "--bg": "#0B0F19", "--surface": "#141A28", "--border": "#232B3D",
        "--text-primary": "#F4F6FB", "--text-secondary": "#9AA4BC", "--text-muted": "#5F6C87",
        "--track": "#1D2536", "--cell-empty": "#1A2131",
        "--tooltip-bg": "#F4F6FB", "--tooltip-text": "#141A28",
        "--sidebar": "#0E1420",
      }
    : {
        "--bg": "#F6F7FA", "--surface": "#FFFFFF", "--border": "#E6E8EE",
        "--text-primary": "#161B26", "--text-secondary": "#5B6472", "--text-muted": "#8A93A3",
        "--track": "#EEF0F5", "--cell-empty": "#EAECF2",
        "--tooltip-bg": "#161B26", "--tooltip-text": "#FFFFFF",
        "--sidebar": "#FFFFFF",
      };
}
