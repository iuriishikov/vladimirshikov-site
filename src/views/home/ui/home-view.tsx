import { Blog } from '@/widgets/blog'
import { Education } from '@/widgets/education'
import { Hero } from '@/widgets/hero'
import { Partners } from '@/widgets/partners'
import { Portrait } from '@/widgets/portrait'
import { Profile } from '@/widgets/profile'
import { Questions } from '@/widgets/questions'
import { SelectedWorks } from '@/widgets/selected-works'
import { Services } from '@/widgets/services'

/**
 * The page, in the order the source material argues it.
 *
 * Who this is → when he is useful → what he does → at what scale → for whom →
 * where he trained → what he writes. That order is the argument, not the
 * canvas's: the drawing put the work before the offer, which reads as a
 * portfolio rather than as a case.
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
      <Questions />
      <Services />
      <SelectedWorks />
      <Partners />
      <Education />
      <Blog />
    </>
  )
}
