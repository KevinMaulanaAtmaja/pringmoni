"use client";

import { useSyncExternalStore } from "react";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function subscribe(onStoreChange: () => void) {
  const id = setInterval(onStoreChange, 1000);
  return () => clearInterval(id);
}

function getSnapshot() {
  const t = new Date();
  return `${t.toLocaleDateString("id-ID", { weekday: "long" })}, ${t.getDate()} ${t.toLocaleDateString("id-ID", { month: "long" })} ${t.getFullYear()} | ${pad(t.getHours())}.${pad(t.getMinutes())}`;
}

function getServerSnapshot() {
  return "";
}

export function ClockDisplay() {
  const label = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <p className="text-sm font-bold text-gray-800 tabular-nums tracking-wide">
      {label}
    </p>
  );
}