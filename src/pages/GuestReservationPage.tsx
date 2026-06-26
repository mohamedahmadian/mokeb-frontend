import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GuestPageHeader, GuestShell } from "../components/guest/GuestShell";
import { GuestReservationSuccessView } from "../components/reservations/GuestReservationSuccessView";
import {
  ReservationForm,
  type ReservationFormSuccess,
} from "../components/reservations/ReservationForm";
import { IconHome } from "../components/reservations/reservation-form-ui";

type GuestSuccess = Extract<ReservationFormSuccess, { variant: "guest" }>;

export function GuestReservationPage() {
  const [searchParams] = useSearchParams();
  const initialMawkibId = searchParams.get("mawkibId");
  const parsedMawkibId = initialMawkibId ? parseInt(initialMawkibId, 10) : null;
  const [success, setSuccess] = useState<GuestSuccess | null>(null);

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
      <GuestPageHeader icon={<IconHome />} title="رزرو موکب" />
      <ReservationForm
        variant="guest"
        initialMawkibId={parsedMawkibId}
        onSuccess={handleSuccess}
      />
    </GuestShell>
  );
}
