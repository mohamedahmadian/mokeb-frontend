import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GuestPageHeader, GuestShell } from '../components/guest/GuestShell';
import { NavIcon } from '../components/ui/NavIcons';
import {
  FAQ_CATEGORIES,
  FAQ_ITEMS,
  type FaqCategory,
  type FaqItem,
  filterFaqItems,
  getCategoryMeta,
} from '../lib/faq-data';
import { guestTheme } from '../lib/guest-theme';

const categoryIcon: Record<FaqCategory, 'pilgrims' | 'mawkibOwnerPanel' | 'honorary'> = {
  pilgrims: 'pilgrims',
  'mawkib-owners': 'mawkibOwnerPanel',
  honorary: 'honorary',
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-[#4a6fa5] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
  showCategory,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
  showCategory?: boolean;
}) {
  const meta = getCategoryMeta(item.category);

  return (
    <article
      className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
        isOpen
          ? 'border-[#c5d4e8] bg-white shadow-md ring-1 ring-[#e8eef6]'
          : 'border-slate-200/80 bg-white hover:border-[#c5d4e8]/60 hover:shadow-sm'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 p-5 text-right"
        aria-expanded={isOpen}
      >
        <div className="min-w-0 flex-1">
          {showCategory && (
            <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-[#f0f4fa] px-2.5 py-0.5 text-xs font-medium text-[#4a6fa5]">
              <NavIcon name={categoryIcon[item.category]} className="h-3.5 w-3.5" />
              {meta.title}
            </span>
          )}
          <h3 className="text-sm font-semibold leading-7 text-slate-800 sm:text-base">
            {item.question}
          </h3>
        </div>
        <ChevronIcon open={isOpen} />
      </button>
      <div
        className={`grid transition-all duration-200 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 px-5 pb-5 pt-1">
            <p className="text-sm leading-8 text-slate-600">{item.answer}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function FaqSection({
  category,
  items,
  expandedId,
  onToggle,
}: {
  category: FaqCategory;
  items: FaqItem[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}) {
  const meta = getCategoryMeta(category);

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5]">
          <NavIcon name={categoryIcon[category]} className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-800">{meta.title}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{meta.description}</p>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <FaqAccordionItem
            key={item.id}
            item={item}
            isOpen={expandedId === item.id}
            onToggle={() => onToggle(item.id)}
          />
        ))}
      </div>
    </section>
  );
}

export function FaqPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FaqCategory>('pilgrims');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isSearching = query.trim().length > 0;
  const searchResults = useMemo(() => filterFaqItems(query), [query]);

  const tabItems = useMemo(
    () => FAQ_ITEMS.filter((item) => item.category === activeTab),
    [activeTab],
  );

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleSearchChange = (value: string) => {
    setQuery(value);
    setExpandedId(null);
  };

  return (
    <GuestShell maxWidth="xl">
      <GuestPageHeader
        icon={<NavIcon name="book" className="h-6 w-6" />}
        title="سوالات متداول"
        subtitle="پاسخ پرسش‌های رایج زائران، موکب‌داران و خادمین"
      />

      <div className={`${guestTheme.cardLg} mb-8`}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">جستجو در سوالات</span>
          <div className={guestTheme.searchBox}>
            <span className="flex shrink-0 items-center pe-3 ps-4 text-slate-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="کلمه یا عبارت مورد نظر را بنویسید..."
              className="min-w-0 flex-1 border-0 bg-transparent py-3 pe-4 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="shrink-0 px-3 text-xs text-slate-400 transition hover:text-slate-600"
              >
                پاک کردن
              </button>
            )}
          </div>
        </label>
        {isSearching && (
          <p className="mt-3 text-sm text-slate-500">
            {searchResults.length > 0
              ? `${searchResults.length} نتیجه یافت شد — روی هر سوال کلیک کنید تا پاسخ کامل نمایش داده شود`
              : 'نتیجه‌ای یافت نشد. عبارت دیگری امتحان کنید یا از بخش‌های زیر استفاده کنید.'}
          </p>
        )}
      </div>

      {isSearching ? (
        <div className="space-y-3">
          {searchResults.map((item) => (
            <FaqAccordionItem
              key={item.id}
              item={item}
              isOpen={expandedId === item.id}
              onToggle={() => handleToggle(item.id)}
              showCategory
            />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveTab(cat.id);
                  setExpandedId(null);
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  activeTab === cat.id
                    ? 'bg-[#4a6fa5] text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-[#c5d4e8] hover:bg-[#f0f4fa]'
                }`}
              >
                <NavIcon name={categoryIcon[cat.id]} className="h-4 w-4" />
                {cat.title}
              </button>
            ))}
          </div>

          <FaqSection
            category={activeTab}
            items={tabItems}
            expandedId={expandedId}
            onToggle={handleToggle}
          />
        </>
      )}

      <div className="mt-10 rounded-2xl border border-[#c5d4e8] bg-gradient-to-l from-[#f0f4fa] to-white p-6 text-center">
        <p className="text-sm text-slate-600">پاسخ سوال خود را پیدا نکردید؟</p>
        <Link to="/guest/contact" className={`${guestTheme.btnPrimary} mt-4 inline-flex`}>
          <NavIcon name="mail" className="h-4 w-4" />
          ارتباط با ما
        </Link>
      </div>
    </GuestShell>
  );
}
