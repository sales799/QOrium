import { AnimatedBeamHorizontal } from '@/components/magicui/AnimatedBeam';

interface Stage {
  label: string;
  detail: string;
}

interface AnimatedPipelineProps {
  stages: ReadonlyArray<Stage>;
}

// Renders the seven-stage Content Engine as a horizontal flow on md+
// with AnimatedBeam packets traveling between consecutive stages on a
// staggered 4-second loop. Below md it stacks vertically without beams.
export function AnimatedPipeline({ stages }: AnimatedPipelineProps) {
  return (
    <div className="mt-12 grid gap-3 md:grid-cols-7">
      {stages.map((stage, i) => (
        <div
          key={stage.label}
          className="relative flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm"
        >
          <span className="font-mono text-xs text-muted-foreground">
            {String(i + 1).padStart(2, '0')}
          </span>
          <h3 className="text-sm font-semibold text-foreground">{stage.label}</h3>
          <p className="text-xs text-muted-foreground">{stage.detail}</p>
          {i < stages.length - 1 ? (
            <div
              aria-hidden="true"
              className="absolute -right-3 top-1/2 hidden h-3 w-6 -translate-y-1/2 motion-reduce:hidden md:block"
            >
              <AnimatedBeamHorizontal
                duration={4}
                delay={i * 0.5}
                gradientStartColor="oklch(54.65% 0.246 262.87)"
                gradientStopColor="oklch(0.85 0.12 220)"
              />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
