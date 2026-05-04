'use client';

import { Play, X } from 'lucide-react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { cn } from '@/lib/cn';

type AnimationStyle = 'from-bottom' | 'from-center' | 'from-top' | 'fade';

interface HeroVideoProps {
  animationStyle?: AnimationStyle;
  videoSrc: string;
  thumbnailSrc?: string;
  thumbnailAlt?: string;
  className?: string;
  children?: React.ReactNode;
}

const variants = {
  'from-bottom': {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  },
  'from-center': {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  },
  'from-top': {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
  },
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
};

export function HeroVideoDialog({
  animationStyle = 'from-center',
  videoSrc,
  thumbnailSrc,
  thumbnailAlt = 'Video thumbnail',
  className,
  children,
}: HeroVideoProps) {
  const [open, setOpen] = useState(false);
  const v = variants[animationStyle];

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        className="group relative w-full cursor-pointer rounded-2xl"
        onClick={() => setOpen(true)}
        aria-label="Play product overview video"
      >
        {thumbnailSrc ? (
          <Image
            src={thumbnailSrc}
            alt={thumbnailAlt}
            width={1920}
            height={1080}
            className="w-full rounded-2xl transition-all duration-200 ease-out group-hover:brightness-90"
          />
        ) : (
          (children ?? <div className="aspect-video w-full rounded-2xl bg-secondary/40" />)
        )}
        <div className="absolute inset-0 flex scale-90 items-center justify-center rounded-2xl transition-all duration-200 ease-out group-hover:scale-100">
          <div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-t from-signal-500/30 to-white/20 backdrop-blur-md ring-1 ring-white/40">
            <div className="relative flex size-16 items-center justify-center rounded-full bg-gradient-to-t from-signal-500 to-signal-300 shadow-lg transition-all duration-200 ease-out group-hover:scale-110">
              <Play className="size-7 fill-white text-white" />
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          >
            <motion.div
              {...v}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative mx-4 aspect-video w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute -top-12 right-0 rounded-full bg-white/10 p-2 text-white hover:scale-95 backdrop-blur transition"
                onClick={() => setOpen(false)}
                aria-label="Close video"
              >
                <X className="size-5" />
              </button>
              <div className="relative size-full overflow-hidden rounded-2xl border-2 border-white">
                <iframe
                  src={videoSrc}
                  className="size-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
