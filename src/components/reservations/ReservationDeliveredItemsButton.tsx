import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ReservationDeliveredItemsModal,
  type DeliveredItemFormValues,
} from './ReservationDeliveredItemsModal';
import { useAuth } from '../../contexts/AuthContext';
import { reservationsApi } from '../../lib/reservations';
import { guestTheme } from '../../lib/guest-theme';
import { toast, toastApiError } from '../../lib/toast';
import { btnSecondary } from '../../lib/styles';
import type { Reservation } from '../../types';

function canViewDeliveredItems(reservation: Reservation) {
  return reservation.status === 'Confirmed' || reservation.status === 'Completed';
}

function canManageDeliveredItems(
  reservation: Reservation,
  roles: string[] | undefined,
) {
  const isAdmin = roles?.includes('Admin') ?? false;
  const isOwner = roles?.includes('MawkibOwner') ?? false;
  if (!isAdmin && !isOwner) return false;
  return canViewDeliveredItems(reservation);
}

interface ReservationDeliveredItemsButtonProps {
  reservation: Reservation;
  reservationId: number;
  variant?: 'panel' | 'guest';
  className?: string;
  label?: string;
  onUpdate?: (reservation: Reservation) => void;
}

export function ReservationDeliveredItemsButton({
  reservation,
  reservationId,
  variant = 'panel',
  className,
  label = 'امانات',
  onUpdate,
}: ReservationDeliveredItemsButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const canManage = canManageDeliveredItems(reservation, user?.roles);
  const items = reservation.deliveredItems ?? [];

  const invalidate = (updated: Reservation) => {
    queryClient.setQueryData(['reservation', reservationId], updated);
    queryClient.invalidateQueries({ queryKey: ['reservations-admin'] });
    queryClient.invalidateQueries({ queryKey: ['reservations-my'] });
    onUpdate?.(updated);
  };

  const createItem = useMutation({
    mutationFn: (values: DeliveredItemFormValues) =>
      reservationsApi.createDeliveredItem(reservationId, {
        itemName: values.itemName,
        quantity: values.quantity,
        description: values.description || undefined,
      }),
    onSuccess: (updated) => {
      invalidate(updated);
      toast.success('امانتی با موفقیت ثبت شد');
    },
    onError: (error) => toastApiError(error, 'خطا در ثبت امانتی'),
  });

  const updateItem = useMutation({
    mutationFn: ({
      itemId,
      values,
    }: {
      itemId: number;
      values: DeliveredItemFormValues;
    }) =>
      reservationsApi.updateDeliveredItem(reservationId, itemId, {
        itemName: values.itemName,
        quantity: values.quantity,
        description: values.description || undefined,
      }),
    onSuccess: (updated) => {
      invalidate(updated);
      toast.success('امانتی با موفقیت ویرایش شد');
    },
    onError: (error) => toastApiError(error, 'خطا در ویرایش امانتی'),
  });

  const receiveItem = useMutation({
    mutationFn: (itemId: number) =>
      reservationsApi.receiveDeliveredItem(reservationId, itemId),
    onSuccess: (updated) => {
      invalidate(updated);
      toast.success('دریافت امانتی ثبت شد');
    },
    onError: (error) => toastApiError(error, 'خطا در ثبت دریافت امانتی'),
  });

  const removeItem = useMutation({
    mutationFn: (itemId: number) =>
      reservationsApi.removeDeliveredItem(reservationId, itemId),
    onSuccess: (updated) => {
      invalidate(updated);
      toast.success('امانتی حذف شد');
    },
    onError: (error) => toastApiError(error, 'خطا در حذف امانتی'),
  });

  const buttonClass =
    className ??
    (variant === 'guest'
      ? `${guestTheme.btnSecondary} w-full`
      : `${btnSecondary} w-full sm:w-auto`);

  if (!canManage) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center gap-1.5 ${buttonClass}`}
      >
        <svg
          className="h-4 w-4 shrink-0 text-violet-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.6}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        {label}
        {items.length > 0 && (
          <span className="rounded-full bg-[#e8eef6] px-2 py-0.5 text-xs font-medium text-[#4a6fa5]">
            {items.length.toLocaleString('fa-IR')}
          </span>
        )}
      </button>

      <ReservationDeliveredItemsModal
        open={open}
        onClose={() => setOpen(false)}
        items={items}
        canManage
        onCreate={async (values) => {
          await createItem.mutateAsync(values);
        }}
        onUpdate={async (itemId, values) => {
          await updateItem.mutateAsync({ itemId, values });
        }}
        onRemove={async (itemId) => {
          await removeItem.mutateAsync(itemId);
        }}
        onReceive={async (itemId) => {
          await receiveItem.mutateAsync(itemId);
        }}
      />
    </>
  );
}
