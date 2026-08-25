import { cn } from '../../lib/cn'

interface SectionHeadingProps {
  title: string
  lead?: string
  /** Widen when the lead is long enough to look cramped at the default. */
  className?: string
}

/**
 * The centred title-and-lead block that opens five of the page's sections.
 *
 * It exists so those five stay in step: one change to the type scale here moves
 * every section at once, which is the difference between a rhythm and a
 * coincidence.
 */
export function SectionHeading({ title, lead, className }: SectionHeadingProps) {
  return (
    <div className={cn('mx-auto mb-14 max-w-[640px] text-center', className)}>
      <h2 className="text-[clamp(38px,5vw,64px)] leading-[1.04] font-bold tracking-[-0.03em]">
        {title}
      </h2>
      {lead !== undefined && (
        <p className="text-muted-foreground mx-auto mt-4 text-[15px] leading-[1.65]">{lead}</p>
      )}
    </div>
  )
}
