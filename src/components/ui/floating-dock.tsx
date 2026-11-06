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
import { usePathname, useRouter } from "next/navigation";
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
        "absolute bottom-full z-10 mb-3 flex w-52 flex-col gap-0.5 rounded-3xl p-1.5",
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
          className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-fg/80 transition-colors duration-150 hover:bg-fg/[0.07] hover:text-fg"
        >
          <span className="size-5 shrink-0">{item.icon}</span>
          {item.title}
        </DockLink>
      ))}
    </motion.div>
  );
}

// Phone dock. Tap an icon as usual, or put a finger on the dock and slide: the
// highlight follows your finger, and letting go opens whatever it is resting on.
const FloatingDockMobile = ({ items }: { items: DockItem[] }) => {
  const [open, setOpen] = useState<string | null>(null);
  const [drag, setDrag] = useState<number | null>(null); // index under the finger while sliding
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const slotRefs = useRef<(HTMLElement | null)[]>([]);
  const press = useRef<{ x: number; id: number; moved: boolean } | null>(null);
  const swallowClick = useRef(false);

  const activeIndex = items.findIndex((it) => (open ? it.title === open : isActive(pathname, it.href)));
  const restIndex = drag ?? activeIndex;

  // The highlight's left edge, in px from the nav's left edge.
  const target = useMotionValue(0);
  const x = useSpring(target, { stiffness: 700, damping: 45, mass: 0.6 });
  const placed = useRef(false);
  const shown = useMotionValue(0);

  const slotLeft = (i: number) => slotRefs.current[i]?.offsetLeft ?? 0;

  useEffect(() => {
    if (drag !== null) return;
    shown.set(restIndex >= 0 ? 1 : 0);
    if (restIndex < 0) return;
    target.set(slotLeft(restIndex));
    if (!placed.current) {
      // first placement: no slide in from the left edge
      x.jump(slotLeft(restIndex));
      placed.current = true;
    }
  }, [restIndex, drag, target, x, shown]);

  const indexAt = (clientX: number) => {
    let best = 0;
    let bestDist = Infinity;
    slotRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const d = Math.abs(clientX - (r.left + r.width / 2));
      if (d < bestDist) {
        best = i;
        bestDist = d;
      }
    });
    return best;
  };

  const follow = (clientX: number) => {
    const nav = navRef.current;
    const first = slotRefs.current[0];
    const last = slotRefs.current[items.length - 1];
    if (!nav || !first || !last) return;
    const left = clientX - nav.getBoundingClientRect().left - first.offsetWidth / 2;
    target.set(Math.min(last.offsetLeft, Math.max(first.offsetLeft, left)));
    const i = indexAt(clientX);
    setDrag((prev) => {
      if (prev !== i) navigator.vibrate?.(8);
      return i;
    });
  };

  const choose = (i: number) => {
    const item = items[i];
    if (!item) return;
    if (item.menu) return setOpen((o) => (o === item.title ? null : item.title));
    setOpen(null);
    if (item.external) window.open(item.href, "_blank", "noreferrer");
    else router.push(item.href);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    // Ignore touches inside an open menu
    if ((e.target as HTMLElement).closest("[role=menu]")) return;
    press.current = { x: e.clientX, id: e.pointerId, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const p = press.current;
    if (!p || p.id !== e.pointerId) return;
    if (!p.moved && Math.abs(e.clientX - p.x) < 6) return;
    if (!p.moved) {
      p.moved = true;
      navRef.current?.setPointerCapture(e.pointerId);
      setOpen(null);
    }
    follow(e.clientX);
  };

  const endPress = (e: React.PointerEvent, cancelled = false) => {
    const p = press.current;
    if (!p || p.id !== e.pointerId) return;
    press.current = null;
    if (!p.moved) return; // a plain tap: let the link/button handle it
    swallowClick.current = true;
    setTimeout(() => (swallowClick.current = false), 0);
    const i = indexAt(e.clientX);
    setDrag(null);
    target.set(slotLeft(i));
    if (!cancelled) choose(i);
  };

  return (
    <motion.nav
      ref={navRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => endPress(e)}
      onPointerCancel={(e) => endPress(e, true)}
      onClickCapture={(e) => {
        if (!swallowClick.current) return;
        e.preventDefault();
        e.stopPropagation();
      }}
      animate={{ scale: drag !== null ? 1.04 : 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn("relative flex touch-none items-center gap-1 rounded-3xl p-1.5 select-none md:hidden", shell)}
    >
      <motion.span
        aria-hidden
        style={{ x, opacity: shown }}
        animate={{ scale: drag !== null ? 1.08 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="pointer-events-none absolute top-1.5 left-0 size-12 rounded-2xl bg-fg/10"
      />
      {items.map((item, i) => {
        const lit = i === restIndex;
        const cls = cn(
          "relative flex size-12 items-center justify-center rounded-2xl text-fg/60 transition-colors duration-150",
          drag === null && "active:scale-95",
          lit && "text-fg",
        );
        const setSlot = (el: HTMLElement | null) => {
          slotRefs.current[i] = el;
        };
        if (item.menu)
          return (
            <div key={item.title} className="relative" ref={setSlot}>
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
          <div key={item.title} ref={setSlot}>
            <DockLink item={item} className={cls}>
              <div className="size-5">{item.icon}</div>
            </DockLink>
          </div>
        );
      })}
    </motion.nav>
  );
};

const FloatingDockDesktop = ({ items }: { items: DockItem[] }) => {
  const mouseX = useMotionValue(Infinity);
  const pathname = usePathname();
  return (
    <motion.nav
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn("mx-auto hidden h-16 items-end gap-3 rounded-3xl px-3 pb-3 md:flex", shell)}
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
            className="absolute -top-9 left-1/2 w-fit rounded-2xl border border-fg/10 bg-canvas px-2 py-1 font-mono text-[11px] whitespace-pre text-fg"
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
