'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function RoiCalculator() {
  const [jds, setJds] = React.useState(200);
  const [minSaved, setMinSaved] = React.useState(30);
  const [costPerHour, setCostPerHour] = React.useState(40);

  const hoursSaved = (jds * minSaved) / 60;
  const dollarsSaved = hoursSaved * costPerHour;
  const jdForgeCost = jds * 99; // Standard tier-equivalent at $99
  const net = dollarsSaved - jdForgeCost;

  function fmt(n: number) {
    return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  return (
    <div className="grid gap-6 rounded-lg border border-border bg-surface-1 p-6 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <Label htmlFor="jds">JDs per month</Label>
          <Input
            id="jds"
            type="number"
            min={0}
            value={jds}
            onChange={(e) => setJds(Math.max(0, Number(e.target.value)))}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="min">Avg minutes saved per JD</Label>
          <Input
            id="min"
            type="number"
            min={0}
            value={minSaved}
            onChange={(e) => setMinSaved(Math.max(0, Number(e.target.value)))}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="cost">Loaded TA cost per hour ($)</Label>
          <Input
            id="cost"
            type="number"
            min={0}
            value={costPerHour}
            onChange={(e) => setCostPerHour(Math.max(0, Number(e.target.value)))}
            className="mt-1.5"
          />
        </div>
      </div>
      <div className="flex flex-col justify-center gap-3 rounded-md border border-border bg-background p-5">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Estimated monthly value
        </p>
        <div className="grid grid-cols-2 gap-3 font-mono text-sm">
          <div>
            <p className="text-muted-foreground">TA hours saved</p>
            <p className="text-2xl font-semibold text-foreground">{fmt(hoursSaved)}h</p>
          </div>
          <div>
            <p className="text-muted-foreground">$ saved</p>
            <p className="text-2xl font-semibold text-foreground">${fmt(dollarsSaved)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">JD-Forge cost (Standard)</p>
            <p className="text-2xl font-semibold text-foreground">${fmt(jdForgeCost)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Net</p>
            <p
              className={
                net >= 0
                  ? 'text-2xl font-semibold text-positive'
                  : 'text-2xl font-semibold text-warning'
              }
            >
              ${fmt(net)}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Indicative only. Subscription bundles reduce per-JD cost further.
        </p>
      </div>
    </div>
  );
}
