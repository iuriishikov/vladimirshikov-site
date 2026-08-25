import { Blog } from '@/widgets/blog'
import { Education } from '@/widgets/education'
import { Faq } from '@/widgets/faq'
import { Hero } from '@/widgets/hero'
import { Partners } from '@/widgets/partners'
import { Portrait } from '@/widgets/portrait'
import { Profile } from '@/widgets/profile'
import { Reviews } from '@/widgets/reviews'
import { SelectedWorks } from '@/widgets/selected-works'
import { Services } from '@/widgets/services'

/**
 * The portfolio, in the order the design lays it out.
 *
 * A view owns composition and nothing else: no data fetching, no business
 * logic, no styling beyond the order of the sections. Each section decides how
 * it looks; this file decides what the page is.
 */
export function HomeView() {
  return (
    <>
      <Hero />
      <Portrait />
      <Profile />
      <Education />
      <SelectedWorks />
      <Services />
      <Partners />
      <Reviews />
      <Faq />
      <Blog />
    </>
  )
}
