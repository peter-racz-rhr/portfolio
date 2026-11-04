// Filler content for the wireframe. Swap for real data (or the admin page) later.

const img = (seed: string, w = 800, h = 1000) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const site = {
  name: "Peter Racz",
  handle: "peter-racz-rhr",
  tagline: "I build small apps, break them, and fix them again.",
  email: "hello@example.com",
  github: "https://github.com/peter-racz-rhr",
  instagram: "https://instagram.com/",
  kofi: "https://ko-fi.com/",
  spotify: "https://open.spotify.com/",
};

export type Project = {
  slug: string;
  name: string;
  blurb: string;
  description: string;
  stack: string[];
  status: "building" | "shipped" | "paused";
  year: string;
  color: string;
  icon: "sparkles" | "sun" | "book" | "terminal" | "globe" | "cube";
  repo: string;
  live?: string;
};

export const projects: Project[] = [
  {
    slug: "ante-app",
    name: "ante-app",
    blurb: "Lorem ipsum dolor sit amet, the big one right now.",
    description:
      "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
    stack: ["TypeScript", "Next.js", "Tailwind"],
    status: "building",
    year: "2026",
    color: "#48284a",
    icon: "sparkles",
    repo: "https://github.com/peter-racz-rhr/ante-app",
    live: "#",
  },
  {
    slug: "magyarotyesz-demo",
    name: "magyarotyesz",
    blurb: "Duis aute irure dolor in reprehenderit in voluptate.",
    description:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus.",
    stack: ["TypeScript", "React"],
    status: "building",
    year: "2026",
    color: "#1b1419",
    icon: "cube",
    repo: "https://github.com/peter-racz-rhr/magyarotyesz-demo",
  },
  {
    slug: "naplemente",
    name: "naplemente",
    blurb: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur.",
    description:
      "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt.",
    stack: ["TypeScript"],
    status: "shipped",
    year: "2026",
    color: "#d9c6d5",
    icon: "sun",
    repo: "https://github.com/peter-racz-rhr/naplemente",
  },
  {
    slug: "german-app",
    name: "german-app",
    blurb: "Quis autem vel eum iure reprehenderit qui in ea voluptate.",
    description:
      "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias.",
    stack: ["JavaScript"],
    status: "paused",
    year: "2026",
    color: "#7c4a79",
    icon: "book",
    repo: "https://github.com/peter-racz-rhr/german-app",
  },
  {
    slug: "mint_desktop_apps",
    name: "mint desktop apps",
    blurb: "Temporibus autem quibusdam et aut officiis debitis.",
    description:
      "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.",
    stack: ["Python"],
    status: "shipped",
    year: "2026",
    color: "#ebdfe7",
    icon: "terminal",
    repo: "https://github.com/peter-racz-rhr/mint_desktop_apps",
  },
  {
    slug: "lwk",
    name: "lwk",
    blurb: "Itaque earum rerum hic tenetur a sapiente delectus.",
    description:
      "Ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Similique sunt in culpa qui officia deserunt.",
    stack: ["HTML", "CSS"],
    status: "building",
    year: "2026",
    color: "#a9789f",
    icon: "globe",
    repo: "https://github.com/peter-racz-rhr/lwk",
  },
];

export type Photo = { name: string; image: string; caption: string };

export const photos: Photo[] = [
  { name: "Balaton", image: img("balaton"), caption: "Lorem ipsum, summer" },
  { name: "Desk", image: img("desk-setup"), caption: "Dolor sit, late night" },
  { name: "Budapest", image: img("budapest"), caption: "Amet elit, the city" },
  { name: "Friends", image: img("friends-pic"), caption: "Sed do, the crew" },
  { name: "Snow", image: img("snow-day"), caption: "Tempor, winter" },
  { name: "Road", image: img("road-trip"), caption: "Labore, somewhere" },
  { name: "Sunset", image: img("naplemente"), caption: "Magna, golden hour" },
];

export const favPics = [
  { title: "lorem ipsum", image: img("fav-1", 600, 750), className: "absolute top-6 left-[6%] rotate-[-6deg]" },
  { title: "dolor sit", image: img("fav-2", 600, 750), className: "absolute top-24 left-[30%] rotate-[4deg]" },
  { title: "amet consectetur", image: img("fav-3", 600, 750), className: "absolute top-4 right-[28%] rotate-[-3deg]" },
  { title: "adipiscing", image: img("fav-4", 600, 750), className: "absolute top-32 right-[6%] rotate-[7deg]" },
  { title: "sed do eiusmod", image: img("fav-5", 600, 750), className: "absolute top-[18rem] left-[18%] rotate-[3deg]" },
  { title: "tempor", image: img("fav-6", 600, 750), className: "absolute top-[16rem] right-[18%] rotate-[-8deg]" },
];


// "On repeat" fallback tracks, shown until live Spotify data loads (and in local dev)
export const tracks = [
  { title: "Lorem Ipsum", artist: "Dolor Sit", album: "Amet", length: "3:24", cover: img("cover-1", 600, 600), color: "#48284a" },
  { title: "Consectetur", artist: "Adipiscing", album: "Elit Sed", length: "2:58", cover: img("cover-2", 600, 600), color: "#7c4a79" },
  { title: "Do Eiusmod", artist: "Tempor Band", album: "Incididunt", length: "4:11", cover: img("cover-3", 600, 600), color: "#1b1419" },
  { title: "Ut Labore", artist: "Et Dolore", album: "Magna", length: "3:47", cover: img("cover-4", 600, 600), color: "#a9789f" },
  { title: "Aliqua Night", artist: "Ut Enim", album: "Minim", length: "2:39", cover: img("cover-5", 600, 600), color: "#5b3a5d" },
];
