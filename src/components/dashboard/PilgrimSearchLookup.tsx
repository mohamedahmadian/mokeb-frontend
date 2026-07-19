import { useRef, useState, type FormEvent } from "react";
import { NavIcon } from "../ui/NavIcons";
import { UserFormModal } from "../users/UserFormModal";
import { btnPrimary, inputClass } from "../../lib/styles";
import { toast, toastApiError } from "../../lib/toast";
import { formatPilgrimAddress } from "../../lib/url";
import {
  MIN_PILGRIM_SEARCH_LENGTH,
  usersApi,
  type UpdateUserPayload,
} from "../../lib/users";
import type { AdminUser } from "../../types";

const dashboardSearchCardClass =
  "w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm md:w-[346px] md:max-w-[346px]";

interface PilgrimSearchLookupProps {
  scope?: "mine" | "all";
}

function PilgrimResultRow({
  pilgrim,
  onEdit,
}: {
  pilgrim: AdminUser;
  onEdit: (pilgrim: AdminUser) => void;
}) {
  const address = formatPilgrimAddress(pilgrim);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5]">
              <NavIcon name="pilgrims" className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-800">
                {pilgrim.fullName}
              </p>
              <p
                className="mt-0.5 truncate text-[11px] text-slate-500"
                dir="ltr"
              >
                {pilgrim.mobileNumber}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          {pilgrim.nationalId ? (
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-2 py-1.5">
              <p className="text-[10px] text-slate-500">کد ملی</p>
              <p
                className="truncate text-xs font-semibold text-slate-800"
                dir="ltr"
              >
                {pilgrim.nationalId}
              </p>
            </div>
          ) : null}
          {pilgrim.carPlate ? (
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-2 py-1.5">
              <p className="text-[10px] text-slate-500">پلاک ماشین</p>
              <p
                className="truncate text-xs font-semibold text-slate-800"
                dir="ltr"
              >
                {pilgrim.carPlate}
              </p>
            </div>
          ) : null}
          {address !== "—" ? (
            <div className="col-span-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2 py-1.5">
              <p className="text-[10px] text-slate-500">آدرس</p>
              <p className="text-xs font-semibold leading-relaxed text-slate-800">
                {address}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => onEdit(pilgrim)}
            className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <NavIcon
              name="info"
              className="h-3.5 w-3.5 shrink-0"
              strokeWidth={1.75}
            />
            ویرایش زائر
          </button>
        </div>
      </div>
    </section>
  );
}

export function PilgrimSearchLookup({
  scope = "mine",
}: PilgrimSearchLookupProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AdminUser[]>([]);
  const [searched, setSearched] = useState(false);
  const [editingPilgrim, setEditingPilgrim] = useState<AdminUser | null>(null);

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_PILGRIM_SEARCH_LENGTH) {
      toast.error(
        `حداقل ${MIN_PILGRIM_SEARCH_LENGTH} کاراکتر برای جستجو وارد کنید`,
      );
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const response = await usersApi.searchDashboardPilgrims(trimmed, {
        scope,
        pageSize: 10,
      });
      setResults(response.items);
    } catch (err) {
      setResults([]);
      setSearched(true);
      toastApiError(err, "خطا در جستجوی زائر");
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void handleSearch();
  };

  const handlePilgrimUpdate = async (payload: UpdateUserPayload) => {
    if (!editingPilgrim) return;
    const updated = await usersApi.update(editingPilgrim.id, payload);
    setResults((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
    setEditingPilgrim(null);
    toast.success("اطلاعات زائر به‌روزرسانی شد");
  };

  return (
    <>
      <div className="space-y-3">
        <section className={dashboardSearchCardClass}>
          <form onSubmit={handleSubmit} className="space-y-2 p-2.5 sm:p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8eef6] text-[#4a6fa5]">
                <NavIcon
                  name="pilgrims"
                  className="h-4 w-4"
                  strokeWidth={1.75}
                />
              </span>
              <h2 className="text-sm font-semibold text-slate-800">
                جستجوی زائر
              </h2>
            </div>

            <div className="flex flex-col gap-1.5 sm:flex-row">
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  if (searched) {
                    setResults([]);
                    setSearched(false);
                  }
                }}
                className={`${inputClass} min-w-0 flex-1 !min-h-9 !py-2 text-right !text-sm`}
                placeholder="نام، موبایل، کد ملی، پلاک"
                dir="auto"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={loading}
                className={`${btnPrimary} inline-flex shrink-0 items-center justify-center gap-1 !min-h-9 !px-3 !py-2 !text-xs sm:min-w-[5.5rem]`}
              >
                <NavIcon
                  name="track"
                  className="h-3.5 w-3.5"
                  strokeWidth={1.75}
                />
                {loading ? "..." : "جستجو"}
              </button>
            </div>

            <div
              className="flex items-center gap-1.5 text-[11px] text-transparent pointer-events-none select-none"
              aria-hidden
            >
              <span className="inline-block h-3.5 w-3.5 shrink-0" />
              <span>جستجوی عین عبارت وارد شده</span>
            </div>
          </form>

          {searched && !loading && results.length === 0 && (
            <div className="flex items-center gap-2 border-t border-slate-100 px-2.5 py-2 text-[11px] text-slate-500 sm:px-3">
              <NavIcon
                name="pilgrims"
                className="h-3.5 w-3.5 shrink-0 text-slate-400"
              />
              <span>زائری با این مشخصات یافت نشد.</span>
            </div>
          )}
        </section>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((pilgrim) => (
              <PilgrimResultRow
                key={pilgrim.id}
                pilgrim={pilgrim}
                onEdit={setEditingPilgrim}
              />
            ))}
          </div>
        )}
      </div>

      <UserFormModal
        open={editingPilgrim !== null}
        onClose={() => setEditingPilgrim(null)}
        onSubmit={handlePilgrimUpdate}
        user={editingPilgrim}
        fixedRole="Pilgrim"
        title="ویرایش زائر"
        hideRoles
      />
    </>
  );
}
