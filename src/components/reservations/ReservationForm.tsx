import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PersianDateInput, formatPersianDate } from "../ui/PersianDateInput";
import { formatPersianDateRange } from "../ui/PersianDateRangePicker";
import {
  formatPersianNumber,
  mawkibAvailableFemale,
  mawkibAvailableMale,
} from "../../lib/capacity";
import {
  alignReservationEndToMawkibLimits,
  buildReservationOccupiedDates,
  defaultReservationEndDate,
  effectiveDefaultReservationDays,
  effectiveMaxReservationDays,
  effectiveStayStartDate,
  isOnOrAfterServiceStart,
  isWithinMaxReservationDays,
  reservationStayDayCount,
} from "../../lib/date-range";
import { toast, toastApiError } from "../../lib/toast";
import { reservationStayAlignAlertMessage } from "../../lib/reservation-stay-align";
import { guestApi } from "../../lib/guest";
import { buildReservationFromGuestSuccess } from "../../lib/guest-success-reservation";
import { downloadPilgrimCardForReservation } from "../../lib/pilgrim-card-auto-download";
import { mawkibsApi } from "../../lib/mawkibs";
import { reservationsApi } from "../../lib/reservations";
import { usersApi, type PilgrimOption } from "../../lib/users";
import { useAuth } from "../../contexts/AuthContext";
import type { Mawkib, UserGender } from "../../types";
import { guestTheme } from "../../lib/guest-theme";
import {
  DEFAULT_CHECK_IN_TIME,
  DEFAULT_CHECK_OUT_TIME,
} from "../../lib/format-time";
import { btnSecondary } from "../../lib/styles";
import { PilgrimSearchSelect } from "./PilgrimSearchSelect";
import { PilgrimInfoCard } from "./PilgrimInfoCard";
import { CompanionsTable } from "./CompanionsTable";
import {
  buildCompanionMembers,
  createEmptyCompanionsForm,
  serializeCompanions,
  type CompanionsFormState,
} from "../../lib/companions";
import { splitFullName } from "../../lib/full-name";
import { hasValidCoords } from "../../lib/geo";
import {
  isMawkibOnlineReservationEnabled,
  isRestrictedOnlineReserver,
} from "../../lib/mawkib-online-reservation";
import {
  GuestCountStepper,
  GuestCountQuickPick,
  StayDurationQuickPick,
  NoFemaleAcceptanceHint,
  IconCalendar,
  IconChat,
  IconHome,
  IconUser,
  IconUsers,
  MawkibCard,
  MawkibInfoCard,
  MawkibGuestGalleryDetailsFooter,
  MawkibGuestGalleryButton,
  MawkibGuestMapButton,
  SectionHeader,
  reservationFormInputClass,
  StayDateAlignAlert,
  todayDateString,
} from "./reservation-form-ui";
import {
  hasMawkibRules,
  MawkibRulesAcceptanceModal,
} from "./MawkibRulesAcceptanceModal";
import { GuestReservationModeToggle } from "../guest/GuestReservationModeToggle";
import type { GuestReservationMode } from "../guest/GuestReservationModeToggle";
import { GuestReservationPersonalFields } from "./GuestReservationPersonalFields";
import { PanelNewPilgrimFields, PanelNewPilgrimOptionalFields, PANEL_OPTIONAL_FIELDS_COLLAPSE_LABEL } from "./PanelNewPilgrimFields";
import { CollapsibleSection } from "../ui/CollapsibleSection";
import {
  MawkibGalleryModal,
  mawkibGalleryUrls,
} from "../mawkibs/MawkibGalleryModal";
import { MawkibPublicDetailModal } from "../mawkibs/MawkibPublicDetailModal";

type PilgrimMode = "select" | "new";

export type GuestReservationSuccessMawkibSnapshot = {
  id: number;
  name: string;
  address?: string;
  phoneNumber?: string;
  imageUrl?: string | null;
  owner?: { fullName: string; mobileNumber?: string };
};

export type ReservationFormSuccess =
  | {
      variant: "guest";
      message: string;
      mawkibName: string;
      reservationDate: string;
      reservationEndDate: string;
      maleGuestCount: number;
      femaleGuestCount: number;
      trackingCode: string;
      mobileNumber: string;
      loginPasswordHint: string;
      fullName: string;
      mawkibId: number;
      reservationId: number;
      guestReservationMode: GuestReservationMode;
      mawkibSnapshot?: GuestReservationSuccessMawkibSnapshot;
      companions?: string;
    }
  | {
      variant: "panel";
      reservationId: number;
    };

export interface ReservationFormProps {
  variant: "guest" | "panel";
  initialMawkibId?: number | null;
  initialReservationDate?: string | null;
  initialPilgrimUserId?: number | null;
  initialGuestReservationMode?: GuestReservationMode;
  onSuccess: (result: ReservationFormSuccess) => void;
  onCancel?: () => void;
  onSelectedMawkibChange?: (
    mawkib: { id: number; name: string } | null,
  ) => void;
}

function parseInitialMawkibId(value: number | null | undefined) {
  if (value == null) return null;
  return Number.isNaN(value) ? null : value;
}

function parseInitialReservationDate(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

function mawkibMatchesNameQuery(name: string, query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return true;
  return name.includes(trimmed);
}

export function parseGuestReservationModeParam(
  value: string | null | undefined,
): GuestReservationMode | undefined {
  if (value == null || value.trim() === "") return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === "1" || normalized === "true" || normalized === "fast") {
    return "fast";
  }
  if (normalized === "0" || normalized === "false" || normalized === "normal") {
    return "normal";
  }
  return undefined;
}

export function ReservationForm({
  variant,
  initialMawkibId,
  initialReservationDate,
  initialPilgrimUserId,
  initialGuestReservationMode,
  onSuccess,
  onCancel,
  onSelectedMawkibChange,
}: ReservationFormProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isPanel = variant === "panel";
  const isAdmin = isPanel && (user?.roles.includes("Admin") ?? false);
  const isMawkibOwner =
    isPanel && (user?.roles.includes("MawkibOwner") ?? false);
  const isPilgrim =
    isPanel &&
    (user?.roles.includes("Pilgrim") ?? false) &&
    !isAdmin &&
    !isMawkibOwner;
  const canManagePilgrim = isPanel && !isPilgrim;
  const canSetCustomTrackingCode =
    isPanel && (isAdmin || isMawkibOwner) && canManagePilgrim;

  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [gender, setGender] = useState<UserGender | "">("");
  const [birthDate, setBirthDate] = useState("");
  const [country, setCountry] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [password, setPassword] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [nationalIdCardImageUrl, setNationalIdCardImageUrl] = useState<
    string | null
  >(null);
  const today = todayDateString();
  const initialDate =
    parseInitialReservationDate(initialReservationDate) ?? today;
  const [dateStart, setDateStart] = useState(initialDate);
  const [dateEnd, setDateEnd] = useState(() =>
    defaultReservationEndDate(initialDate, 1),
  );
  const [stayDateAlignAlert, setStayDateAlignAlert] = useState<string | null>(
    null,
  );
  const [maleGuestCount, setMaleGuestCount] = useState(1);
  const [femaleGuestCount, setFemaleGuestCount] = useState(0);
  const [selectedMawkibId, setSelectedMawkibId] = useState<number | null>(() =>
    parseInitialMawkibId(initialMawkibId ?? null),
  );
  const [companionsForm, setCompanionsForm] = useState<CompanionsFormState>(
    () => createEmptyCompanionsForm(1, 0),
  );
  const [description, setDescription] = useState("");
  const [travelOrigin, setTravelOrigin] = useState("");
  const [plannedCheckInTime, setPlannedCheckInTime] = useState(
    DEFAULT_CHECK_IN_TIME,
  );
  const [plannedCheckOutTime, setPlannedCheckOutTime] = useState(
    DEFAULT_CHECK_OUT_TIME,
  );
  const [submitting, setSubmitting] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [skipCapacityCheck, setSkipCapacityCheck] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [mawkibSearchQuery, setMawkibSearchQuery] = useState("");
  const [galleryMawkib, setGalleryMawkib] = useState<Mawkib | null>(null);
  const [detailMawkib, setDetailMawkib] = useState<Mawkib | null>(null);
  const [guestReservationMode, setGuestReservationMode] =
    useState<GuestReservationMode>(initialGuestReservationMode ?? "normal");

  const isGuestFastMode =
    variant === "guest" && guestReservationMode === "fast";

  const [pilgrimMode, setPilgrimMode] = useState<PilgrimMode>(() =>
    initialPilgrimUserId ? "select" : "new",
  );
  const [selectedPilgrim, setSelectedPilgrim] = useState<PilgrimOption | null>(
    null,
  );
  const preselectedMawkibId = useMemo(
    () => parseInitialMawkibId(initialMawkibId ?? null),
    [initialMawkibId],
  );

  const isGuestOpenReserve =
    variant === "guest" && preselectedMawkibId == null;

  const preselectedDatesBootstrappedRef = useRef(false);
  const guestFastDatesBootstrappedRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (initialMawkibId != null) {
      setSelectedMawkibId(parseInitialMawkibId(initialMawkibId));
    }
  }, [initialMawkibId]);

  useEffect(() => {
    setMawkibSearchQuery("");
  }, [dateStart, dateEnd, maleGuestCount, femaleGuestCount, skipCapacityCheck]);

  useEffect(() => {
    if (!initialPilgrimUserId || !canManagePilgrim) return;
    const pilgrimId = Number(initialPilgrimUserId);
    if (!pilgrimId) return;

    usersApi
      .getOne(pilgrimId)
      .then((pilgrimUser) => {
        setSelectedPilgrim({
          id: pilgrimUser.id,
          fullName: pilgrimUser.fullName,
          mobileNumber: pilgrimUser.mobileNumber,
          city: pilgrimUser.city,
        });
        setPilgrimMode("select");
      })
      .catch(() => {});
  }, [initialPilgrimUserId, canManagePilgrim]);

  useEffect(() => {
    if (initialPilgrimUserId || !isPilgrim || !user) return;
    setSelectedPilgrim({
      id: user.id,
      fullName: user.fullName,
      mobileNumber: user.mobileNumber,
    });
    setPilgrimMode("select");
  }, [initialPilgrimUserId, isPilgrim, user]);

  const canBypassCapacity = isPanel && (isAdmin || isMawkibOwner);
  const restrictedOnlineReserver = isRestrictedOnlineReserver(
    isPanel,
    user?.roles,
  );

  const { data: preselectedMawkibDetail } = useQuery({
    queryKey: ["mawkib", "preselected", preselectedMawkibId, variant],
    queryFn: () =>
      variant === "guest"
        ? mawkibsApi.getPublicOne(preselectedMawkibId!)
        : mawkibsApi.getOne(preselectedMawkibId!),
    enabled: preselectedMawkibId != null && preselectedMawkibId > 0,
  });

  const effectiveFemaleGuestCountForFilter = useMemo(() => {
    if (preselectedMawkibId != null) {
      if (!preselectedMawkibDetail) return 0;
      if (preselectedMawkibDetail.femaleCapacity <= 0) return 0;
    }
    return femaleGuestCount;
  }, [preselectedMawkibId, preselectedMawkibDetail, femaleGuestCount]);

  const mawkibFilters =
    canBypassCapacity && skipCapacityCheck
      ? {
          reservationDateFrom: dateStart,
          reservationDateTo: dateEnd,
        }
      : {
          reservationDateFrom: dateStart,
          reservationDateTo: dateEnd,
          hasAvailability: true,
          minAvailableMaleCapacity: maleGuestCount,
          minAvailableFemaleCapacity: effectiveFemaleGuestCountForFilter,
        };

  const mawkibQueryKey = isPanel
    ? isMawkibOwner
      ? "mawkibs-my-reservation-form"
      : "mawkibs-public-reservation-form"
    : "guest-mawkibs-reservation-form";

  const {
    data: mawkibs = [],
    isLoading: mawkibsLoading,
    isError: mawkibsError,
  } = useQuery({
    queryKey: [
      mawkibQueryKey,
      dateStart,
      dateEnd,
      maleGuestCount,
      effectiveFemaleGuestCountForFilter,
      skipCapacityCheck,
      isMawkibOwner ? user?.id : null,
    ],
    queryFn: () => {
      if (isPanel && isMawkibOwner) {
        return mawkibsApi
          .getMyList(mawkibFilters)
          .then((list) => list.filter((m) => m.status === "Approved"));
      }
      return mawkibsApi.getPublicList(mawkibFilters);
    },
    enabled:
      !!dateStart &&
      !!dateEnd &&
      maleGuestCount + effectiveFemaleGuestCountForFilter >= 1,
  });

  const { data: selectedMawkibDetail } = useQuery({
    queryKey: ["mawkib", selectedMawkibId, variant],
    queryFn: () =>
      variant === "guest"
        ? mawkibsApi.getPublicOne(selectedMawkibId!)
        : mawkibsApi.getOne(selectedMawkibId!),
    enabled:
      !!selectedMawkibId &&
      selectedMawkibId > 0 &&
      selectedMawkibId !== preselectedMawkibId,
  });

  const showFemaleGuestCount = useMemo(() => {
    if (preselectedMawkibId != null) {
      if (!preselectedMawkibDetail) return false;
      return preselectedMawkibDetail.femaleCapacity > 0;
    }
    if (selectedMawkibId != null) {
      const mawkib =
        mawkibs.find((m) => m.id === selectedMawkibId) ??
        (selectedMawkibDetail?.id === selectedMawkibId
          ? selectedMawkibDetail
          : null);
      if (mawkib) return mawkib.femaleCapacity > 0;
    }
    return true;
  }, [
    preselectedMawkibId,
    preselectedMawkibDetail,
    selectedMawkibId,
    mawkibs,
    selectedMawkibDetail,
  ]);

  const effectiveFemaleGuestCount = showFemaleGuestCount ? femaleGuestCount : 0;

  const guestCountGridClass = "grid grid-cols-1 gap-4 sm:grid-cols-2";

  useEffect(() => {
    if (!showFemaleGuestCount) {
      setFemaleGuestCount(0);
    }
  }, [showFemaleGuestCount]);

  useEffect(() => {
    if (!isGuestFastMode) return;
    setCompanionsForm(
      createEmptyCompanionsForm(maleGuestCount, effectiveFemaleGuestCount),
    );
  }, [isGuestFastMode, maleGuestCount, effectiveFemaleGuestCount]);

  const reservableMawkibs = restrictedOnlineReserver
    ? mawkibs.filter((m) => isMawkibOnlineReservationEnabled(m))
    : mawkibs;

  const hasAvailableMawkibs = !mawkibsError && reservableMawkibs.length > 0;
  const capacityBlocksSubmit = !skipCapacityCheck && !hasAvailableMawkibs;

  const displayedMawkibs = useMemo(() => {
    if (!mawkibSearchQuery.trim()) return mawkibs;
    return mawkibs.filter((m) =>
      mawkibMatchesNameQuery(m.name, mawkibSearchQuery),
    );
  }, [mawkibs, mawkibSearchQuery]);

  const guestPreselectedMawkib =
    variant === "guest" && preselectedMawkibId && preselectedMawkibDetail
      ? preselectedMawkibDetail
      : null;

  const mawkibsForSelection = useMemo(() => {
    if (guestPreselectedMawkib) {
      const inList = mawkibs.find((m) => m.id === guestPreselectedMawkib.id);
      return inList ? [inList] : [guestPreselectedMawkib];
    }
    return displayedMawkibs;
  }, [guestPreselectedMawkib, mawkibs, displayedMawkibs]);

  const hideMawkibPicker = Boolean(guestPreselectedMawkib);

  const mawkibSectionSubtitle = useMemo(() => {
    if (skipCapacityCheck && canBypassCapacity) {
      return "همه موکب‌های در دسترس نمایش داده می‌شوند؛ ظرفیت در این حالت بررسی نمی‌شود";
    }
    const guestTotal = maleGuestCount + effectiveFemaleGuestCount;
    if (!dateStart || !dateEnd) {
      return `— برای ${formatPersianNumber(guestTotal)} نفر`;
    }
    return `${formatPersianDateRange(dateStart, dateEnd)} برای ${formatPersianNumber(guestTotal)} نفر`;
  }, [
    skipCapacityCheck,
    canBypassCapacity,
    dateStart,
    dateEnd,
    maleGuestCount,
    effectiveFemaleGuestCount,
  ]);

  const staySectionSubtitle = useMemo(() => {
    const guestTotal = maleGuestCount + effectiveFemaleGuestCount;
    if (!dateStart || !dateEnd) {
      return `— برای ${formatPersianNumber(guestTotal)} نفر`;
    }
    const rangeLabel = formatPersianDateRange(dateStart, dateEnd);
    return `${rangeLabel} برای ${formatPersianNumber(guestTotal)} نفر`;
  }, [dateStart, dateEnd, maleGuestCount, effectiveFemaleGuestCount]);

  const minimumEndDate = useMemo(
    () => (dateStart ? defaultReservationEndDate(dateStart, 1) : today),
    [dateStart, today],
  );

  const selectedMawkib = useMemo(() => {
    if (!selectedMawkibId) return undefined;
    const fromList = mawkibs.find((m) => m.id === selectedMawkibId);
    if (fromList) return fromList;
    if (guestPreselectedMawkib?.id === selectedMawkibId) {
      return guestPreselectedMawkib;
    }
    if (preselectedMawkibDetail?.id === selectedMawkibId) {
      return preselectedMawkibDetail;
    }
    if (selectedMawkibDetail?.id === selectedMawkibId) {
      return selectedMawkibDetail;
    }
    return undefined;
  }, [
    selectedMawkibId,
    mawkibs,
    guestPreselectedMawkib,
    preselectedMawkibDetail,
    selectedMawkibDetail,
  ]);

  useEffect(() => {
    if (!isGuestFastMode) return;
    if (guestFastDatesBootstrappedRef.current) return;
    if (preselectedMawkibId && !preselectedMawkibDetail) return;

    const start = today;
    const mawkib =
      selectedMawkib ??
      (preselectedMawkibId ? preselectedMawkibDetail : undefined);

    setDateStart(start);
    setDateEnd(
      defaultReservationEndDate(start, mawkib?.defaultReservationDays ?? 1),
    );
    guestFastDatesBootstrappedRef.current = true;
  }, [
    isGuestFastMode,
    today,
    selectedMawkib,
    preselectedMawkibId,
    preselectedMawkibDetail,
  ]);

  const activeMawkibIdForCapacity = preselectedMawkibId ?? selectedMawkibId;

  const stayDateRange = useMemo(() => {
    if (!dateStart || !dateEnd || dateEnd < dateStart) return [];
    return buildReservationOccupiedDates(dateStart, dateEnd);
  }, [dateStart, dateEnd]);

  const stayInventoryEndDate =
    stayDateRange.length > 0
      ? stayDateRange[stayDateRange.length - 1]
      : "";

  const capacityCheckEnabled = !(canBypassCapacity && skipCapacityCheck);

  const shouldFetchStayCapacity =
    capacityCheckEnabled &&
    activeMawkibIdForCapacity != null &&
    activeMawkibIdForCapacity > 0 &&
    stayDateRange.length > 0 &&
    !!dateStart &&
    !!stayInventoryEndDate;

  const { data: stayInventory } = useQuery({
    queryKey: [
      "mawkib-inventory",
      "reservation-form-stay",
      activeMawkibIdForCapacity,
      dateStart,
      stayInventoryEndDate,
      variant,
    ],
    queryFn: () =>
      variant === "guest"
        ? mawkibsApi.getPublicInventory(
            activeMawkibIdForCapacity!,
            dateStart,
            stayInventoryEndDate,
          )
        : mawkibsApi.getInventory(
            activeMawkibIdForCapacity!,
            dateStart,
            stayInventoryEndDate,
          ),
    enabled: shouldFetchStayCapacity,
  });

  const stayCapacityReady =
    shouldFetchStayCapacity &&
    stayInventory != null &&
    stayInventory.days.length === stayDateRange.length;

  const capacityMawkibMeta =
    selectedMawkib ?? preselectedMawkibDetail ?? guestPreselectedMawkib;

  const listMawkibForCapacity = activeMawkibIdForCapacity
    ? mawkibs.find((m) => m.id === activeMawkibIdForCapacity)
    : undefined;

  const rangeAvailableMale = stayCapacityReady
    ? Math.min(...stayInventory!.days.map((day) => day.availableMale))
    : listMawkibForCapacity
      ? mawkibAvailableMale(listMawkibForCapacity)
      : undefined;

  const rangeAvailableFemale = stayCapacityReady
    ? Math.min(...stayInventory!.days.map((day) => day.availableFemale))
    : listMawkibForCapacity
      ? mawkibAvailableFemale(listMawkibForCapacity)
      : undefined;

  const isMaleCapacityFull =
    capacityCheckEnabled &&
    !!capacityMawkibMeta &&
    capacityMawkibMeta.maleCapacity > 0 &&
    rangeAvailableMale !== undefined &&
    rangeAvailableMale <= 0;

  const isFemaleCapacityFull =
    capacityCheckEnabled &&
    !!capacityMawkibMeta &&
    capacityMawkibMeta.femaleCapacity > 0 &&
    rangeAvailableFemale !== undefined &&
    rangeAvailableFemale <= 0;

  useEffect(() => {
    if (isMaleCapacityFull) {
      setMaleGuestCount(0);
    }
  }, [isMaleCapacityFull]);

  useEffect(() => {
    if (isFemaleCapacityFull) {
      setFemaleGuestCount(0);
    }
  }, [isFemaleCapacityFull]);

  const bypassCapacityLimits = skipCapacityCheck && canBypassCapacity;

  const minReservationDays = effectiveDefaultReservationDays(
    capacityMawkibMeta?.defaultReservationDays ?? selectedMawkib?.defaultReservationDays,
  );
  const maxReservationDays = effectiveMaxReservationDays(
    capacityMawkibMeta?.maxReservationDays ?? selectedMawkib?.maxReservationDays,
  );

  const stayDays = reservationStayDayCount(dateStart, dateEnd);

  const effectiveStart = useMemo(
    () =>
      effectiveStayStartDate(
        today,
        capacityMawkibMeta?.serviceStartDate ?? selectedMawkib?.serviceStartDate,
      ),
    [
      today,
      capacityMawkibMeta?.serviceStartDate,
      selectedMawkib?.serviceStartDate,
    ],
  );

  const clampEndDate = (start: string, end: string) => {
    const mawkib = capacityMawkibMeta ?? selectedMawkib;
    if (!mawkib) return end;
    const result = alignReservationEndToMawkibLimits(
      start,
      end,
      mawkib.defaultReservationDays,
      mawkib.maxReservationDays,
    );
    const message = reservationStayAlignAlertMessage(result);
    if (message) setStayDateAlignAlert(message);
    return result.endDate;
  };

  const handleQuickPickMale = () => {
    setFemaleGuestCount(0);
    setMaleGuestCount((current) => {
      const next = current + 1;
      if (
        !bypassCapacityLimits &&
        rangeAvailableMale !== undefined &&
        next > rangeAvailableMale
      ) {
        return current > 0 ? current : Math.min(1, rangeAvailableMale);
      }
      return next;
    });
  };

  const handleQuickPickFemale = () => {
    setMaleGuestCount(0);
    setFemaleGuestCount((current) => {
      const next = current + 1;
      if (
        !bypassCapacityLimits &&
        rangeAvailableFemale !== undefined &&
        next > rangeAvailableFemale
      ) {
        return current > 0 ? current : Math.min(1, rangeAvailableFemale);
      }
      return next;
    });
  };

  const maleQuickPickActive = maleGuestCount > 0 && femaleGuestCount === 0;
  const femaleQuickPickActive = femaleGuestCount > 0 && maleGuestCount === 0;

  const hideMaleQuickPick =
    capacityMawkibMeta != null && capacityMawkibMeta.maleCapacity <= 0;
  const hideFemaleQuickPick =
    !showFemaleGuestCount ||
    (capacityMawkibMeta != null && capacityMawkibMeta.femaleCapacity <= 0);

  const maleQuickPickDisabled =
    hideMaleQuickPick ||
    (!bypassCapacityLimits &&
      rangeAvailableMale !== undefined &&
      (rangeAvailableMale <= 0 ||
        (maleQuickPickActive && maleGuestCount >= rangeAvailableMale)));

  const femaleQuickPickDisabled =
    hideFemaleQuickPick ||
    (!bypassCapacityLimits &&
      rangeAvailableFemale !== undefined &&
      (rangeAvailableFemale <= 0 ||
        (femaleQuickPickActive && femaleGuestCount >= rangeAvailableFemale)));

  const showGuestCountQuickPick =
    showFemaleGuestCount && !hideMaleQuickPick && !hideFemaleQuickPick;

  const handleStayDurationPick = (days: number) => {
    setStayDateAlignAlert(null);
    const start = effectiveStart;
    const end = clampEndDate(start, defaultReservationEndDate(start, days));
    setDateStart(start);
    setDateEnd(end);
    if (!preselectedMawkibId) {
      setSelectedMawkibId(null);
    }
  };

  const isStayDurationActive = (days: number) =>
    dateStart === effectiveStart && stayDays === days;

  const isStayDurationDisabled = (days: number) =>
    days < minReservationDays || days > maxReservationDays;

  const selectedMawkibBlocked =
    !!selectedMawkib &&
    restrictedOnlineReserver &&
    !isMawkibOnlineReservationEnabled(selectedMawkib);

  useEffect(() => {
    if (!preselectedMawkibId || !preselectedMawkibDetail) return;
    if (preselectedMawkibDetail.id !== preselectedMawkibId) return;
    if (preselectedDatesBootstrappedRef.current) return;

    const startDate =
      parseInitialReservationDate(initialReservationDate) ?? today;

    setDateStart(startDate);
    setDateEnd(
      defaultReservationEndDate(
        startDate,
        preselectedMawkibDetail.defaultReservationDays,
      ),
    );
    preselectedDatesBootstrappedRef.current = true;
  }, [
    preselectedMawkibId,
    preselectedMawkibDetail,
    initialReservationDate,
    today,
  ]);

  const mawkibStayDefaultsAppliedForIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!selectedMawkibId) {
      mawkibStayDefaultsAppliedForIdRef.current = null;
    }
  }, [selectedMawkibId]);

  useEffect(() => {
    if (mawkibsLoading || mawkibsError) return;

    const pool = restrictedOnlineReserver
      ? mawkibs.filter((m) => isMawkibOnlineReservationEnabled(m))
      : mawkibs;

    if (pool.length === 1 && !isGuestOpenReserve) {
      const sole = pool[0];
      setSelectedMawkibId((current) =>
        current === sole.id ? current : sole.id,
      );
      if (
        !isGuestFastMode &&
        !isGuestOpenReserve &&
        mawkibStayDefaultsAppliedForIdRef.current !== sole.id
      ) {
        const result = alignReservationEndToMawkibLimits(
          dateStart,
          dateEnd,
          sole.defaultReservationDays,
          sole.maxReservationDays,
        );
        if (result.adjusted && result.limitDays != null) {
          const message = reservationStayAlignAlertMessage(result);
          if (message) setStayDateAlignAlert(message);
          setDateEnd(result.endDate);
        }
        mawkibStayDefaultsAppliedForIdRef.current = sole.id;
      }
      return;
    }

    setSelectedMawkibId((current) => {
      if (preselectedMawkibId) return preselectedMawkibId;
      if (current && !pool.some((m) => m.id === current)) return null;
      return current;
    });
  }, [
    mawkibs,
    mawkibsLoading,
    mawkibsError,
    restrictedOnlineReserver,
    isGuestFastMode,
    isGuestOpenReserve,
    dateStart,
    dateEnd,
    today,
  ]);

  useEffect(() => {
    const mawkibDetail =
      selectedMawkibId === preselectedMawkibId
        ? preselectedMawkibDetail
        : selectedMawkibDetail;
    if (!selectedMawkibId || !mawkibDetail) return;

    setPlannedCheckInTime(
      mawkibDetail.defaultCheckInTime ?? DEFAULT_CHECK_IN_TIME,
    );
    setPlannedCheckOutTime(
      mawkibDetail.defaultCheckOutTime ?? DEFAULT_CHECK_OUT_TIME,
    );
  }, [
    selectedMawkibId,
    preselectedMawkibId,
    preselectedMawkibDetail,
    selectedMawkibDetail,
  ]);

  useEffect(() => {
    setRulesModalOpen(false);
  }, [selectedMawkibId]);

  useEffect(() => {
    onSelectedMawkibChange?.(
      selectedMawkib
        ? { id: selectedMawkib.id, name: selectedMawkib.name }
        : null,
    );
  }, [selectedMawkib, onSelectedMawkibChange]);

  useEffect(() => {
    setCompanionsForm((prev) => ({
      ...prev,
      members: buildCompanionMembers(
        maleGuestCount,
        effectiveFemaleGuestCount,
        prev.members,
      ),
    }));
  }, [maleGuestCount, effectiveFemaleGuestCount]);

  const togglePilgrimMode = () => {
    setPilgrimMode((mode) => (mode === "select" ? "new" : "select"));
  };

  const validateGuestPersonalInfo = () => {
    if (!fullName.trim()) {
      toast.error("نام و نام خانوادگی را وارد کنید");
      return false;
    }
    if (!mobileNumber.trim()) {
      toast.error("شماره موبایل را وارد کنید");
      return false;
    }
    return true;
  };

  const validatePanelPilgrim = async (): Promise<{
    pilgrimUserId: number;
    pilgrimMobile: string;
  } | null> => {
    if (isPilgrim && user) {
      return { pilgrimUserId: user.id, pilgrimMobile: user.mobileNumber };
    }

    if (pilgrimMode === "select") {
      if (!selectedPilgrim) {
        toast.error("لطفاً زائر را انتخاب کنید");
        return null;
      }
      return {
        pilgrimUserId: selectedPilgrim.id,
        pilgrimMobile: selectedPilgrim.mobileNumber,
      };
    }

    if (!fullName.trim()) {
      toast.error("نام و نام خانوادگی زائر را وارد کنید");
      return null;
    }
    if (!mobileNumber.trim()) {
      toast.error("شماره موبایل زائر را وارد کنید");
      return null;
    }

    const { firstName, lastName } = splitFullName(fullName);

    const pilgrimUser = await usersApi.createQuickPilgrim({
      firstName,
      lastName,
      mobileNumber: mobileNumber.trim(),
      nationalId: nationalId.trim() || undefined,
      province: province.trim() || undefined,
      city: city.trim() || undefined,
      gender: gender || undefined,
      birthDate: birthDate || undefined,
      country: country.trim() || undefined,
      passportNumber: passportNumber.trim() || undefined,
      nationalIdCardImageUrl: nationalIdCardImageUrl ?? undefined,
      password: password.trim() || undefined,
    });

    return {
      pilgrimUserId: pilgrimUser.id,
      pilgrimMobile: pilgrimUser.mobileNumber,
    };
  };

  const performSubmit = async () => {
    setSubmitting(true);

    try {
      if (variant === "guest") {
        const trimmedPassword = password.trim();
        const trimmedMobile = mobileNumber.trim();
        const loginPasswordHint =
          trimmedPassword || trimmedMobile.replace(/\D/g, "").slice(-4);
        const { firstName, lastName } = splitFullName(fullName);

        const companionsPayload = isGuestFastMode
          ? undefined
          : serializeCompanions(companionsForm);

        const result = await guestApi.createReservation({
          firstName,
          lastName,
          mobileNumber: trimmedMobile,
          password: isGuestFastMode ? undefined : trimmedPassword || undefined,
          province: isGuestFastMode ? undefined : province.trim() || undefined,
          city: isGuestFastMode ? undefined : city.trim() || undefined,
          nationalId: nationalId.trim() || undefined,
          nationalIdCardImageUrl: isGuestFastMode
            ? undefined
            : (nationalIdCardImageUrl ?? undefined),
          gender: isGuestFastMode ? undefined : gender || undefined,
          birthDate: isGuestFastMode ? undefined : birthDate || undefined,
          country: isGuestFastMode ? undefined : country.trim() || undefined,
          passportNumber: isGuestFastMode
            ? undefined
            : passportNumber.trim() || undefined,
          mawkibId: selectedMawkibId!,
          reservationDate: dateStart,
          reservationEndDate: dateEnd,
          maleGuestCount,
          femaleGuestCount: effectiveFemaleGuestCount,
          companions: companionsPayload,
          description: isGuestFastMode
            ? undefined
            : description.trim() || undefined,
          travelOrigin: isGuestFastMode
            ? undefined
            : travelOrigin.trim() || undefined,
          plannedCheckInTime: isGuestFastMode
            ? undefined
            : plannedCheckInTime || undefined,
          plannedCheckOutTime: isGuestFastMode
            ? undefined
            : plannedCheckOutTime || undefined,
        });

        setRulesModalOpen(false);
        const mawkibForSnapshot = selectedMawkib;
        const guestSuccessPayload: Extract<
          ReservationFormSuccess,
          { variant: "guest" }
        > = {
          variant: "guest",
          message: result.message,
          mawkibName: result.mawkibName,
          reservationDate: result.reservationDate,
          reservationEndDate: result.reservationEndDate,
          maleGuestCount: result.maleGuestCount,
          femaleGuestCount: result.femaleGuestCount,
          trackingCode: result.trackingCode,
          mobileNumber: trimmedMobile,
          loginPasswordHint,
          fullName: fullName.trim(),
          mawkibId: selectedMawkibId!,
          reservationId: result.reservationId,
          guestReservationMode,
          mawkibSnapshot: mawkibForSnapshot
            ? {
                id: mawkibForSnapshot.id,
                name: mawkibForSnapshot.name,
                address: mawkibForSnapshot.address,
                phoneNumber: mawkibForSnapshot.phoneNumber,
                imageUrl: mawkibForSnapshot.imageUrl,
                owner: mawkibForSnapshot.owner
                  ? {
                      fullName: mawkibForSnapshot.owner.fullName,
                      mobileNumber: mawkibForSnapshot.owner.mobileNumber,
                    }
                  : undefined,
              }
            : undefined,
          companions: companionsPayload,
        };

        if (isGuestFastMode) {
          try {
            await downloadPilgrimCardForReservation(
              buildReservationFromGuestSuccess(guestSuccessPayload),
            );
          } catch {
            toast.error(
              "دانلود خودکار زائر کارت انجام نشد. از دکمه دانلود در پایین صفحه استفاده کنید.",
            );
          }
        }

        onSuccess(guestSuccessPayload);
        return;
      }

      const pilgrim = await validatePanelPilgrim();
      if (!pilgrim) return;

      const created = await reservationsApi.create({
        mawkibId: selectedMawkibId!,
        reservationDate: dateStart,
        reservationEndDate: dateEnd,
        maleGuestCount,
        femaleGuestCount: effectiveFemaleGuestCount,
        pilgrimMobile: pilgrim.pilgrimMobile,
        pilgrimUserId: pilgrim.pilgrimUserId,
        description: description.trim() || undefined,
        companions: serializeCompanions(companionsForm),
        plannedCheckInTime: plannedCheckInTime || undefined,
        plannedCheckOutTime: plannedCheckOutTime || undefined,
        skipCapacityCheck: skipCapacityCheck || undefined,
        trackingCode: trackingCode.trim() || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ["reservations-admin"] });
      queryClient.invalidateQueries({ queryKey: ["reservations-my"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["pilgrims"] });

      onSuccess({ variant: "panel", reservationId: created.id });
      toast.success("رزرو با موفقیت ثبت شد");
    } catch (err) {
      toastApiError(err, "خطا در ثبت درخواست. لطفاً دوباره تلاش کنید");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMawkibId) {
      toast.error("لطفاً یک موکب انتخاب کنید");
      return;
    }

    const mawkibForSubmit = selectedMawkib;
    if (
      mawkibForSubmit?.serviceStartDate &&
      !isOnOrAfterServiceStart(dateStart, mawkibForSubmit.serviceStartDate)
    ) {
      toast.error(
        `تاریخ شروع رزرو نمی‌تواند قبل از شروع خدمات موکب (${formatPersianDate(mawkibForSubmit.serviceStartDate.slice(0, 10))}) باشد`,
      );
      return;
    }

    if (mawkibForSubmit) {
      const minReservationDays = effectiveDefaultReservationDays(
        mawkibForSubmit.defaultReservationDays,
      );
      const maxReservationDays = effectiveMaxReservationDays(
        mawkibForSubmit.maxReservationDays,
      );
      const stayDays = reservationStayDayCount(dateStart, dateEnd);
      if (stayDays < minReservationDays) {
        toast.error(
          `حداقل بازه رزرو برای این موکب ${minReservationDays} روز است`,
        );
        return;
      }
      if (!isWithinMaxReservationDays(dateStart, dateEnd, maxReservationDays)) {
        toast.error(
          `حداکثر بازه رزرو برای این موکب ${maxReservationDays} روز است`,
        );
        return;
      }
    }

    if (maleGuestCount + effectiveFemaleGuestCount < 1) {
      toast.error("حداقل یک نفر (آقا یا بانو) باید وارد شود");
      return;
    }

    if (capacityBlocksSubmit) {
      toast.error("در حال حاضر ظرفیت خالی وجود ندارد");
      return;
    }

    if (variant === "guest") {
      if (!validateGuestPersonalInfo()) return;

      const trimmedPassword = password.trim();
      if (trimmedPassword && trimmedPassword.length < 4) {
        toast.error("رمز عبور باید حداقل ۴ کاراکتر باشد");
        return;
      }

      if (mawkibForSubmit && hasMawkibRules(mawkibForSubmit.rules)) {
        setRulesModalOpen(true);
        return;
      }
    }

    await performSubmit();
  };

  const handleRulesConfirm = async () => {
    await performSubmit();
  };

  const handleDateStartChange = (start: string) => {
    setStayDateAlignAlert(null);
    setDateStart(start);
    if (start) {
      const minEnd = defaultReservationEndDate(start, 1);
      if (!dateEnd || dateEnd < minEnd) {
        setDateEnd(minEnd);
      }
    }
    if (!preselectedMawkibId) {
      setSelectedMawkibId(null);
    }
  };

  const handleDateEndChange = (end: string) => {
    setStayDateAlignAlert(null);
    if (end && dateStart) {
      const minEnd = defaultReservationEndDate(dateStart, 1);
      if (end < minEnd) {
        if (end < dateStart) {
          toast.error("تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد");
        } else {
          toast.error("حداقل مدت اقامت یک روز است");
        }
        setDateEnd(minEnd);
        if (!preselectedMawkibId) {
          setSelectedMawkibId(null);
        }
        return;
      }
    }
    setDateEnd(end);
    if (!preselectedMawkibId) {
      setSelectedMawkibId(null);
    }
  };

  const handleSelectMawkib = (mawkib: Mawkib) => {
    const result = alignReservationEndToMawkibLimits(
      dateStart,
      dateEnd,
      mawkib.defaultReservationDays,
      mawkib.maxReservationDays,
    );
    if (result.adjusted && result.limitDays != null) {
      const message = reservationStayAlignAlertMessage(result);
      if (message) setStayDateAlignAlert(message);
      setDateEnd(result.endDate);
    }
    setSelectedMawkibId(mawkib.id);
    mawkibStayDefaultsAppliedForIdRef.current = mawkib.id;
  };

  const scrollToStaySection = () => {
    document.getElementById("guest-reservation-stay")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const personalSectionTitle = isPanel
    ? isPilgrim
      ? "اطلاعات شما"
      : pilgrimMode === "select"
        ? "انتخاب زائر"
        : "اطلاعات زائر"
    : "اطلاعات شما";

  const showGuestPersonalFields =
    variant === "guest" || (canManagePilgrim && pilgrimMode === "new");

  return (
    <>
      {guestPreselectedMawkib && (
        <MawkibInfoCard
          mawkib={guestPreselectedMawkib}
          showThumbnail
          variant="guest-browse"
          footer={(() => {
            const showGallery =
              mawkibGalleryUrls(guestPreselectedMawkib).length > 0;
            const showMap = hasValidCoords(
              guestPreselectedMawkib.latitude,
              guestPreselectedMawkib.longitude,
            );
            if (!showGallery && !showMap) return undefined;

            return (
              <div className="flex flex-wrap gap-2 border-t border-slate-100 px-3.5 py-2">
                {showGallery && (
                  <MawkibGuestGalleryButton
                    onClick={() => setGalleryMawkib(guestPreselectedMawkib)}
                  />
                )}
                {showMap && (
                  <MawkibGuestMapButton mawkib={guestPreselectedMawkib} />
                )}
              </div>
            );
          })()}
        />
      )}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={`${guestTheme.cardLg} space-y-6 ${guestPreselectedMawkib ? "mt-4" : ""}`}
      >
        {variant === "guest" && (
          <div className="flex justify-end">
            <GuestReservationModeToggle
              value={guestReservationMode}
              onChange={setGuestReservationMode}
            />
          </div>
        )}

        <section>
          <SectionHeader
            icon={<IconUser />}
            title={personalSectionTitle}
            action={
              canManagePilgrim ? (
                <button
                  type="button"
                  onClick={togglePilgrimMode}
                  className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50"
                >
                  {pilgrimMode === "select" ? "زائر جدید" : "انتخاب زائر"}
                </button>
              ) : undefined
            }
          />

          {isPilgrim ? (
            <PilgrimInfoCard
              fullName={user?.fullName ?? ""}
              mobileNumber={user?.mobileNumber ?? ""}
            />
          ) : canManagePilgrim && pilgrimMode === "select" ? (
            <div className="space-y-3">
              <PilgrimSearchSelect
                value={selectedPilgrim}
                onChange={setSelectedPilgrim}
              />
              {selectedPilgrim && (
                <PilgrimInfoCard
                  fullName={selectedPilgrim.fullName}
                  mobileNumber={selectedPilgrim.mobileNumber}
                  city={selectedPilgrim.city}
                />
              )}
              {canSetCustomTrackingCode && (
                <label className="block max-w-[10.5rem]">
                  <span className="mb-1.5 block text-sm text-slate-600">کد رزرو</span>
                  <input
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter") return;
                      e.preventDefault();
                      formRef.current?.requestSubmit();
                    }}
                    className={`${reservationFormInputClass} !min-h-9 !py-2 !text-sm`}
                    placeholder="خالی = خودکار"
                    dir="ltr"
                    autoComplete="off"
                    maxLength={64}
                  />
                </label>
              )}
            </div>
          ) : showGuestPersonalFields ? (
            variant === "guest" ? (
              <GuestReservationPersonalFields
                mode={guestReservationMode}
                fullName={fullName}
                mobileNumber={mobileNumber}
                nationalId={nationalId}
                gender={gender}
                birthDate={birthDate}
                country={country}
                passportNumber={passportNumber}
                password={password}
                province={province}
                city={city}
                nationalIdCardImageUrl={nationalIdCardImageUrl}
                submitting={submitting}
                onFullNameChange={setFullName}
                onMobileNumberChange={setMobileNumber}
                onNationalIdChange={setNationalId}
                onGenderChange={setGender}
                onBirthDateChange={setBirthDate}
                onCountryChange={setCountry}
                onPassportNumberChange={setPassportNumber}
                onPasswordChange={setPassword}
                onProvinceChange={setProvince}
                onCityChange={setCity}
                onNationalIdCardImageUrlChange={setNationalIdCardImageUrl}
                onPasswordEnter={scrollToStaySection}
              />
            ) : (
              <PanelNewPilgrimFields
                fullName={fullName}
                mobileNumber={mobileNumber}
                nationalId={nationalId}
                gender={gender}
                birthDate={birthDate}
                country={country}
                passportNumber={passportNumber}
                province={province}
                city={city}
                nationalIdCardImageUrl={nationalIdCardImageUrl}
                submitting={submitting}
                mobileLabel="تلفن همراه"
                optionalFields="hidden"
                onFullNameChange={setFullName}
                onMobileNumberChange={setMobileNumber}
                onNationalIdChange={setNationalId}
                onGenderChange={setGender}
                onBirthDateChange={setBirthDate}
                onCountryChange={setCountry}
                onPassportNumberChange={setPassportNumber}
                onProvinceChange={setProvince}
                onCityChange={setCity}
                onNationalIdCardImageUrlChange={setNationalIdCardImageUrl}
                showCustomTrackingCode={canSetCustomTrackingCode}
                trackingCode={trackingCode}
                onTrackingCodeChange={setTrackingCode}
                onTrackingCodeEnter={() => formRef.current?.requestSubmit()}
              />
            )
          ) : null}
        </section>

        <hr className="border-slate-100" />

        <section id="guest-reservation-stay" className="scroll-mt-24">
          <SectionHeader
            icon={<IconCalendar />}
            title="تاریخ اقامت"
            subtitle={staySectionSubtitle}
          />
          <div className="space-y-4">
            <StayDateAlignAlert message={stayDateAlignAlert} />

            <div className="rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50/80 to-white p-4">
              <StayDurationQuickPick
                onSelect={handleStayDurationPick}
                isActive={isStayDurationActive}
                isDisabled={isStayDurationDisabled}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <PersianDateInput
                  label="تاریخ شروع اقامت *"
                  value={dateStart}
                  onChange={handleDateStartChange}
                  placeholder="انتخاب تاریخ ورود"
                  minDate={effectiveStart}
                  inputClassName={reservationFormInputClass}
                  clearable={false}
                />
                <PersianDateInput
                  label="تاریخ پایان اقامت *"
                  value={dateEnd}
                  onChange={handleDateEndChange}
                  placeholder="انتخاب تاریخ خروج"
                  minDate={minimumEndDate}
                  inputClassName={reservationFormInputClass}
                  clearable={false}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50/80 to-white p-4">
              {showGuestCountQuickPick && (
                <GuestCountQuickPick
                  onPickMale={handleQuickPickMale}
                  onPickFemale={handleQuickPickFemale}
                  maleActive={maleQuickPickActive}
                  femaleActive={femaleQuickPickActive}
                  maleDisabled={maleQuickPickDisabled}
                  femaleDisabled={femaleQuickPickDisabled}
                />
              )}

              <div className={guestCountGridClass}>
                <GuestCountStepper
                  label="تعداد آقایان *"
                  value={maleGuestCount}
                  disabled={isMaleCapacityFull}
                  onChange={setMaleGuestCount}
                  compact
                />
                {showFemaleGuestCount ? (
                  <GuestCountStepper
                    label="تعداد بانوان *"
                    value={femaleGuestCount}
                    disabled={isFemaleCapacityFull}
                    onChange={setFemaleGuestCount}
                    compact
                  />
                ) : (
                  <NoFemaleAcceptanceHint />
                )}
              </div>
            </div>
          </div>
        </section>

        {!hideMawkibPicker && (
          <section>
            <SectionHeader
              icon={<IconHome />}
              title="انتخاب موکب"
              subtitle={mawkibSectionSubtitle}
            />

            {canBypassCapacity && (
              <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3">
                <input
                  type="checkbox"
                  checked={skipCapacityCheck}
                  onChange={(e) => {
                    setSkipCapacityCheck(e.target.checked);
                    setSelectedMawkibId(null);
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm leading-relaxed text-amber-900">
                  <span className="font-medium">ثبت بدون بررسی ظرفیت</span>
                  <span className="mt-1 block text-xs text-amber-800">
                    با انتخاب این گزینه، ظرفیت موکب بررسی نخواهد شد و مسئولیت بر
                    عهده موکب دار محترم خواهد بود
                  </span>
                </span>
              </label>
            )}

            {mawkibsError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
                خطا در دریافت لیست موکب‌ها. لطفاً صفحه را رفرش کنید.
              </div>
            ) : mawkibsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c5d4e8] border-t-[#4a6fa5]" />
              </div>
            ) : mawkibs.length === 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <IconUsers />
                </div>
                {skipCapacityCheck && canBypassCapacity ? (
                  <>
                    <p className="font-medium text-amber-900">
                      موکبی برای انتخاب یافت نشد
                    </p>
                    <p className="mt-2 text-sm text-amber-700">
                      ممکن است تاریخ انتخابی قبل از شروع خدمات موکب باشد یا موکب
                      تاییدشده‌ای در دسترس نباشد.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-amber-900">
                      متأسفانه چون ظرفیت خالی نداریم نمی‌توانیم در خدمتتان باشیم
                    </p>
                    <p className="mt-2 text-sm text-amber-700">
                      لطفاً تاریخ دیگری انتخاب کنید یا بعداً دوباره مراجعه
                      فرمایید.
                    </p>
                    <p className="mt-2 text-xs text-amber-600">
                      ممکن است تاریخ انتخابی شما قبل از شروع خدمات برخی موکب‌ها
                      باشد یا از حداکثر بازه رزرو آن‌ها بیشتر باشد.
                    </p>
                    {canBypassCapacity && (
                      <p className="mt-3 text-xs font-medium text-amber-800">
                        در صورت نیاز می‌توانید گزینه «ثبت بدون بررسی ظرفیت» را
                        فعال کنید.
                      </p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {restrictedOnlineReserver && reservableMawkibs.length === 0 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    موکب‌های موجود در این بازه امکان رزرو آنلاین ندارند.
                  </div>
                )}
                {!guestPreselectedMawkib && (
                  <label className="block">
                    <span className="mb-1.5 block text-sm text-slate-600">
                      جستجوی نام موکب
                    </span>
                    <input
                      type="search"
                      value={mawkibSearchQuery}
                      onChange={(e) => setMawkibSearchQuery(e.target.value)}
                      placeholder="بخشی از نام موکب را وارد کنید..."
                      className={reservationFormInputClass}
                      autoComplete="off"
                    />
                  </label>
                )}
                {mawkibsForSelection.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
                    {guestPreselectedMawkib
                      ? "این موکب در بازه و ظرفیت انتخاب‌شده در دسترس نیست. تاریخ یا تعداد نفرات را تغییر دهید."
                      : `موکبی با نام «${mawkibSearchQuery.trim()}» در این لیست یافت نشد.`}
                  </div>
                ) : (
                  mawkibsForSelection.map((mawkib) => {
                    const reservationBlocked =
                      restrictedOnlineReserver &&
                      !isMawkibOnlineReservationEnabled(mawkib);
                    const galleryUrls = mawkibGalleryUrls(mawkib);
                    return (
                      <MawkibCard
                        key={mawkib.id}
                        mawkib={mawkib}
                        selected={selectedMawkibId === mawkib.id}
                        onSelect={() => handleSelectMawkib(mawkib)}
                        reservationBlocked={reservationBlocked}
                        showThumbnail
                        variant={
                          variant === "guest" ? "guest-browse" : "default"
                        }
                        footer={
                          <MawkibGuestGalleryDetailsFooter
                            showGallery={galleryUrls.length > 0}
                            onViewGallery={() => setGalleryMawkib(mawkib)}
                            onViewDetails={() => setDetailMawkib(mawkib)}
                          />
                        }
                      />
                    );
                  })
                )}
              </div>
            )}
          </section>
        )}

        {variant === "panel" &&
          canManagePilgrim &&
          pilgrimMode === "new" &&
          !isGuestFastMode && (
            <>
              <hr className="border-slate-100" />

              <section>
                <CollapsibleSection
                  variant="card"
                  summary={PANEL_OPTIONAL_FIELDS_COLLAPSE_LABEL}
                  summaryIcon={<IconUser />}
                >
                  <PanelNewPilgrimOptionalFields
                    nationalId={nationalId}
                    gender={gender}
                    birthDate={birthDate}
                    travelOrigin={travelOrigin}
                    country={country}
                    passportNumber={passportNumber}
                    nationalIdCardImageUrl={nationalIdCardImageUrl}
                    submitting={submitting}
                    password={password}
                    province={province}
                    city={city}
                    onNationalIdChange={setNationalId}
                    onGenderChange={setGender}
                    onBirthDateChange={setBirthDate}
                    onTravelOriginChange={setTravelOrigin}
                    onCountryChange={setCountry}
                    onPassportNumberChange={setPassportNumber}
                    onNationalIdCardImageUrlChange={setNationalIdCardImageUrl}
                    onPasswordChange={setPassword}
                    onProvinceChange={setProvince}
                    onCityChange={setCity}
                  />
                </CollapsibleSection>
              </section>
            </>
          )}

        {!isGuestFastMode && (
          <>
            {variant === "guest" && (
              <>
                <hr className="border-slate-100" />

                <section>
                  <label className="block">
                    <span className="mb-1.5 block text-sm text-slate-600">
                      مبدا سفر (اختیاری)
                    </span>
                    <input
                      type="text"
                      value={travelOrigin}
                      readOnly
                      tabIndex={-1}
                      className={`${reservationFormInputClass} cursor-not-allowed bg-slate-50 text-slate-700`}
                      placeholder="—"
                    />
                  </label>
                </section>
              </>
            )}

            <hr className="border-slate-100" />

            <section>
              <details className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <summary className="flex cursor-pointer list-none items-center gap-3 p-4 sm:p-5 marker:content-none [&::-webkit-details-marker]:hidden">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5]">
                    <IconUsers />
                  </div>
                  <h2 className="flex-1 text-base font-semibold text-slate-800 sm:text-lg">
                    مشخصات همراهان (اختیاری)
                  </h2>
                  <svg
                    className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="border-t border-slate-100 px-4 pb-4 pt-2 sm:px-5">
                  <CompanionsTable
                    value={companionsForm}
                    onChange={setCompanionsForm}
                  />
                </div>
              </details>
            </section>

            <hr className="border-slate-100" />

            <section>
              <SectionHeader
                icon={<IconChat />}
                title="توضیحات (اختیاری)"
                subtitle="اگر نکته ای هست که می تونه کمک کننده باشه لطفا اینجا بنویسین"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`${reservationFormInputClass} resize-none`}
                placeholder="مثلاً نیاز به دسترسی ویلچر، زمان تقریبی ورود و..."
              />
            </section>
          </>
        )}

        {(isPanel && isAdmin) || !isPanel ? (
          <div
            role="alert"
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm leading-7 text-amber-900 shadow-sm ring-1 ring-amber-100"
          >
            <p>
              {isPanel && isAdmin
                ? "رزروهای ثبت‌شده توسط مدیر به‌صورت خودکار تایید می‌شوند."
                : "درخواست رزرو شما در لیست انتظار قرار می‌گیرد و پس از بررسی و تایید مدیریت محترم موکب، قطعی خواهد شد."}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:flex-wrap">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={`${btnSecondary} sm:min-w-[120px]`}
            >
              انصراف
            </button>
          )}
          <button
            type="submit"
            disabled={
              submitting ||
              capacityBlocksSubmit ||
              selectedMawkibBlocked ||
              mawkibsLoading ||
              !selectedMawkibId ||
              maleGuestCount + effectiveFemaleGuestCount < 1
            }
            className={`${guestTheme.btnPrimaryLg} flex-1 py-3.5 sm:min-w-[200px]`}
          >
            {submitting ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                در حال ثبت...
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
                {isPanel ? "ثبت رزرو" : "ثبت درخواست رزرو"}
              </>
            )}
          </button>
        </div>
      </form>

      {variant === "guest" &&
        selectedMawkib &&
        hasMawkibRules(selectedMawkib.rules) && (
          <MawkibRulesAcceptanceModal
            open={rulesModalOpen}
            onClose={() => {
              if (!submitting) setRulesModalOpen(false);
            }}
            mawkibName={selectedMawkib.name}
            rules={selectedMawkib.rules}
            submitting={submitting}
            onConfirm={handleRulesConfirm}
          />
        )}

      <MawkibGalleryModal
        open={!!galleryMawkib}
        onClose={() => setGalleryMawkib(null)}
        mawkibName={galleryMawkib?.name ?? ""}
        imageUrls={galleryMawkib ? mawkibGalleryUrls(galleryMawkib) : []}
      />

      <MawkibPublicDetailModal
        open={!!detailMawkib}
        onClose={() => setDetailMawkib(null)}
        mawkib={detailMawkib}
      />
    </>
  );
}
