"use client";
/**
 * Aceternity UI floating dock, adapted: Next links, an active-page dot, and
 * items that open a small menu instead of navigating (the profile button holds
 * About plus the social links). Bottom-centre on both desktop and phones.
 **/

import { cn } from "@/lib/utils";
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
import { useEffect, useRef, useState } from "react";

export type DockItem = {
  title: string;
  icon: React.ReactNode;
  href: string;
  external?: boolean;
  /** When set, the item opens this menu; `href` decides when it shows as active. */
  menu?: DockItem[];
};

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

const shell = "border border-fg/10 bg-canvas/70 shadow-[0_12px_40px_-12px_rgba(27,20,25,0.35)] backdrop-blur-xl";

export const FloatingDock = ({ items }: { items: DockItem[] }) => {
  return (
    <>
      <FloatingDockDesktop items={items} />
      <FloatingDockMobile items={items} />
    </>
  );
};

function DockLink({
  item,
  className,
  children,
  onClick,
}: {
  item: DockItem;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  if (item.external)
    return (
      <a href={item.href} target="_blank" rel="noreferrer" aria-label={item.title} className={className} onClick={onClick}>
        {children}
      </a>
    );
  return (
    <Link href={item.href} aria-label={item.title} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

/* Popover that opens above a dock button; closes on outside click, Escape or a pick */
function DockMenu({
  items,
  onClose,
  align = "center",
}: {
  items: DockItem[];
  onClose: () => void;
  align?: "center" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.parentElement?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      role="menu"
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.98, transition: { duration: 0.12 } }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      style={{ transformOrigin: align === "right" ? "bottom right" : "bottom center" }}
      className={cn(
        "absolute bottom-full z-10 mb-3 flex w-52 flex-col gap-0.5 rounded-2xl p-1.5",
        align === "right" ? "right-0" : "left-1/2 -translate-x-1/2",
        shell,
        "bg-canvas/95",
      )}
    >
      {items.map((item) => (
        <DockLink
          key={item.title}
          item={item}
          onClick={onClose}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-fg/80 transition-colors duration-150 hover:bg-fg/[0.07] hover:text-fg"
        >
          <span className="size-5 shrink-0">{item.icon}</span>
          {item.title}
        </DockLink>
      ))}
    </motion.div>
  );
}

const FloatingDockMobile = ({ items }: { items: DockItem[] }) => {
  const [open, setOpen] = useState<string | null>(null);
  const pathname = usePathname();

  return (
    <nav className={cn("relative flex items-center gap-1 rounded-2xl p-1.5 md:hidden", shell)}>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const cls = cn(
          "relative flex size-12 items-center justify-center rounded-xl text-fg/60 transition-colors duration-150 active:scale-95",
          (active || open === item.title) && "bg-fg/10 text-fg",
        );
        if (item.menu)
          return (
            <div key={item.title} className="relative">
              <button
                type="button"
                aria-label={item.title}
                aria-haspopup="menu"
                aria-expanded={open === item.title}
                onClick={() => setOpen((o) => (o === item.title ? null : item.title))}
                className={cls}
              >
                <div className="size-5">{item.icon}</div>
              </button>
              <AnimatePresence>
                {open === item.title && <DockMenu items={item.menu} onClose={() => setOpen(null)} align="right" />}
              </AnimatePresence>
            </div>
          );
        return (
          <DockLink key={item.title} item={item} className={cls}>
            <div className="size-5">{item.icon}</div>
          </DockLink>
        );
      })}
    </nav>
  );
};

const FloatingDockDesktop = ({ items }: { items: DockItem[] }) => {
  const mouseX = useMotionValue(Infinity);
  const pathname = usePathname();
  return (
    <motion.nav
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn("mx-auto hidden h-16 items-end gap-3 rounded-2xl px-3 pb-3 md:flex", shell)}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} item={item} active={isActive(pathname, item.href)} />
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
  const [open, setOpen] = useState(false);

  const bubble = (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex aspect-square items-center justify-center rounded-full bg-fg/[0.07] text-fg/70",
        (active || open) && "bg-fg/15 text-fg",
      )}
    >
      <AnimatePresence>
        {hovered && !open && (
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
  );

  if (item.menu)
    return (
      <div className="relative">
        <button
          type="button"
          aria-label={item.title}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="block"
        >
          {bubble}
        </button>
        <AnimatePresence>{open && <DockMenu items={item.menu} onClose={() => setOpen(false)} />}</AnimatePresence>
      </div>
    );

  return <DockLink item={item}>{bubble}</DockLink>;
}
