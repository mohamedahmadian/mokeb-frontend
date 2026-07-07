import { Link } from "react-router-dom";
import { NavIcon } from "../ui/NavIcons";
import {
  attendanceLookupQueryFromReservation,
  attendancePagePath,
  isAttendanceEligibleReservation,
} from "../../lib/attendance-page-utils";
import { btnSecondary } from "../../lib/styles";
import type { Reservation } from "../../types";

interface ReservationAttendanceNavigateCardProps {
  reservation: Reservation;
}

const attendanceButtonClass = `${btnSecondary} inline-flex w-full min-w-0 items-center justify-center gap-1.5 !px-2 !py-2 !text-xs sm:!text-sm sm:w-auto`;

export function ReservationAttendanceNavigateCard({
  reservation,
}: ReservationAttendanceNavigateCardProps) {
  if (!isAttendanceEligibleReservation(reservation.status)) {
    return null;
  }

  const lookupQuery = attendanceLookupQueryFromReservation(reservation);
  if (!lookupQuery) return null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-800">ورود و خروج</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            جهت مشاهده وضعیت ورود و خروج کلیک نمایید
          </p>
        </div>
        <Link
          to={attendancePagePath(lookupQuery)}
          className={attendanceButtonClass}
        >
          <NavIcon
            name="login"
            className="h-4 w-4 shrink-0"
            strokeWidth={1.75}
          />
          ورود و خروج
        </Link>
      </div>
    </section>
  );
}
