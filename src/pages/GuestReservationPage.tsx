import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { GuestPageHeader, GuestShell } from "../components/guest/GuestShell";
import { GuestReservationSuccessView } from "../components/reservations/GuestReservationSuccessView";
import {
  ReservationForm,
  parseGuestReservationModeParam,
  type ReservationFormSuccess,
} from "../components/reservations/ReservationForm";
import { IconHome } from "../components/reservations/reservation-form-ui";
import { mawkibsApi } from "../lib/mawkibs";

type GuestSuccess = Extract<ReservationFormSuccess, { variant: "guest" }>;

export function GuestReservationPage() {
  const [searchParams] = useSearchParams();
  const initialMawkibId = searchParams.get("mawkibId");
  const parsedMawkibId = initialMawkibId ? parseInt(initialMawkibId, 10) : null;
  const initialReservationDate = searchParams.get("date")?.slice(0, 10) ?? null;
  const initialGuestReservationMode =
    parseGuestReservationModeParam(
      searchParams.get("mode") ?? searchParams.get("fast"),
    ) ?? "normal";
  const [success, setSuccess] = useState<GuestSuccess | null>(null);
  const [selectedMawkibName, setSelectedMawkibName] = useState<string | null>(
    null,
  );

  const { data: prefilledMawkib } = useQuery({
    queryKey: ["guest-reserve-mawkib", parsedMawkibId],
    queryFn: () => mawkibsApi.getPublicOne(parsedMawkibId!),
    enabled: parsedMawkibId != null && parsedMawkibId > 0,
    staleTime: 5 * 60_000,
  });

  const pageTitleMawkibName = selectedMawkibName ?? prefilledMawkib?.name ?? null;
  const pageTitle = pageTitleMawkibName
    ? `رزرو موکب (${pageTitleMawkibName})`
    : "رزرو موکب";

  const handleSuccess = (result: ReservationFormSuccess) => {
    if (result.variant !== "guest") return;
    setSuccess(result);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (success) {
    return <GuestReservationSuccessView success={success} />;
  }

  return (
    <GuestShell maxWidth="lg">
      <GuestPageHeader icon={<IconHome />} title={pageTitle} />
      <ReservationForm
        variant="guest"
        initialMawkibId={parsedMawkibId}
        initialReservationDate={initialReservationDate}
        initialGuestReservationMode={initialGuestReservationMode}
        onSelectedMawkibChange={(mawkib) =>
          setSelectedMawkibName(mawkib?.name ?? null)
        }
        onSuccess={handleSuccess}
      />
    </GuestShell>
  );
}
