"use client";
/**
 * Aceternity UI floating dock, adapted: Next links, an active-page dot,
 * a divider between pages and socials, and a bottom-centre bar on phones
 * (pages inline, socials behind a "more" button).
 **/

import { cn } from "@/lib/utils";
import { IconDots } from "@tabler/icons-react";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

export type DockItem = {
  title: string;
  icon: React.ReactNode;
  href: string;
  external?: boolean;
};

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

export const FloatingDock = ({
  pages,
  links,
  desktopClassName,
  mobileClassName,
}: {
  pages: DockItem[];
  links: DockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop pages={pages} links={links} className={desktopClassName} />
      <FloatingDockMobile pages={pages} links={links} className={mobileClassName} />
    </>
  );
};

function DockLink({
  item,
  className,
  children,
}: {
  item: DockItem;
  className?: string;
  children: React.ReactNode;
}) {
  if (item.external)
    return (
      <a href={item.href} target="_blank" rel="noreferrer" aria-label={item.title} className={className}>
        {children}
      </a>
    );
  return (
    <Link href={item.href} aria-label={item.title} className={className}>
      {children}
    </Link>
  );
}

const shell =
  "border border-fg/10 bg-canvas/60 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl";

const FloatingDockMobile = ({
  pages,
  links,
  className,
}: {
  pages: DockItem[];
  links: DockItem[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className={cn("relative md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: "bottom right" }}
            className={cn("absolute right-0 bottom-full mb-2 flex gap-1.5 rounded-2xl p-1.5", shell)}
          >
            {links.map((item) => (
              <DockLink
                key={item.title}
                item={item}
                className="flex size-11 items-center justify-center rounded-xl bg-fg/5 text-fg/80 active:scale-95"
              >
                <div className="size-5">{item.icon}</div>
              </DockLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <nav className={cn("flex items-center gap-1 rounded-2xl p-1.5", shell)}>
        {pages.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <DockLink
              key={item.title}
              item={item}
              className={cn(
                "relative flex size-11 items-center justify-center rounded-xl text-fg/60 transition-colors duration-150 active:scale-95",
                active && "bg-fg/10 text-fg",
              )}
            >
              <div className="size-5">{item.icon}</div>
            </DockLink>
          );
        })}
        <span className="mx-0.5 h-6 w-px bg-fg/10" />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="More links"
          aria-expanded={open}
          className={cn(
            "flex size-11 items-center justify-center rounded-xl text-fg/60 active:scale-95",
            open && "bg-fg/10 text-fg",
          )}
        >
          <IconDots className="size-5" />
        </button>
      </nav>
    </div>
  );
};

const FloatingDockDesktop = ({
  pages,
  links,
  className,
}: {
  pages: DockItem[];
  links: DockItem[];
  className?: string;
}) => {
  const mouseX = useMotionValue(Infinity);
  const pathname = usePathname();
  return (
    <motion.nav
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn("mx-auto hidden h-16 items-end gap-3 rounded-2xl px-3 pb-3 md:flex", shell, className)}
    >
      {pages.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} item={item} active={isActive(pathname, item.href)} />
      ))}
      <span className="mb-1 h-8 w-px self-end bg-fg/15" />
      {links.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} item={item} />
      ))}
    </motion.nav>
  );
};

function IconContainer({
  mouseX,
  item,
  active,
}: {
  mouseX: MotionValue;
  item: DockItem;
  active?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const sizeTransform = useTransform(distance, [-150, 0, 150], [40, 76, 40]);
  const iconTransform = useTransform(distance, [-150, 0, 150], [20, 36, 20]);

  const spring = { mass: 0.1, stiffness: 150, damping: 12 };
  const size = useSpring(sizeTransform, spring);
  const iconSize = useSpring(iconTransform, spring);

  const [hovered, setHovered] = useState(false);

  return (
    <DockLink item={item}>
      <motion.div
        ref={ref}
        style={{ width: size, height: size }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "relative flex aspect-square items-center justify-center rounded-full bg-fg/[0.07] text-fg/70",
          active && "bg-fg/15 text-fg",
        )}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 6, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%", transition: { duration: 0.1 } }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
              className="absolute -top-9 left-1/2 w-fit rounded-md border border-fg/10 bg-canvas px-2 py-1 font-mono text-[11px] whitespace-pre text-fg"
            >
              {item.title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div style={{ width: iconSize, height: iconSize }} className="flex items-center justify-center">
          {item.icon}
        </motion.div>
        {active && <span className="absolute -bottom-2 size-1 rounded-full bg-plum" />}
      </motion.div>
    </DockLink>
  );
}
