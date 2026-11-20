"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { id: "about", label: "About", showOnMobile: false },
  { id: "projects", label: "Projects", showOnMobile: true },
  { id: "skills", label: "Skills", showOnMobile: false },
  { id: "contact", label: "Contact", showOnMobile: true },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);

  // blurred background once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // underline the section that is in the middle of the screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setCurrent(entry.target.id === "top" ? null : entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ["top", ...LINKS.map((l) => l.id)].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Main"
      className={`fixed inset-x-0 top-0 z-20 flex h-[calc(68px+env(safe-area-inset-top,0px))] items-center justify-between gap-4 border-b px-4 pt-[env(safe-area-inset-top,0px)] transition-colors duration-300 sm:px-10 ${
        scrolled
          ? "border-[rgba(170,215,240,.14)] bg-navbg backdrop-blur-md"
          : "border-transparent"
      }`}
    >
      <a href="#top" className="font-bold tracking-[3px]">
        RAZE
      </a>

      <div className="flex items-center gap-1 text-sm">
        {LINKS.map(({ id, label, showOnMobile }) => (
          <a
            key={id}
            href={`#${id}`}
            className={`border-b-2 px-2 py-3 sm:px-3.5 ${
              showOnMobile ? "" : "hidden sm:block"
            } ${current === id ? "border-[#FF7A2F]" : "border-transparent"}`}
          >
            {label}
          </a>
        ))}
        <a
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 border border-[rgba(234,244,250,.55)] px-4 py-3 font-bold tracking-[.06em] transition-colors hover:bg-ink hover:text-c0"
        >
          Resume
        </a>
      </div>
    </nav>
  );
}