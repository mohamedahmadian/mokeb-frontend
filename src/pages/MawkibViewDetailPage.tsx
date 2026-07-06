import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MawkibCapacityViewModal } from "../components/mawkibs/MawkibCapacityViewModal";
import { MawkibPublicDetail } from "../components/mawkibs/MawkibPublicDetail";
import { MawkibCardPrintButton } from "../components/mawkibs/MawkibCardPrintButton";
import { MawkibRulesPrintButton } from "../components/mawkibs/MawkibRulesPrintButton";
import { PageHeader } from "../components/ui/PageHeader";
import { NavIcon } from "../components/ui/NavIcons";
import {
  mawkibActionBtnPrimary,
  mawkibActionBtnViolet,
  mawkibActionIconClass,
} from "../lib/mawkib-action-buttons";
import { mawkibToCardData } from "../lib/mawkib-card";
import { mawkibToRulesPrintData } from "../lib/mawkib-rules-print";
import { btnSecondary } from "../lib/styles";
import { mawkibsApi } from "../lib/mawkibs";

export function MawkibViewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const mawkibId = Number(id);
  const [capacityOpen, setCapacityOpen] = useState(false);

  const {
    data: mawkib,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["mawkib-public-view", mawkibId],
    queryFn: () => mawkibsApi.getPublicOne(mawkibId),
    enabled: mawkibId > 0,
  });

  const openCapacity = () => setCapacityOpen(true);

  return (
    <div>
      <PageHeader title="جزئیات موکب" subtitle="نمایش اطلاعات موکب " />

      {isLoading && <p className="text-slate-500">در حال بارگذاری...</p>}

      {isError && !isLoading && (
        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
          <p className="text-red-600">موکب یافت نشد.</p>
          <Link to="/mawkibs/map" className={btnSecondary}>
            بازگشت به نقشه
          </Link>
        </div>
      )}

      {mawkib && (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={openCapacity}
              className={mawkibActionBtnViolet}
            >
              <NavIcon
                name="reports"
                className={mawkibActionIconClass}
                strokeWidth={1.75}
              />
              تقویم ظرفیت
            </button>
            <Link
              to={`/mawkibs/${mawkib.id}/rules`}
              className={mawkibActionBtnPrimary}
            >
              <NavIcon
                name="book"
                className={mawkibActionIconClass}
                strokeWidth={1.75}
              />
              قوانین
            </Link>
            <MawkibCardPrintButton
              data={mawkibToCardData(mawkib)}
              className={mawkibActionBtnPrimary}
            />
            <MawkibRulesPrintButton
              data={mawkibToRulesPrintData(mawkib)}
              className={mawkibActionBtnPrimary}
            />
          </div>
          <MawkibPublicDetail mawkib={mawkib} onViewCapacity={openCapacity} />
          <Link
            to="/mawkibs/map"
            className={`${btnSecondary} w-full sm:w-auto`}
          >
            بازگشت به جستجوی موکب ( نقشه )
          </Link>

          <MawkibCapacityViewModal
            open={capacityOpen}
            onClose={() => setCapacityOpen(false)}
            mawkibId={mawkib.id}
            mawkibName={mawkib.name}
            serviceStartDate={mawkib.serviceStartDate}
            serviceEndDate={mawkib.serviceEndDate}
          />
        </div>
      )}
    </div>
  );
}
