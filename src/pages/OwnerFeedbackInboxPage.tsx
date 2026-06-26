import { FeedbackInboxList } from "../components/mawkib-feedback/FeedbackInboxList";
import { mawkibFeedbackApi } from "../lib/mawkib-feedback";

export function OwnerFeedbackInboxPage() {
  return (
    <FeedbackInboxList
      title="سیستم انتقادات و پیشنهادات"
      queryKeyPrefix="mawkib-feedback-inbox"
      emptyMessage="انتقاد یا پیشنهادی برای موکب‌های شما ثبت نشده است"
      fetchList={mawkibFeedbackApi.listInbox}
    />
  );
}
