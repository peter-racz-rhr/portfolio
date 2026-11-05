// Everything visible on the site lives in src/content/site.json. The public
// site reads it at build time; the /admin editor edits a copy and publishes it
// back to GitHub, which triggers a rebuild.

import raw from "@/content/site.json";

export type ProjectIcon = "sparkles" | "sun" | "book" | "terminal" | "globe" | "cube";
export const PROJECT_ICONS: ProjectIcon[] = ["sparkles", "sun", "book", "terminal", "globe", "cube"];
export const PROJECT_STATUSES = ["building", "shipped", "paused"] as const;

export type Project = {
  slug: string;
  name: string;
  blurb: string;
  description: string;
  stack: string[];
  status: (typeof PROJECT_STATUSES)[number];
  year: string;
  color: string;
  icon: ProjectIcon;
  repo: string;
  live?: string;
};

export type Photo = { name: string; image: string; caption: string };
export type FavPic = { title: string; image: string; x: number; y: number; rotate: number };
export type Track = { title: string; artist: string; album: string; length: string; cover: string; color: string };
export type HomeSectionId = "pictures" | "music" | "projects" | "contact";

export type Content = {
  site: {
    name: string;
    handle: string;
    tagline: string;
    status: string;
    heroImage: string;
    email: string;
    github: string;
    instagram: string;
    kofi: string;
    spotify: string;
  };
  hero: { line1: string; line2: string };
  home: {
    sections: { id: HomeSectionId; visible: boolean }[];
    picturesLabel: string;
    projectsLabel: string;
    projectsCount: number;
  };
  music: { title: string; eyebrow: string };
  contact: { eyebrow: string; title: string; titleAccent: string; body: string };
  projectsPage: { title: string; intro: string };
  galleryPage: { title: string };
  about: {
    eyebrow: string;
    title: string;
    dragHint: string;
    bio: string;
    bioHighlight: string[];
    contactLabel: string;
    instagramHandle: string;
    kofiLabel: string;
  };
  projects: Project[];
  photos: Photo[];
  favPics: FavPic[];
  tracks: Track[];
};

export const publishedContent = raw as Content;

export const HOME_SECTION_NAMES: Record<HomeSectionId, string> = {
  pictures: "Pictures",
  music: "On repeat (music)",
  projects: "Projects",
  contact: "Say hi",
};

// Templates for "Add" buttons in the editor
export const NEW_ITEMS = {
  projects: (): Project => ({
    slug: `project-${Date.now().toString(36)}`,
    name: "new project",
    blurb: "One line about it.",
    description: "A few sentences about what it is and why you made it.",
    stack: ["TypeScript"],
    status: "building",
    year: String(new Date().getFullYear()),
    color: "#48284a",
    icon: "sparkles",
    repo: "https://github.com/peter-racz-rhr",
  }),
  photos: (): Photo => ({ name: "New", image: "/hero.jpg", caption: "Where and when" }),
  favPics: (): FavPic => ({ title: "new favourite", image: "/hero.jpg", x: 40, y: 8, rotate: 0 }),
  tracks: (): Track => ({ title: "Song", artist: "Artist", album: "Album", length: "3:00", cover: "/hero.jpg", color: "#48284a" }),
};
export type ListKey = keyof typeof NEW_ITEMS;

/* ---- path helpers: "projects.2.name" ---- */

export function getAt(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj);
}

export function setAt<T>(obj: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split(".");
  const copy = (Array.isArray(obj) ? [...obj] : { ...(obj as object) }) as Record<string, unknown>;
  copy[head] = rest.length ? setAt(copy[head], rest.join("."), value) : value;
  return copy as T;
}
