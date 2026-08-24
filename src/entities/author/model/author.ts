import { siteConfig } from '@/shared/config/site'

import type { Author } from './types'

export const author: Author = {
  name: siteConfig.name,
  initials: 'VS',
  since: 2016,
  links: [{ label: 'GitHub', href: siteConfig.links.github }],
}
