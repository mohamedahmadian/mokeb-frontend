import {
  useId,
  useMemo,
  useRef,
  type KeyboardEvent,
} from 'react';
import {
  DEFAULT_MAWKIB_RULES,
  mawkibRulesToEditorItems,
  serializeMawkibRules,
} from '../../lib/mawkib-rules-print';
import { btnSecondary, inputClass } from '../../lib/styles';
import { FieldLabel } from '../users/user-form-ui';
import { MawkibRulesList } from './MawkibRulesList';

interface MawkibRulesEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

function toPersianDigits(value: number): string {
  return value.toLocaleString('fa-IR');
}

function RemoveRuleIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function AddRuleIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

export function MawkibRulesEditor({
  value,
  onChange,
  readOnly = false,
}: MawkibRulesEditorProps) {
  const listId = useId();
  const inputRefs = useRef<Array<HTMLTextAreaElement | null>>([]);
  const items = useMemo(() => mawkibRulesToEditorItems(value), [value]);

  const commitItems = (nextItems: string[]) => {
    const normalized = nextItems.length > 0 ? nextItems : [''];
    onChange(serializeMawkibRules(normalized));
  };

  const focusRule = (index: number) => {
    window.requestAnimationFrame(() => {
      inputRefs.current[index]?.focus();
    });
  };

  const updateRule = (index: number, text: string) => {
    const nextItems = [...items];
    nextItems[index] = text;
    commitItems(nextItems);
  };

  const addRule = (afterIndex?: number) => {
    const insertAt =
      afterIndex === undefined ? items.length : Math.min(afterIndex + 1, items.length);
    const nextItems = [...items];
    nextItems.splice(insertAt, 0, '');
    commitItems(nextItems);
    focusRule(insertAt);
  };

  const removeRule = (index: number) => {
    if (items.length <= 1) {
      commitItems(['']);
      focusRule(0);
      return;
    }

    const nextItems = items.filter((_, itemIndex) => itemIndex !== index);
    commitItems(nextItems);
    focusRule(Math.min(index, nextItems.length - 1));
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
    index: number,
  ) => {
    if (event.key !== 'Enter' || event.shiftKey) return;

    event.preventDefault();
    addRule(index);
  };

  if (readOnly) {
    return (
      <div className="block">
        <FieldLabel label="قوانین و مقررات" />
        <MawkibRulesList rules={value} />
      </div>
    );
  }

  return (
    <div className="block">
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <FieldLabel
          label="قوانین و مقررات"
          hint="هر قانون را در یک باکس جداگانه بنویسید. Enter قانون بعدی را اضافه می‌کند."
        />
        <button
          type="button"
          onClick={() => onChange(DEFAULT_MAWKIB_RULES)}
          className={`${btnSecondary} w-full shrink-0 px-3 py-1.5 text-xs sm:w-auto`}
        >
          قوانین پیش‌فرض
        </button>
      </div>

      <div
        id={listId}
        className="space-y-2.5"
        role="list"
        aria-label="فهرست قوانین موکب"
      >
        {items.map((rule, index) => (
          <div
            key={`${listId}-rule-${index}`}
            role="listitem"
            className="rounded-xl border border-slate-200 bg-gradient-to-l from-[#f8fafc] via-white to-[#f0f4fa]/40 p-2.5 shadow-sm shadow-slate-200/30"
          >
            <div className="flex items-start gap-2.5">
              <span
                className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8eef6] text-xs font-semibold text-[#4a6fa5] ring-1 ring-[#c5d4e8]/60"
                aria-hidden
              >
                {toPersianDigits(index + 1)}
              </span>

              <label className="min-w-0 flex-1">
                <span className="sr-only">قانون {toPersianDigits(index + 1)}</span>
                <textarea
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  value={rule}
                  onChange={(event) => updateRule(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  rows={2}
                  className={`${inputClass} min-h-[3.25rem] resize-y leading-7`}
                  placeholder={`متن قانون ${toPersianDigits(index + 1)}...`}
                />
              </label>

              <button
                type="button"
                onClick={() => removeRule(index)}
                className="mt-1.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                aria-label={`حذف قانون ${toPersianDigits(index + 1)}`}
                title="حذف این قانون"
              >
                <RemoveRuleIcon />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => addRule()}
        className={`${btnSecondary} mt-3 w-full gap-2 sm:w-auto`}
      >
        <AddRuleIcon />
        افزودن قانون
      </button>
    </div>
  );
}
