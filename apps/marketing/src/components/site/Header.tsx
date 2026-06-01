'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BookOpenCheck,
  Boxes,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  Code2,
  DatabaseZap,
  FileJson,
  FileText,
  Fingerprint,
  Globe2,
  IndianRupee,
  KeyRound,
  Layers3,
  LockKeyhole,
  Menu,
  Network,
  Radar,
  Scale,
  ScrollText,
  ShieldCheck,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  actionNavLinks,
  directNavLinks,
  megaMenuPanels,
  visibleLinks,
  type MegaMenuPanel,
  type MenuIcon,
  type NavLink,
} from '@/content/marketing-ia';
import { cn } from '@/lib/cn';
import { Logo } from './Logo';

const ICONS: Record<MenuIcon, LucideIcon> = {
  api: FileJson,
  authoring: ScrollText,
  bank: Banknote,
  benchmarks: BadgeCheck,
  book: BookOpenCheck,
  building: Building2,
  code: Code2,
  compare: Scale,
  data: DatabaseZap,
  docs: FileText,
  forge: Sparkles,
  globe: Globe2,
  graph: Network,
  india: IndianRupee,
  leak: Radar,
  lock: LockKeyhole,
  method: BrainCircuit,
  platform: Layers3,
  pricing: BriefcaseBusiness,
  shield: ShieldCheck,
  staffing: UsersRound,
  vault: Boxes,
  watermark: Fingerprint,
};

function IconBadge({
  icon,
  className,
}: {
  icon?: MenuIcon | undefined;
  className?: string | undefined;
}) {
  const Icon = icon ? ICONS[icon] : ChevronRight;

  return (
    <span
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-signal-300',
        className,
      )}
      aria-hidden="true"
    >
      <Icon className="size-4" />
    </span>
  );
}

interface HeaderLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  item: NavLink;
}

const HeaderLink = React.forwardRef<HTMLAnchorElement, HeaderLinkProps>(function HeaderLink(
  { item, className, children, ...props },
  ref,
) {
  const mergedClassName = className;
  const linkProps = props as Omit<
    React.ComponentPropsWithoutRef<typeof Link>,
    'href' | 'className'
  >;

  if (item.external) {
    return (
      <a
        ref={ref}
        className={mergedClassName}
        {...props}
        href={item.href}
        target="_blank"
        rel="noopener"
      >
        {children}
      </a>
    );
  }

  return (
    <Link ref={ref} className={mergedClassName} {...linkProps} href={item.href}>
      {children}
    </Link>
  );
});

HeaderLink.displayName = 'HeaderLink';

function MegaMenuPanelContent({ panel }: { panel: MegaMenuPanel }) {
  const promo = visibleLinks([panel.promo])[0];

  return (
    <div className="w-[min(calc(100vw-2rem),1180px)] overflow-hidden rounded-lg border border-shell-border bg-[var(--shell-panel)] text-white shadow-2xl">
      <div className="grid gap-0 lg:grid-cols-[1fr_19rem]">
        <div className="evidence-ledger grid gap-6 p-5 lg:grid-cols-3 lg:p-6">
          {panel.columns.map((column) => {
            const links = visibleLinks(column.links);

            if (links.length === 0) {
              return null;
            }

            return (
              <div key={column.heading} className="min-w-0">
                <p className="font-mono text-[11px] font-semibold uppercase text-shell-muted">
                  {column.heading}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {links.map((link) => (
                    <li key={`${column.heading}-${link.href}`}>
                      <NavigationMenuLink asChild>
                        <HeaderLink
                          item={link}
                          className="group flex min-h-16 gap-3 rounded-md border border-transparent p-2.5 transition-colors hover:border-white/10 hover:bg-white/[0.06] focus-visible:border-signal-300 focus-visible:bg-white/[0.08]"
                        >
                          <IconBadge icon={link.icon} />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-white">
                              {link.label}
                            </span>
                            {link.description ? (
                              <span className="mt-0.5 block text-xs leading-5 text-shell-muted">
                                {link.description}
                              </span>
                            ) : null}
                          </span>
                        </HeaderLink>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {promo ? (
          <div className="border-t border-white/10 bg-white/[0.045] p-5 lg:border-l lg:border-t-0 lg:p-6">
            <IconBadge icon={promo.icon} className="size-10 text-india-500" />
            <p className="mt-4 font-mono text-[11px] font-semibold uppercase text-india-500">
              {promo.eyebrow}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">{promo.title}</h3>
            <p className="mt-3 text-sm leading-6 text-shell-muted">{promo.description}</p>
            <Link
              href={promo.href}
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-white/12 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/[0.08]"
            >
              {promo.cta}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MobilePanel({ panel }: { panel: MegaMenuPanel }) {
  return (
    <AccordionItem value={panel.label} className="border-white/10">
      <AccordionTrigger className="py-4 text-base text-white hover:text-signal-300">
        {panel.label}
      </AccordionTrigger>
      <AccordionContent className="pb-5 text-shell-muted">
        <div className="grid gap-5">
          {panel.columns.map((column) => {
            const links = visibleLinks(column.links);

            if (links.length === 0) {
              return null;
            }

            return (
              <div key={column.heading}>
                <p className="font-mono text-[11px] font-semibold uppercase text-shell-muted">
                  {column.heading}
                </p>
                <div className="mt-2 grid gap-1">
                  {links.map((link) => (
                    <SheetClose asChild key={`${panel.label}-${link.href}`}>
                      <HeaderLink
                        item={link}
                        className="flex gap-3 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-white/[0.06] focus-visible:bg-white/[0.08]"
                      >
                        <IconBadge icon={link.icon} />
                        <span>
                          <span className="block text-sm font-semibold text-white">
                            {link.label}
                          </span>
                          {link.description ? (
                            <span className="mt-0.5 block text-xs leading-5 text-shell-muted">
                              {link.description}
                            </span>
                          ) : null}
                        </span>
                      </HeaderLink>
                    </SheetClose>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function Header() {
  const directLinks = visibleLinks(directNavLinks);
  const actionLinks = visibleLinks(actionNavLinks);
  const primaryAction = actionLinks[0];
  const secondaryActions = actionLinks.slice(1);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--shell-bg)] text-white shadow-[0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mx-auto flex h-[68px] max-w-content items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="shrink-0 rounded-md focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Qorium home"
        >
          <Logo className="text-white" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          <NavigationMenu delayDuration={150} skipDelayDuration={0}>
            <NavigationMenuList>
              {megaMenuPanels.map((panel) => (
                <NavigationMenuItem key={panel.label}>
                  <NavigationMenuTrigger className="text-shell-muted hover:text-white data-[state=open]:text-white">
                    {panel.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <MegaMenuPanelContent panel={panel} />
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}

              {directLinks.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink asChild>
                    <HeaderLink
                      item={item}
                      className="inline-flex h-10 items-center rounded-md px-3 text-sm font-medium text-shell-muted transition-colors hover:text-white focus-visible:text-white"
                    >
                      {item.label}
                    </HeaderLink>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {secondaryActions.map((item) => (
            <Button
              asChild
              key={item.href}
              variant="ghost"
              size="sm"
              className="text-shell-muted hover:bg-white/[0.08] hover:text-white"
            >
              <HeaderLink item={item}>
                <KeyRound className="size-4" />
                {item.label}
              </HeaderLink>
            </Button>
          ))}
          {primaryAction ? (
            <Button asChild variant="primary" size="sm">
              <HeaderLink item={primaryAction}>{primaryAction.label}</HeaderLink>
            </Button>
          ) : null}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="surface-shell w-[min(100vw,28rem)] overflow-y-auto border-white/10 p-6"
          >
            <div className="pr-8">
              <Logo className="text-white" />
            </div>

            <Accordion type="multiple" className="mt-6">
              {megaMenuPanels.map((panel) => (
                <MobilePanel key={panel.label} panel={panel} />
              ))}
            </Accordion>

            <div className="mt-5 grid gap-2 border-t border-white/10 pt-5">
              {directLinks.map((item) => (
                <SheetClose asChild key={item.href}>
                  <HeaderLink
                    item={item}
                    className="flex items-center justify-between rounded-md px-2 py-3 text-base font-semibold text-white transition-colors hover:bg-white/[0.06]"
                  >
                    {item.label}
                    <ChevronRight className="size-4" />
                  </HeaderLink>
                </SheetClose>
              ))}
            </div>

            <div className="mt-5 grid gap-2">
              {actionLinks.map((item, index) => (
                <SheetClose asChild key={item.href}>
                  <Button asChild variant={index === 0 ? 'primary' : 'secondary'}>
                    <HeaderLink item={item}>{item.label}</HeaderLink>
                  </Button>
                </SheetClose>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
