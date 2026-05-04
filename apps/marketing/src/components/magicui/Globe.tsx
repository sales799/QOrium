'use client';

import createGlobe, { type COBEOptions } from 'cobe';
import { useMotionValue, useSpring } from 'motion/react';
import { useEffect, useMemo, useRef } from 'react';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/cn';

const MOVEMENT_DAMPING = 1400;

// cobe's COBEOptions type omits onRender in some published versions — widen here.
type GlobeOptions = Omit<COBEOptions, 'onRender'> & {
  onRender?: (state: Record<string, number>) => void;
};

const GLOBE_CONFIG: GlobeOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  // Signal cyan markers — sized by hiring volume of region
  markerColor: [20 / 255, 184 / 255, 217 / 255],
  glowColor: [1, 1, 1],
  markers: [
    { location: [12.9716, 77.5946], size: 0.12 }, // Bengaluru — Talpro HQ
    { location: [19.076, 72.8777], size: 0.1 }, // Mumbai
    { location: [28.7041, 77.1025], size: 0.08 }, // Delhi
    { location: [13.0827, 80.2707], size: 0.07 }, // Chennai
    { location: [17.385, 78.4867], size: 0.07 }, // Hyderabad
    { location: [40.7128, -74.006], size: 0.08 }, // NYC
    { location: [37.7749, -122.4194], size: 0.08 }, // SF
    { location: [51.5074, -0.1278], size: 0.06 }, // London
    { location: [1.3521, 103.8198], size: 0.06 }, // Singapore
    { location: [25.2048, 55.2708], size: 0.05 }, // Dubai
    { location: [-33.8688, 151.2093], size: 0.05 }, // Sydney
  ],
};

const COLORS = {
  light: {
    base: [1, 1, 1] as [number, number, number],
    glow: [1, 1, 1] as [number, number, number],
    marker: [20 / 255, 184 / 255, 217 / 255] as [number, number, number],
  },
  dark: {
    base: [0.4, 0.4, 0.4] as [number, number, number],
    glow: [0.24, 0.24, 0.27] as [number, number, number],
    marker: [125 / 255, 211 / 255, 252 / 255] as [number, number, number],
  },
};

interface GlobeProps {
  className?: string;
  config?: GlobeOptions;
}

export function Globe({ className, config = GLOBE_CONFIG }: GlobeProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const phiRef = useRef(0);
  const widthRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);

  const r = useMotionValue(0);
  const rs = useSpring(r, { mass: 1, damping: 30, stiffness: 100 });

  const finalConfig = useMemo(
    () => ({
      ...config,
      baseColor: isDark ? COLORS.dark.base : COLORS.light.base,
      glowColor: isDark ? COLORS.dark.glow : COLORS.light.glow,
      markerColor: isDark ? COLORS.dark.marker : COLORS.light.marker,
      dark: isDark ? 1 : 0,
      diffuse: isDark ? 0.5 : 0.4,
      mapBrightness: isDark ? 1.4 : 1.2,
    }),
    [config, isDark],
  );

  const updatePointer = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? 'grabbing' : 'grab';
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      r.set(r.get() + delta / MOVEMENT_DAMPING);
    }
  };

  useEffect(() => {
    const onResize = () => {
      if (canvasRef.current) {
        widthRef.current = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    const globe = createGlobe(canvasRef.current!, {
      ...finalConfig,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      onRender: (state: Record<string, number>) => {
        if (!pointerInteracting.current) phiRef.current += 0.005;
        state.phi = phiRef.current + rs.get();
        state.width = widthRef.current * 2;
        state.height = widthRef.current * 2;
      },
    } as COBEOptions);

    setTimeout(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = '1';
    }, 0);

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [rs, finalConfig]);

  return (
    <div className={cn('absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]', className)}>
      <canvas
        ref={canvasRef}
        className="size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]"
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX;
          updatePointer(e.clientX);
        }}
        onPointerUp={() => updatePointer(null)}
        onPointerOut={() => updatePointer(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) => e.touches[0] && updateMovement(e.touches[0].clientX)}
      />
    </div>
  );
}
