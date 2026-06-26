import { PortalOverviewPage } from '../components/guest/PortalOverviewPage';
import { getPortalOverview } from '../lib/portal-overviews';

export function HonoraryPortalPage() {
  return <PortalOverviewPage data={getPortalOverview('honorary')} />;
}
