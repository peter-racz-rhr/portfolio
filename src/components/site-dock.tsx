"use client";

import {
  IconBrandGithub,
  IconBrandInstagram,
  IconCoffee,
  IconHome,
  IconLayoutGrid,
  IconMail,
  IconPhoto,
  IconUser,
  IconUserCircle,
} from "@tabler/icons-react";
import { FloatingDock, type DockItem } from "@/components/ui/floating-dock";
import { site } from "@/lib/data";

const icon = "size-full";

const items: DockItem[] = [
  { title: "Home", href: "/", icon: <IconHome className={icon} stroke={1.6} /> },
  { title: "Projects", href: "/projects", icon: <IconLayoutGrid className={icon} stroke={1.6} /> },
  { title: "Gallery", href: "/gallery", icon: <IconPhoto className={icon} stroke={1.6} /> },
  {
    title: "Me",
    href: "/about",
    icon: <IconUser className={icon} stroke={1.6} />,
    menu: [
      { title: "About me", href: "/about", icon: <IconUserCircle className={icon} stroke={1.6} /> },
      { title: "GitHub", href: site.github, external: true, icon: <IconBrandGithub className={icon} stroke={1.6} /> },
      { title: "Instagram", href: site.instagram, external: true, icon: <IconBrandInstagram className={icon} stroke={1.6} /> },
      { title: "Ko-fi", href: site.kofi, external: true, icon: <IconCoffee className={icon} stroke={1.6} /> },
      { title: "Email", href: `mailto:${site.email}`, external: true, icon: <IconMail className={icon} stroke={1.6} /> },
    ],
  },
];

export function SiteDock() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 [&>*]:pointer-events-auto">
      <FloatingDock items={items} />
    </div>
  );
}
