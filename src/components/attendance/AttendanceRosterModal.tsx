import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MawkibFilterSelect } from '../mawkibs/MawkibFilterSelect';
import { Modal } from '../Modal';
import { NavIcon } from '../ui/NavIcons';
import {
  attendanceRosterApi,
  type AttendanceRosterKind,
  type AttendanceRosterResponse,
  type AttendanceRosterRow,
} from '../../lib/attendance-roster';
import { downloadAttendanceRosterExcel } from '../../lib/attendance-roster-export';
import { formatPersianNumber } from '../../lib/capacity';
import { formatDurationFaWords } from '../../lib/format-duration-fa';
import { formatTimeFromIso } from '../../lib/format-time';
import { reservationEventsApi } from '../../lib/reservation-events-api';
import { attendanceRosterTitle } from '../../lib/attendance-page-utils';
import { filterInputClass, btnAction, btnPrimary } from '../../lib/styles';
import { useAuth } from '../../contexts/AuthContext';
import { toast, toastApiError } from '../../lib/toast';

const rosterActionBtn = `${btnAction} inline-flex shrink-0 items-center justify-center gap-1.5 border !min-h-8 !px-2.5 !py-1.5 !text-[11px]`;
const rosterSecondaryBtn = `${rosterActionBtn} border-slate-200 bg-white text-slate-700 hover:bg-slate-50`;
const rosterPrimaryBtn = `${btnPrimary} inline-flex shrink-0 items-center justify-center gap-1.5 !min-h-8 !px-2.5 !py-1.5 !text-[11px]`;

interface AttendanceRosterModalProps {
  open: boolean;
  kind: AttendanceRosterKind;
  onClose: () => void;
}

export function AttendanceRosterModal({
  open,
  kind,
  onClose,
}: AttendanceRosterModalProps) {
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('Admin') ?? false;
  const [mawkibId, setMawkibId] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AttendanceRosterResponse | null>(null);
  const [registeringId, setRegisteringId] = useState<number | null>(null);

  const parsedMawkibId = mawkibId ? Number.parseInt(mawkibId, 10) : undefined;

  const loadRoster = useCallback(async () => {
    setLoading(true);
    try {
      const result = await attendanceRosterApi.get(kind, parsedMawkibId);
      setData(result);
    } catch (err) {
      setData(null);
      toastApiError(err, 'خطا در بارگذاری لیست');
    } finally {
      setLoading(false);
    }
  }, [kind, parsedMawkibId]);

  const { data: mawkibs = [] } = useQuery({
    queryKey: ['mawkibs-filter', isAdmin ? 'admin' : 'my'],
    queryFn: async () => {
      const { mawkibsApi } = await import('../../lib/mawkibs');
      return isAdmin ? mawkibsApi.getAdminList() : mawkibsApi.getMyList();
    },
    enabled: open,
  });

  useEffect(() => {
    if (!open) {
      setMawkibId('');
      setData(null);
      return;
    }

    if (mawkibId || mawkibs.length === 0) return;
    if (mawkibs.length === 1) {
      setMawkibId(String(mawkibs[0].id));
    }
  }, [open, mawkibs, mawkibId]);

  useEffect(() => {
    if (!open) return;
    void loadRoster();
  }, [open, loadRoster]);

  const handleRegisterCheckIn = async (row: AttendanceRosterRow) => {
    if (!row.registerEventType) return;

    setRegisteringId(row.reservationId);
    try {
      await reservationEventsApi.record(row.reservationId, {
        eventType: row.registerEventType,
      });
      toast.success(
        row.registerEventType === 'CHECK_IN'
          ? 'ورود با موفقیت ثبت شد'
          : 'بازگشت به موکب ثبت شد',
      );
      await loadRoster();
    } catch (err) {
      toastApiError(err, 'خطا در ثبت ورود');
    } finally {
      setRegisteringId(null);
    }
  };

  const isAbsent = kind === 'absent';
  const durationHeader = isAbsent ? 'مدت زمان عدم حضور' : 'مدت حضور';
  const selectedMawkibName = mawkibId
    ? mawkibs.find((m) => String(m.id) === mawkibId)?.name
    : null;

  return (
    <Modal open={open} onClose={onClose} title={attendanceRosterTitle(kind)} size="xl">
      <div className="space-y-4">
        <div className="inline-flex w-fit max-w-full flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5">
          <label className="shrink-0 text-xs font-medium text-slate-600">
            موکب
          </label>
          <MawkibFilterSelect
            value={mawkibId}
            onChange={setMawkibId}
            scope={isAdmin ? 'admin' : 'my'}
            placeholder="همه موکب‌ها"
            className={`${filterInputClass} !min-h-9 !w-auto min-w-[10rem] max-w-xs !py-2 !text-sm`}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            {loading
              ? 'در حال بارگذاری...'
              : data
                ? `${formatPersianNumber(data.rows.length)} نفر${
                    selectedMawkibName ? ` — ${selectedMawkibName}` : ''
                  }`
                : '—'}
          </p>
          <button
            type="button"
            disabled={!data || data.rows.length === 0}
            onClick={() => data && downloadAttendanceRosterExcel(data)}
            className={rosterSecondaryBtn}
          >
            <NavIcon name="download" className="h-3.5 w-3.5" strokeWidth={1.75} />
            دانلود اکسل
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">
            در حال بارگذاری لیست...
          </p>
        ) : !data || data.rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            {isAbsent
              ? 'در حال حاضر زائری با وضعیت «ورود نخورده» یا «خروج موقت» در بازه اقامت یافت نشد.'
              : 'در حال حاضر زائری با وضعیت حاضر در موکب یافت نشد.'}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-right text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2.5 font-semibold text-slate-600">#</th>
                  <th className="px-3 py-2.5 font-semibold text-slate-600">
                    نام و نام خانوادگی
                  </th>
                  <th className="px-3 py-2.5 font-semibold text-slate-600">
                    تلفن همراه
                  </th>
                  <th className="px-3 py-2.5 font-semibold text-slate-600">
                    کد ملی
                  </th>
                  <th className="px-3 py-2.5 font-semibold text-slate-600">
                    {durationHeader}
                  </th>
                  {isAbsent && (
                    <>
                      <th className="px-3 py-2.5 font-semibold text-slate-600">
                        آخرین خروج
                      </th>
                      <th className="px-3 py-2.5 font-semibold text-slate-600">
                        عملیات
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.rows.map((row, index) => {
                  const durationLabel = formatDurationFaWords(row.durationMs);
                  return (
                    <tr key={row.reservationId} className="hover:bg-slate-50/80">
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-500">
                        {formatPersianNumber(index + 1)}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-slate-800">
                        {row.fullName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 font-mono text-slate-700" dir="ltr">
                        {row.mobile || '—'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 font-mono text-slate-700" dir="ltr">
                        {row.nationalId || '—'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                        {durationLabel}
                      </td>
                      {isAbsent && (
                        <>
                          <td className="whitespace-nowrap px-3 py-2.5 text-slate-700" dir="ltr">
                            {row.lastExitAt ? (
                              formatTimeFromIso(row.lastExitAt)
                            ) : row.absenceKind === 'NOT_ARRIVED' ? (
                              <span className="text-amber-700">ورود ثبت نشده</span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5">
                            {row.registerEventType ? (
                              <button
                                type="button"
                                disabled={registeringId === row.reservationId}
                                onClick={() => void handleRegisterCheckIn(row)}
                                className={rosterPrimaryBtn}
                              >
                                <NavIcon
                                  name="login"
                                  className="h-3.5 w-3.5 shrink-0"
                                  strokeWidth={1.75}
                                />
                                {registeringId === row.reservationId
                                  ? '...'
                                  : 'ثبت ورود'}
                              </button>
                            ) : (
                              '—'
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}

export function AttendanceRosterSidebarButtons({
  onOpenAbsent,
  onOpenPresent,
  className = '',
}: {
  onOpenAbsent: () => void;
  onOpenPresent: () => void;
  className?: string;
}) {
  const panelBtn = `${rosterSecondaryBtn} !min-h-10 w-full !justify-start !px-3 !py-2.5 !text-xs border-slate-200/90 shadow-sm`;
  const absentTitle = attendanceRosterTitle('absent');
  const presentTitle = attendanceRosterTitle('present');

  return (
    <aside className={`flex flex-col gap-2 lg:w-52 lg:shrink-0 ${className}`}>
      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <div className="space-y-2 p-2.5">
          <div className="flex items-center gap-2 px-0.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-200/80">
              <NavIcon name="users" className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <h2 className="text-sm font-semibold text-slate-800">فهرست‌ها</h2>
          </div>
          <button type="button" onClick={onOpenAbsent} className={panelBtn}>
            <NavIcon name="logout" className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            {absentTitle}
          </button>
          <button type="button" onClick={onOpenPresent} className={panelBtn}>
            <NavIcon name="login" className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            {presentTitle}
          </button>
        </div>
      </section>
    </aside>
  );
}
