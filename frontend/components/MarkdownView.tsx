"use client";

import React from "react";

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export function MarkdownView({ content, className = "" }: MarkdownViewProps) {
  if (!content) return null;

  // Split by double newlines or single newlines
  const blocks = content.split(/\n\n+/);

  const formatInline = (text: string): React.ReactNode => {
    // Replace **bold** with <strong>
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-ink-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="rounded bg-paper px-1.5 py-0.5 font-mono text-[13px] text-ink-900 border border-[var(--line)]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className={`space-y-3.5 text-[15px] leading-relaxed text-ink-900 ${className}`}>
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Horizontal Rule
        if (trimmed === "---" || trimmed === "***") {
          return <hr key={idx} className="my-4 border-[var(--line)]" />;
        }

        // Heading 3: ### Heading
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="pt-2 text-base font-bold tracking-tight text-ink-950">
              {formatInline(trimmed.replace(/^###\s+/, ""))}
            </h4>
          );
        }

        // Heading 2: ## Heading
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="pt-3 text-lg font-bold tracking-tight text-ink-950">
              {formatInline(trimmed.replace(/^##\s+/, ""))}
            </h3>
          );
        }

        // Bullet / Numbered lists
        const lines = trimmed.split("\n");
        const isList = lines.every((l) => /^\s*([*•\-–]|\d+\.)\s+/.test(l));

        if (isList) {
          return (
            <ul key={idx} className="my-2 space-y-1.5 pl-5 list-disc marker:text-orange-ink">
              {lines.map((line, lIdx) => {
                const cleaned = line.replace(/^\s*([*•\-–]|\d+\.)\s+/, "");
                return (
                  <li key={lIdx} className="text-ink-900">
                    {formatInline(cleaned)}
                  </li>
                );
              })}
            </ul>
          );
        }

        // Regular Paragraph with single-line breaks preserved
        return (
          <p key={idx} className="leading-relaxed">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {lIdx > 0 && <br />}
                {formatInline(line)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
