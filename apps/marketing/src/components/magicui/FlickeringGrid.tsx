'use client';

import * as React from 'react';
import { cn, colorWithOpacity, getRGBA } from '@/lib/cn';

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
}

export const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 3,
  gridGap = 3,
  flickerChance = 0.2,
  color = '#B4B4B4',
  width,
  height,
  className,
  maxOpacity = 0.15,
  ...props
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = React.useState(false);
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const [canvasSize, setCanvasSize] = React.useState({ width: 0, height: 0 });

  const memoizedColor = React.useMemo(() => getRGBA(color), [color]);

  const drawGrid = React.useCallback(
    (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      cols: number,
      rows: number,
      squares: Float32Array,
      dpr: number,
    ) => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * (squareSize + gridGap) * dpr;
          const y = j * (squareSize + gridGap) * dpr;
          const sw = squareSize * dpr;
          const sh = squareSize * dpr;
          const opacity = squares[i * rows + j] ?? 0;
          ctx.fillStyle = colorWithOpacity(memoizedColor, opacity);
          ctx.fillRect(x, y, sw, sh);
        }
      }
    },
    [memoizedColor, squareSize, gridGap],
  );

  const setupCanvas = React.useCallback(
    (canvas: HTMLCanvasElement, w: number, h: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const cols = Math.ceil(w / (squareSize + gridGap));
      const rows = Math.ceil(h / (squareSize + gridGap));
      const squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity;
      }
      return { cols, rows, squares, dpr };
    },
    [squareSize, gridGap, maxOpacity],
  );

  const updateSquares = React.useCallback(
    (squares: Float32Array, deltaTime: number) => {
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * deltaTime) {
          squares[i] = Math.random() * maxOpacity;
        }
      }
    },
    [flickerChance, maxOpacity],
  );

  React.useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(query.matches);

    const updatePreference = (event: MediaQueryListEvent) => {
      setReduceMotion(event.matches);
    };
    query.addEventListener('change', updatePreference);
    return () => query.removeEventListener('change', updatePreference);
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let gridParams: ReturnType<typeof setupCanvas>;

    const updateSize = () => {
      const w = width || container.clientWidth;
      const h = height || container.clientHeight;
      setCanvasSize({ width: w, height: h });
      gridParams = setupCanvas(canvas, w, h);
    };
    updateSize();

    let lastTime = 0;
    const animate = (time: number) => {
      if (!isInView) return;
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      if (!reduceMotion) {
        updateSquares(gridParams.squares, dt);
      }
      drawGrid(
        ctx,
        canvas.width,
        canvas.height,
        gridParams.cols,
        gridParams.rows,
        gridParams.squares,
        gridParams.dpr,
      );
      if (reduceMotion) return;
      raf = requestAnimationFrame(animate);
    };

    const ro = new ResizeObserver(updateSize);
    ro.observe(container);

    const io = new IntersectionObserver(
      ([entry]) => {
        setIsInView(!!entry?.isIntersecting);
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    if (isInView) raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [setupCanvas, updateSquares, drawGrid, width, height, isInView, reduceMotion]);

  return (
    <div ref={containerRef} className={cn('h-full w-full', className)} {...props} aria-hidden>
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{ width: canvasSize.width, height: canvasSize.height }}
      />
    </div>
  );
};
