import { NavIcon } from '../ui/NavIcons';

export function MawkibFormHero({ isEdit }: { isEdit: boolean }) {
  return (
    <div className="mb-1 flex items-center gap-3 rounded-xl border border-[#c5d4e8]/60 bg-gradient-to-l from-[#f0f4fa] to-white px-4 py-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5] ring-1 ring-[#c5d4e8]">
        <NavIcon name="mawkibs" className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">
          {isEdit ? 'ویرایش اطلاعات موکب' : 'ثبت موکب جدید'}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {isEdit
            ? 'به‌روزرسانی مشخصات، ظرفیت و امکانات موکب'
            : 'اطلاعات پایه، موقعیت، ظرفیت و امکانات موکب را وارد کنید'}
        </p>
      </div>
    </div>
  );
}

export function IconPhoto() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  );
}

export function IconPhone() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </svg>
  );
}

export function IconClock() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
