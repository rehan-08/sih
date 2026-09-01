// Simple linear-trend projection used to extend live telemetry sparklines into a
// "next 24-48h" forecast segment. Not a real predictive model — a damped least-squares
// extrapolation over the recent trailing window, clamped to sane bounds.

interface ProjectOptions {
  min?: number;
  max?: number;
}

export function projectTrend(history: number[], stepsAhead: number, opts: ProjectOptions = {}): number[] {
  if (history.length < 2 || stepsAhead <= 0) return [];

  const windowSize = Math.min(history.length, 8);
  const window = history.slice(history.length - windowSize);

  // Least-squares slope over the trailing window.
  const n = window.length;
  const xMean = (n - 1) / 2;
  const yMean = window.reduce((sum, v) => sum + v, 0) / n;

  let numerator = 0;
  let denominator = 0;
  window.forEach((y, x) => {
    numerator += (x - xMean) * (y - yMean);
    denominator += (x - xMean) * (x - xMean);
  });
  const slope = denominator === 0 ? 0 : numerator / denominator;

  const lastValue = history[history.length - 1];
  const projected: number[] = [];
  let current = lastValue;

  for (let step = 1; step <= stepsAhead; step++) {
    const damping = Math.pow(0.85, step - 1);
    current = current + slope * damping;
    if (opts.min !== undefined) current = Math.max(opts.min, current);
    if (opts.max !== undefined) current = Math.min(opts.max, current);
    projected.push(Number(current.toFixed(1)));
  }

  return projected;
}
