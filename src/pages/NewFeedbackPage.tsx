import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { SelectedMawkibSummary } from "../components/mawkib-feedback/SelectedMawkibSummary";
import { mawkibCityLabel } from "../lib/mawkib-locations";
import { mawkibFeedbackApi } from "../lib/mawkib-feedback";
import { mawkibsApi } from "../lib/mawkibs";
import { toast, toastApiError } from "../lib/toast";
import {
  btnPrimary,
  btnSecondary,
  filterInputClass,
  inputClass,
  panelCard,
  selectItemHover,
} from "../lib/styles";
import type { Mawkib } from "../types";

export function NewFeedbackPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [results, setResults] = useState<Mawkib[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Mawkib | null>(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      350,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setSearching(true);

    mawkibsApi
      .getPublicList({ q: debouncedSearch })
      .then((items) => {
        if (!cancelled) setResults(items.slice(0, 10));
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  const createMutation = useMutation({
    mutationFn: () =>
      mawkibFeedbackApi.create({
        mawkibId: selected!.id,
        content: content.trim(),
      }),
    onSuccess: () => {
      toast.success("انتقاد یا پیشنهاد شما با موفقیت ثبت شد");
      navigate("/feedback");
    },
    onError: (err) => {
      toastApiError(err, "خطا در ثبت");
    },
  });

  const canSubmit = !!selected && content.trim().length >= 10;

  return (
    <div>
      <PageHeader title="ثبت انتقاد یا پیشنهاد جدید" />

      <div className={`${panelCard} space-y-5 p-4 sm:p-6`}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            جستجو و انتخاب موکب
          </label>
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!e.target.value.trim()) setSelected(null);
            }}
            className={filterInputClass}
            placeholder="قسمتی از نام موکب یا شهر مورد نظر را وارد نمایید تا لیست موکب ها نمایش داده شود"
          />

          {search.trim().length >= 2 && !selected && (
            <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {searching ? (
                <p className="px-4 py-3 text-sm text-slate-500">
                  در حال جستجو...
                </p>
              ) : results.length === 0 ? (
                <p className="px-4 py-3 text-sm text-slate-400">
                  موکبی یافت نشد
                </p>
              ) : (
                <ul>
                  {results.map((mawkib) => (
                    <li key={mawkib.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(mawkib);
                          setSearch(mawkib.name);
                          setResults([]);
                        }}
                        className={`flex w-full flex-col gap-0.5 px-4 py-3 text-right text-sm ${selectItemHover}`}
                      >
                        <span className="font-medium text-slate-800">
                          {mawkib.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {mawkibCityLabel(mawkib.mawkibCity)} ·{" "}
                          {mawkib.phoneNumber}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {selected && (
            <SelectedMawkibSummary
              mawkib={selected}
              onChange={() => {
                setSelected(null);
                setSearch("");
              }}
            />
          )}
        </div>

        <label className="block text-sm">
          <span className="mb-2 block font-medium text-slate-700">
            متن انتقاد یا پیشنهاد
          </span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className={inputClass}
            placeholder="نظر خود را بنویسید (حداقل ۱۰ کاراکتر)..."
          />
          <span className="mt-1 block text-xs text-slate-400">
            {content.trim().length} / ۲۰۰۰
          </span>
        </label>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link to="/feedback" className={`${btnSecondary} text-center`}>
            انصراف
          </Link>
          <button
            type="button"
            disabled={!canSubmit || createMutation.isPending}
            onClick={() => createMutation.mutate()}
            className={`${btnPrimary} w-full sm:w-auto`}
          >
            {createMutation.isPending ? "در حال ثبت..." : "ثبت نظر"}
          </button>
        </div>
      </div>
    </div>
  );
}
