import type { BusinessItem } from '../../../../shared/types/messages'

export function formatBusinessLabel(business: BusinessItem): string {
  return business.address ? `${business.name} — ${business.address}` : business.name
}
