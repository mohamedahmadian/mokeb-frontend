import { PilgrimSearchLookup } from './PilgrimSearchLookup';
import {
  ReservationTrackLookup,
  type ReservationTrackLookupProps,
} from './ReservationTrackLookup';

interface DashboardLookupPanelsProps extends ReservationTrackLookupProps {
  pilgrimSearchScope?: 'mine' | 'all';
}

export function DashboardLookupPanels({
  pilgrimSearchScope = 'mine',
  ...trackLookupProps
}: DashboardLookupPanelsProps) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-stretch">
      <div className="flex shrink-0 flex-col xl:flex-1">
        <ReservationTrackLookup {...trackLookupProps} />
      </div>
      <div className="flex shrink-0 flex-col xl:flex-1">
        <PilgrimSearchLookup scope={pilgrimSearchScope} />
      </div>
    </div>
  );
}
