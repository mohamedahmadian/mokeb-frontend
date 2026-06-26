import { PortalOverviewPage } from '../components/guest/PortalOverviewPage';
import { getPortalOverview } from '../lib/portal-overviews';

export function PilgrimPortalPage() {
  return <PortalOverviewPage data={getPortalOverview('pilgrims')} />;
}
