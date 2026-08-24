'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  isSubscriptionErrorKey,
  subscriptionSchema,
  type SubscriptionErrorKey,
  type SubscriptionInput,
} from '@/entities/subscription'
import { cn } from '@/shared/lib/cn'
import { Button, Input, Label } from '@/shared/ui'

import { subscribe } from '../api/subscribe'

interface ContactFormProps {
  className?: string
}

export function ContactForm({ className }: ContactFormProps) {
  const t = useTranslations('ContactForm')
  const emailId = useId()
  const errorId = useId()
  const [succeeded, setSucceeded] = useState(false)

  // The schema emits keys; translating them here is what keeps the entity layer
  // free of any knowledge about languages.
  const validationMessages: Record<SubscriptionErrorKey, string> = {
    emailRequired: t('validation.emailRequired'),
    emailInvalid: t('validation.emailInvalid'),
    emailTooLong: t('validation.emailTooLong'),
  }

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionInput>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: { email: '' },
  })

  const errorKey = errors.email?.message
  const errorMessage =
    errorKey !== undefined && isSubscriptionErrorKey(errorKey)
      ? validationMessages[errorKey]
      : errorKey
  const hasError = errorMessage !== undefined

  const onSubmit = handleSubmit(async (values) => {
    setSucceeded(false)
    const result = await subscribe(values)

    if (result.status === 'success') {
      setSucceeded(true)
      reset()
      toast.success(t('success'))
      return
    }

    if (result.status === 'invalid') {
      setError('email', { message: result.errorKey }, { shouldFocus: true })
      return
    }

    toast.error(t('unexpectedError'))
  })

  return (
    <section
      data-testid="contact-form"
      className={cn('bg-card border-border rounded-xl border p-6 shadow-sm', className)}
    >
      <h2 className="text-lg font-semibold">{t('title')}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{t('description')}</p>

      <form onSubmit={onSubmit} noValidate className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Label htmlFor={emailId} className="sr-only">
            {t('emailLabel')}
          </Label>
          <Input
            id={emailId}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t('emailPlaceholder')}
            data-testid="contact-form-email"
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : undefined}
            {...register('email')}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} data-testid="contact-form-submit">
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>
      </form>

      {/* role="alert" makes a screen reader announce the problem the moment it
          appears, without moving focus away from the field. */}
      {errorMessage !== undefined && (
        <p
          id={errorId}
          role="alert"
          data-testid="contact-form-error"
          className="text-destructive mt-2 text-sm"
        >
          {errorMessage}
        </p>
      )}

      {succeeded && (
        <p role="status" data-testid="contact-form-success" className="mt-2 text-sm text-green-600">
          {t('success')}
        </p>
      )}
    </section>
  )
}
