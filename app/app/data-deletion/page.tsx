import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title:
    "Data Deletion Instructions | Jhyro AI",
  description:
    "How to disconnect integrations and request deletion of Jhyro AI data.",
}

const CONTACT_EMAIL =
  "galli.aiassistant@gmail.com"

export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-200">
      <article className="mx-auto max-w-4xl">
        <header className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
          <Link
            href="/"
            className="text-sm font-semibold text-blue-400 transition hover:text-blue-300"
          >
            ← Return to Jhyro AI
          </Link>

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Jhyro AI Legal
          </p>

          <h1 className="mt-3 text-4xl font-bold text-white">
            Data Deletion Instructions
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            You may request deletion of
            your Jhyro account, business
            information, customer data,
            messages, bookings, memories,
            and connected-integration
            information.
          </p>
        </header>

        <div className="mt-8 space-y-8">
          <Section title="1. Submit a deletion request">
            <p>
              Send an email from the
              address associated with your
              Jhyro account to:
            </p>

            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Jhyro%20AI%20Data%20Deletion%20Request`}
              className="inline-flex rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:bg-blue-400"
            >
              {CONTACT_EMAIL}
            </a>

            <p>
              Use the subject line:
            </p>

            <CodeText>
              Jhyro AI Data Deletion
              Request
            </CodeText>

            <p>
              Include:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                Your Jhyro account email.
              </li>

              <li>
                Your business name.
              </li>

              <li>
                The WhatsApp business
                number connected to Jhyro,
                if applicable.
              </li>

              <li>
                Whether you want the
                entire account deleted or
                only specific information
                or integrations removed.
              </li>
            </ul>

            <p>
              Do not send passwords,
              access tokens, refresh
              tokens, client secrets, API
              keys, payment-card numbers,
              or other private
              credentials.
            </p>
          </Section>

          <Section title="2. Identity verification">
            <p>
              To protect accounts and
              customer information, we may
              need to verify your identity
              and authority over the
              business before deleting
              information.
            </p>

            <p>
              Verification may include
              confirming the account email,
              business details, connected
              phone number, or another
              reasonable account detail.
            </p>

            <p>
              We will not request your
              password, complete
              payment-card number, Google
              access token, WhatsApp
              access token, or Supabase
              service-role key.
            </p>
          </Section>

          <Section title="3. Information covered by a deletion request">
            <p>
              Subject to the scope of your
              request and applicable legal
              requirements, deletion may
              include:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                Jhyro account and login
                information.
              </li>

              <li>
                Business name, contact
                details, address, hours,
                timezone, services, prices,
                booking policies, and AI
                settings.
              </li>

              <li>
                Business knowledge and
                training information.
              </li>

              <li>
                Customer names and
                telephone numbers.
              </li>

              <li>
                Customer messages and
                conversation history.
              </li>

              <li>
                Customer memories and
                conversation summaries.
              </li>

              <li>
                Booking records,
                appointment details,
                cancellations, and
                scheduling metadata.
              </li>

              <li>
                WhatsApp integration
                identifiers and stored
                credentials.
              </li>

              <li>
                Google Calendar
                connection details,
                authorization credentials,
                Calendar event identifiers,
                and synchronization
                metadata.
              </li>

              <li>
                Subscription identifiers
                and account-level billing
                status.
              </li>
            </ul>
          </Section>

          <Section title="4. Disconnecting Google Calendar">
            <p>
              You can immediately revoke
              Jhyro’s Google access from
              your Google Account:
            </p>

            <ol className="list-decimal space-y-2 pl-6">
              <li>
                Open your Google Account.
              </li>

              <li>
                Go to Security or
                third-party connections.
              </li>

              <li>
                Find Jhyro AI.
              </li>

              <li>
                Remove or revoke access.
              </li>
            </ol>

            <a
              href="https://myaccount.google.com/connections"
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-xl border border-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Open Google connections
            </a>

            <p>
              Revoking Google access
              prevents Jhyro from obtaining
              new access tokens, checking
              Calendar availability, or
              managing Calendar events.
            </p>

            <p>
              Revoking access through
              Google does not automatically
              delete Jhyro’s own booking
              records or previously
              created events. Email us if
              you also want related Jhyro
              data deleted.
            </p>
          </Section>

          <Section title="5. Deleting WhatsApp and Meta information">
            <p>
              To request deletion of
              WhatsApp-related information
              stored by Jhyro, email us
              with your Jhyro account
              email, business name, and
              connected WhatsApp business
              number.
            </p>

            <p>
              Where verified and legally
              eligible, we may remove
              stored WhatsApp integration
              identifiers, credentials,
              customer telephone numbers,
              messages, conversation
              history, memories, summaries,
              and related booking
              information.
            </p>

            <p>
              Deleting information from
              Jhyro does not necessarily
              delete information
              independently retained by
              Meta, WhatsApp, your
              customers, or the business
              owner’s devices and accounts.
              Those parties have their own
              deletion processes and legal
              obligations.
            </p>
          </Section>

          <Section title="6. Customer requests">
            <p>
              If you are a customer who
              communicated with a business
              that uses Jhyro, contact
              that business first. The
              business generally controls
              why its customer information
              is processed and may ask
              Jhyro to assist with the
              request.
            </p>

            <p>
              You may also contact us
              directly. Include the
              business name and telephone
              number used for the
              conversation so we can
              identify the correct
              business account.
            </p>

            <p>
              We may need to coordinate
              with the business and verify
              the requester’s identity
              before deleting customer
              information.
            </p>
          </Section>

          <Section title="7. Subscription cancellation">
            <p>
              A data-deletion request is
              separate from cancelling a
              recurring PayPal
              subscription.
            </p>

            <p>
              Before requesting complete
              account deletion, cancel the
              active subscription through
              PayPal or contact us for
              assistance.
            </p>

            <p>
              PayPal processes payment
              information independently.
              Deleting a Jhyro account
              does not automatically
              delete a PayPal account or
              all records PayPal is
              legally required to retain.
            </p>

            <a
              href="https://www.paypal.com/myaccount/autopay/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-xl border border-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Manage PayPal automatic
              payments
            </a>
          </Section>

          <Section title="8. Processing time">
            <p>
              We aim to acknowledge a
              verified deletion request
              within a reasonable period
              and complete eligible
              deletion from active systems
              within 30 days.
            </p>

            <p>
              A request may take longer
              where additional identity
              verification, business
              coordination, technical
              recovery, fraud review, or
              legal analysis is required.
              Where required, we will
              explain the delay.
            </p>
          </Section>

          <Section title="9. Information we may retain">
            <p>
              We may retain limited
              information where reasonably
              necessary or legally
              required, including:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                Payment, tax, accounting,
                and transaction records.
              </li>

              <li>
                Records needed to resolve
                disputes or enforce
                agreements.
              </li>

              <li>
                Security, fraud-prevention,
                and abuse records.
              </li>

              <li>
                Records required by a
                court order, law, or
                regulatory obligation.
              </li>

              <li>
                Temporary backup copies
                that are isolated from
                normal use and removed
                through the applicable
                backup cycle.
              </li>
            </ul>

            <p>
              Retained information will
              remain subject to appropriate
              safeguards and will not be
              used for unrelated purposes.
            </p>
          </Section>

          <Section title="10. Confirmation">
            <p>
              After completing an eligible
              request, we will send
              confirmation to the verified
              account email unless doing
              so is prohibited by law or
              would create a security
              risk.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              Sanjay Gallimore
              <br />
              Trading as Jhyro AI
              <br />
              Jamaica
            </p>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-semibold text-blue-400 hover:text-blue-300"
            >
              {CONTACT_EMAIL}
            </a>
          </Section>
        </div>

        <footer className="mt-12 border-t border-slate-800 pt-8 text-sm text-slate-500">
          <div className="flex flex-wrap gap-5">
            <Link
              href="/privacy"
              className="hover:text-white"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="hover:text-white"
            >
              Terms of Service
            </Link>

            <Link
              href="/data-deletion"
              className="hover:text-white"
            >
              Data Deletion
            </Link>
          </div>

          <p className="mt-5">
            © 2026 Jhyro AI. All rights
            reserved.
          </p>
        </footer>
      </article>
    </main>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <h2 className="text-xl font-bold text-white">
        {title}
      </h2>

      <div className="mt-4 space-y-4 leading-7 text-slate-300">
        {children}
      </div>
    </section>
  )
}

function CodeText({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-200">
      {children}
    </div>
  )
}