import { Toaster } from 'sonner';

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      dir="rtl"
      closeButton
      expand
      visibleToasts={5}
      toastOptions={{
        duration: 5000,
        classNames: {
          toast:
            'group toast !font-[inherit] !rounded-xl !shadow-lg !border !border-slate-200/80 !bg-white',
          title: '!text-sm !font-semibold !text-slate-800',
          description: '!text-sm !text-slate-600',
          closeButton: '!border-slate-200 !bg-white !text-slate-500',
          icon: '!shrink-0',
          error: '!border-red-200/80',
          success: '!border-emerald-200/80',
          warning: '!border-amber-200/80',
          info: '!border-[#c5d4e8]',
        },
      }}
    />
  );
}
