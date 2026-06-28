import { formatCapacityFractionLatin } from '../../lib/capacity';
import { RemainingCapacityHint } from './RemainingCapacityHint';
import type { Mawkib } from '../../types';

interface MawkibCapacityDisplayProps {
  available?: number | null;
  total: number;
}

export function MawkibCapacityDisplay({
  available,
  total,
}: MawkibCapacityDisplayProps) {
  const remaining = available ?? 0;

  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 text-sm">
      <span className="font-mono font-medium tabular-nums text-slate-800">
        {formatCapacityFractionLatin(available, total)}
      </span>
      <span className="font-mono text-slate-400">-</span>
      <RemainingCapacityHint
        available={remaining}
        numerals="latin"
        className="text-slate-500"
        fullClassName="text-xs font-semibold text-red-600"
      />
    </span>
  );
}

export function MawkibMaleCapacityDisplay({ mawkib }: { mawkib: Mawkib }) {
  return (
    <MawkibCapacityDisplay
      available={mawkib.availableMaleCapacity}
      total={mawkib.maleCapacity}
    />
  );
}

export function MawkibFemaleCapacityDisplay({ mawkib }: { mawkib: Mawkib }) {
  return (
    <MawkibCapacityDisplay
      available={mawkib.availableFemaleCapacity}
      total={mawkib.femaleCapacity}
    />
  );
}
