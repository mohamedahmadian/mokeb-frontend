import { FeedbackInboxList } from "../components/mawkib-feedback/FeedbackInboxList";
import { mawkibFeedbackApi } from "../lib/mawkib-feedback";

export function AdminFeedbackPage() {
  return (
    <FeedbackInboxList
      title="انتقادات و پیشنهادات"
      queryKeyPrefix="mawkib-feedback-admin"
      emptyMessage="انتقاد یا پیشنهادی ثبت نشده است"
      fetchList={mawkibFeedbackApi.listAll}
      mawkibScope="admin"
    />
  );
}
