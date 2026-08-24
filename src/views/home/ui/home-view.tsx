import { Hero } from '@/widgets/hero'
import { ContactForm } from '@/features/contact-form'
import { StatusBadge } from '@/features/health-status'
import { AuthorCard } from '@/entities/author'
import { Container } from '@/shared/ui'

/**
 * The home page as a composition of lower layers. A view owns layout and
 * composition only — no business logic, no data fetching of its own.
 */
export function HomeView() {
  return (
    <>
      <Hero />

      <Container className="grid gap-6 pb-20 md:grid-cols-2">
        <AuthorCard />

        <div className="flex flex-col gap-6">
          <StatusBadge />
          <ContactForm />
        </div>
      </Container>
    </>
  )
}
