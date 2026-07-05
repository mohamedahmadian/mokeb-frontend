import {
  formatCapacityFractionLatin,
  occupiedFromAvailable,
} from "../../lib/capacity";
import type { Mawkib } from "../../types";
import { mawkibCapacitySnapshot } from "./MawkibInfoCard";

const CAPACITY_COLORS = {
  male: "#4a6fa5",
  female: "#db2777",
};

function CapacityMiniDonut({
  label,
  available,
  total,
  color,
  emptyMessage,
  size = 48,
}: {
  label: string;
  available: number;
  total: number;
  color: string;
  emptyMessage?: string;
  size?: number;
}) {
  const stroke = Math.max(4, Math.round(size / 12));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;
  const occupied = occupiedFromAvailable(total, available);
  const fraction = total > 0 ? Math.min(1, occupied / total) : 0;
  const dash = circumference * fraction;
  const isFull = fraction >= 0.999;
  const centerText =
    total === 0
      ? (emptyMessage ?? "—")
      : formatCapacityFractionLatin(available, total);
  const centerTextClass =
    total === 0
      ? size >= 72
        ? "text-[9px] text-slate-400"
        : size >= 56
          ? "text-[8px] text-slate-400"
          : "text-[7px] text-slate-400"
      : size >= 72
        ? "text-[11px]"
        : size >= 56
          ? "text-[10px]"
          : "text-[8px]";
  const labelClass =
    size >= 72 ? "text-[10px]" : size >= 56 ? "text-[9px]" : "text-[8px]";

  return (
    <div
      className="flex shrink-0 flex-col items-center"
      title={
        total === 0
          ? `${label}: ${emptyMessage ?? "بدون ظرفیت"}`
          : `${label}: ${formatCapacityFractionLatin(available, total)}`
      }
    >
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#e8eef6"
            strokeWidth={stroke}
          />
          {total > 0 && fraction > 0 && (
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeLinecap={isFull ? "butt" : "round"}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center px-0.5">
          <span
            className={`text-center font-mono font-bold leading-none text-slate-700 ${centerTextClass}`}
          >
            {centerText}
          </span>
        </div>
      </div>
      <span className={`mt-0.5 font-medium text-slate-500 ${labelClass}`}>
        {label}
      </span>
    </div>
  );
}

export function MawkibCapacityMiniDonuts({
  mawkib,
  size = 48,
}: {
  mawkib: Mawkib;
  size?: number;
}) {
  const capacity = mawkibCapacitySnapshot(mawkib);

  return (
    <div
      className={`flex shrink-0 items-start ${size >= 72 ? "gap-2" : "gap-1"}`}
    >
      <CapacityMiniDonut
        label="آقا"
        available={capacity.availableMale}
        total={capacity.maleCapacity}
        color={CAPACITY_COLORS.male}
        size={size}
      />
      <CapacityMiniDonut
        label="خانم"
        available={capacity.availableFemale}
        total={capacity.femaleCapacity}
        color={CAPACITY_COLORS.female}
        emptyMessage="—"
        size={size}
      />
    </div>
  );
}
