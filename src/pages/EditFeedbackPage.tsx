import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { SelectedMawkibSummary } from "../components/mawkib-feedback/SelectedMawkibSummary";
import { mawkibCityLabel } from "../lib/mawkib-locations";
import {
  canManageMawkibFeedback,
  mawkibFeedbackApi,
} from "../lib/mawkib-feedback";
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
import type { Mawkib, MawkibFeedback } from "../types";

function feedbackToMawkib(feedback: MawkibFeedback): Mawkib {
  return {
    id: feedback.mawkib.id,
    name: feedback.mawkib.name,
    address: "",
    phoneNumber: feedback.mawkib.phoneNumber,
    mawkibCity: feedback.mawkib.mawkibCity as Mawkib["mawkibCity"],
    maleCapacity: 0,
    femaleCapacity: 0,
    status: "Approved",
    owner: feedback.mawkib.owner,
  };
}

export function EditFeedbackPage() {
  const { id } = useParams<{ id: string }>();
  const feedbackId = Number(id);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [results, setResults] = useState<Mawkib[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Mawkib | null>(null);
  const [content, setContent] = useState("");
  const [initialized, setInitialized] = useState(false);

  const { data: feedback, isLoading, isError } = useQuery({
    queryKey: ["mawkib-feedback", feedbackId],
    queryFn: () => mawkibFeedbackApi.getById(feedbackId),
    enabled: Number.isFinite(feedbackId) && feedbackId > 0,
  });

  useEffect(() => {
    if (!feedback || initialized) return;
    setSelected(feedbackToMawkib(feedback));
    setSearch(feedback.mawkib.name);
    setContent(feedback.content);
    setInitialized(true);
  }, [feedback, initialized]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch.length < 2 || selected?.name === debouncedSearch) {
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
  }, [debouncedSearch, selected?.name]);

  const updateMutation = useMutation({
    mutationFn: () =>
      mawkibFeedbackApi.update(feedbackId, {
        mawkibId: selected!.id,
        content: content.trim(),
      }),
    onSuccess: () => {
      toast.success("انتقاد یا پیشنهاد با موفقیت ویرایش شد");
      navigate("/feedback");
    },
    onError: (err) => {
      toastApiError(err, "خطا در ویرایش");
    },
  });

  if (!Number.isFinite(feedbackId) || feedbackId <= 0) {
    return <Navigate to="/feedback" replace />;
  }

  if (isLoading || !initialized) {
    return <p className="text-slate-500">در حال بارگذاری...</p>;
  }

  if (isError || !feedback) {
    return <Navigate to="/feedback" replace />;
  }

  if (!canManageMawkibFeedback(feedback)) {
    return <Navigate to="/feedback" replace />;
  }

  const canSubmit = !!selected && content.trim().length >= 10;

  return (
    <div>
      <PageHeader title="ویرایش انتقاد یا پیشنهاد" />

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
            placeholder="نام موکب یا شهر را وارد کنید..."
          />

          {search.trim().length >= 2 && !selected && (
            <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {searching ? (
                <p className="px-4 py-3 text-sm text-slate-500">در حال جستجو...</p>
              ) : results.length === 0 ? (
                <p className="px-4 py-3 text-sm text-slate-400">موکبی یافت نشد</p>
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
                          {mawkibCityLabel(mawkib.mawkibCity)} · {mawkib.phoneNumber}
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
            disabled={!canSubmit || updateMutation.isPending}
            onClick={() => updateMutation.mutate()}
            className={`${btnPrimary} w-full sm:w-auto`}
          >
            {updateMutation.isPending ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </div>
      </div>
    </div>
  );
}
