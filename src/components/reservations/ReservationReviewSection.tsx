import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatPersianDateFromIso } from '../ui/PersianDateInput';
import { NavIcon } from '../ui/NavIcons';
import { ReservationReviewModal } from './ReservationReviewModal';
import { useAuth } from '../../contexts/AuthContext';
import {
  canManageReservationReviewReply,
  canPilgrimManageReview,
  reservationReviewReplyLabel,
} from '../../lib/reservation-reviews';
import { reservationsApi } from '../../lib/reservations';
import { guestTheme } from '../../lib/guest-theme';
import { toast, toastApiError } from '../../lib/toast';
import { btnPrimary, inputClass } from '../../lib/styles';
import type { Reservation } from '../../types';

interface ReservationReviewSectionProps {
  reservation: Reservation;
  reservationId: number;
}

export function ReservationReviewSection({
  reservation,
  reservationId,
}: ReservationReviewSectionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.roles.includes('Admin') ?? false;
  const isMawkibOwner = user?.roles.includes('MawkibOwner') ?? false;
  const isPilgrim =
    (user?.roles.includes('Pilgrim') ?? false) &&
    !user?.roles.includes('Admin') &&
    !user?.roles.includes('MawkibOwner');

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  const review = reservation.review;
  const canManageOwnReview =
    isPilgrim && canPilgrimManageReview(reservation, user?.id);
  const canManageReply = canManageReservationReviewReply(user?.roles, reservation);
  const replyLabel = reservationReviewReplyLabel(user?.roles);

  useEffect(() => {
    setReplyText(review?.adminReply ?? '');
  }, [review?.adminReply]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] });
    queryClient.invalidateQueries({ queryKey: ['reservations-my'] });
    queryClient.invalidateQueries({ queryKey: ['reservations-admin'] });
  };

  const createReview = useMutation({
    mutationFn: (content: string) => reservationsApi.createReview(reservationId, content),
    onSuccess: () => {
      invalidate();
      toast.success('نظر شما با موفقیت ثبت شد');
    },
    onError: (error) => toastApiError(error, 'خطا در ثبت نظر'),
  });

  const updateReview = useMutation({
    mutationFn: (content: string) => reservationsApi.updateReview(reservationId, content),
    onSuccess: () => {
      invalidate();
      toast.success('نظر با موفقیت ویرایش شد');
    },
    onError: (error) => toastApiError(error, 'خطا در ویرایش نظر'),
  });

  const replyReview = useMutation({
    mutationFn: (adminReply: string) =>
      reservationsApi.replyToReview(reservationId, adminReply),
    onSuccess: () => {
      invalidate();
      toast.success(
        review?.adminReply ? 'پاسخ با موفقیت ویرایش شد' : 'پاسخ با موفقیت ثبت شد',
      );
    },
    onError: (error) => toastApiError(error, 'خطا در ثبت پاسخ'),
  });

  if (!review && !canManageOwnReview && !isAdmin && !isMawkibOwner) {
    return null;
  }

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = replyText.trim();
    if (!trimmed) {
      toast.error('متن پاسخ را وارد کنید');
      return;
    }
    replyReview.mutate(trimmed);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-l from-[#f0f4fa] to-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e8eef6] text-[#4a6fa5]">
            <NavIcon name="book" className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-semibold text-slate-800">نظرات</h2>
        </div>
        {canManageOwnReview && (
          <button
            type="button"
            onClick={() => setReviewModalOpen(true)}
            className={`${guestTheme.btnPrimary} !px-3 !py-1.5 !text-xs`}
          >
            ثبت نظر
          </button>
        )}
      </div>

      <div className="space-y-4 p-4">
        {!review ? (
          <p className="text-center text-sm text-slate-500">
            {canManageOwnReview
              ? 'هنوز نظری برای این رزرو ثبت نشده است.'
              : 'نظری ثبت نشده است.'}
          </p>
        ) : (
          <>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium text-[#4a6fa5]">
                  {review.author.fullName}
                </p>
                <p className="text-xs text-slate-400">
                  {formatPersianDateFromIso(review.createdAt)}
                </p>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {review.content}
              </p>
            </div>

            {review.adminReply && !canManageReply ? (
              <div className="rounded-xl border border-[#c5d4e8] bg-[#f0f4fa] p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-medium text-[#3d5d8a]">
                    {replyLabel}
                    {review.repliedBy ? ` — ${review.repliedBy.fullName}` : ''}
                  </p>
                  {review.repliedAt && (
                    <p className="text-xs text-slate-400">
                      {formatPersianDateFromIso(review.repliedAt)}
                    </p>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {review.adminReply}
                </p>
              </div>
            ) : canManageReply ? (
              <form onSubmit={handleReplySubmit}>
                <div className="space-y-3 rounded-xl border border-[#c5d4e8] bg-[#f0f4fa] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-medium text-[#3d5d8a]">
                      {replyLabel}
                      {review.adminReply && review.repliedBy
                        ? ` — ${review.repliedBy.fullName}`
                        : ''}
                      {!review.adminReply ? ' *' : ''}
                    </p>
                    {review.adminReply && review.repliedAt && (
                      <p className="text-xs text-slate-400">
                        {formatPersianDateFromIso(review.repliedAt)}
                      </p>
                    )}
                  </div>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    maxLength={2000}
                    className={`${inputClass} resize-none bg-white`}
                    placeholder="پاسخ خود را به نظر زائر بنویسید..."
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={replyReview.isPending}
                      className={`${btnPrimary} !text-sm`}
                    >
                      {replyReview.isPending
                        ? 'در حال ارسال...'
                        : review.adminReply
                          ? 'ذخیره ویرایش'
                          : 'ثبت پاسخ'}
                    </button>
                  </div>
                </div>
              </form>
            ) : isAdmin || isMawkibOwner ? (
              <p className="text-xs text-slate-400">
                هنوز پاسخی برای این نظر ثبت نشده است.
              </p>
            ) : null}
          </>
        )}
      </div>

      <ReservationReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        reservation={reservation}
        initialContent={review?.content ?? ''}
        isEdit={!!review}
        onSubmit={async (content) => {
          if (review) {
            await updateReview.mutateAsync(content);
          } else {
            await createReview.mutateAsync(content);
          }
        }}
      />
    </section>
  );
}
