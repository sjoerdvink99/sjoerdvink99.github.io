"use client";

import { useState } from "react";
import { publications } from "@/data/publications";
import PublicationCard from "./PublicationCard";

const TABS = [
  { id: "selected", label: "Selected" },
  { id: "all", label: "All Papers" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function PublicationList() {
  const [activeTab, setActiveTab] = useState<TabId>("selected");

  const counts = {
    selected: publications.filter((pub) => pub.selected).length,
    all: publications.length,
  };

  const filteredPubs =
    activeTab === "selected"
      ? publications.filter((pub) => pub.selected)
      : publications;

  return (
    <section id="publications" className="py-10 border-b-2">
      <h2 className="text-2xl mb-6">Publications</h2>

      <p className="mb-6">
        Most recent publications on{" "}
        <a
          href="https://scholar.google.com/citations?user=kHXpSd0AAAAJ&hl=en"
          target="_blank"
          rel="noreferrer"
          className="underline text-blue-600"
        >
          Google Scholar
        </a>
      </p>

      <div
        role="tablist"
        aria-label="Filter publications"
        className="inline-flex items-center gap-1 p-1 mb-6 rounded-lg bg-gray-100"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs tabular-nums ${
                  isActive ? "text-blue-400" : "text-gray-400"
                }`}
              >
                {counts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>

      <ul className="space-y-6">
        {filteredPubs.map((pub) => (
          <PublicationCard key={pub.slug} pub={pub} />
        ))}
      </ul>
    </section>
  );
}
