import { PortalOverviewPage } from '../components/guest/PortalOverviewPage';
import { getPortalOverview } from '../lib/portal-overviews';

export function MawkibOwnerPortalPage() {
  return <PortalOverviewPage data={getPortalOverview('mawkib-owners')} />;
}
