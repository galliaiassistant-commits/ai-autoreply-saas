import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy | Jhyro AI",
  description:
    "How Jhyro AI collects, uses, stores, and protects personal information.",
}

const EFFECTIVE_DATE =
  "July 16, 2026"

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>

          <p className="mt-4 text-slate-400">
            Effective date:{" "}
            {EFFECTIVE_DATE}
          </p>
        </header>

        <div className="mt-8 space-y-8">
          <Section title="1. Who operates Jhyro AI">
            <p>
              Jhyro AI is operated by
              Sanjay Gallimore, trading as
              Jhyro AI, in Jamaica. In
              this Privacy Policy,
              “Jhyro,” “Jhyro AI,” “we,”
              “us,” and “our” refer to
              the operator of the Jhyro
              AI service.
            </p>

            <p>
              Privacy questions and
              requests may be sent to:
            </p>

            <a
              href="mailto:galli.aiassistant@gmail.com"
              className="font-semibold text-blue-400 hover:text-blue-300"
            >
              galli.aiassistant@gmail.com
            </a>
          </Section>

          <Section title="2. What Jhyro AI does">
            <p>
              Jhyro AI provides AI-powered
              business communication,
              customer-support, scheduling,
              memory, and automation
              services. Businesses may
              connect services such as
              WhatsApp and Google Calendar
              so Jhyro can answer customer
              messages, provide approved
              business information, and
              manage appointments.
            </p>

            <p>
              Businesses using Jhyro are
              responsible for their own
              relationships with their
              customers and for providing
              any privacy notices or
              obtaining any consents
              required by law.
            </p>
          </Section>

          <Section title="3. Information we collect">
            <Subsection title="Account information">
              <p>
                We may collect a business
                owner’s name, email
                address, login details,
                account identifiers,
                business name, telephone
                number, address, timezone,
                services, prices, opening
                hours, booking rules, and
                AI preferences.
              </p>
            </Subsection>

            <Subsection title="Customer and conversation information">
              <p>
                When a business uses Jhyro
                to communicate with its
                customers, we may process
                customer names, telephone
                numbers, message content,
                conversation history,
                inquiries, preferences,
                customer memories, and
                conversation summaries.
              </p>
            </Subsection>

            <Subsection title="Booking information">
              <p>
                We may process selected
                services, requested dates
                and times, appointment
                status, service duration,
                booking history,
                cancellation information,
                and related customer
                details.
              </p>
            </Subsection>

            <Subsection title="Integration information">
              <p>
                When a business connects
                an integration, we may
                process provider account
                identifiers, connection
                status, configuration
                details, authorization
                tokens, calendar
                identifiers, messaging
                identifiers, and
                synchronization metadata.
              </p>

              <p>
                Secret tokens are used to
                provide the requested
                integration and are not
                intentionally displayed
                publicly.
              </p>
            </Subsection>

            <Subsection title="Payment and subscription information">
              <p>
                We may receive subscription
                identifiers, plan names,
                payment status, payment
                dates, failed-payment
                notices, and billing-period
                information from PayPal.
                Jhyro does not intentionally
                store complete payment-card
                numbers.
              </p>
            </Subsection>

            <Subsection title="Technical information">
              <p>
                We and our service
                providers may process IP
                addresses, device and
                browser information,
                timestamps, request logs,
                error reports, security
                events, and information
                needed to maintain and
                protect the service.
              </p>
            </Subsection>
          </Section>

          <Section title="4. How we use information">
            <p>
              We may use information to:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                Create and manage Jhyro
                accounts.
              </li>

              <li>
                Respond to customer
                messages on behalf of a
                connected business.
              </li>

              <li>
                Answer questions using
                business-provided settings
                and knowledge.
              </li>

              <li>
                Create, update, prevent
                conflicts for, and manage
                appointments.
              </li>

              <li>
                Remember relevant customer
                details requested by the
                business.
              </li>

              <li>
                Synchronize Jhyro bookings
                with connected calendars.
              </li>

              <li>
                Process subscriptions and
                enforce billing status.
              </li>

              <li>
                Detect abuse, troubleshoot
                problems, and protect the
                service.
              </li>

              <li>
                Comply with legal
                obligations and enforce
                our agreements.
              </li>
            </ul>
          </Section>

          <Section title="5. Google Calendar data">
            <p>
              If a business connects
              Google Calendar, Jhyro may
              request permission to:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                Identify the connected
                Google account and
                calendar.
              </li>

              <li>
                Read free/busy information
                for the selected time
                range.
              </li>

              <li>
                Create, update, and delete
                calendar events associated
                with Jhyro bookings.
              </li>

              <li>
                Store the connected
                calendar identifier,
                authorization credentials,
                event identifiers, and
                synchronization status.
              </li>
            </ul>

            <p>
              Jhyro uses Google Calendar
              data only to provide and
              improve the user-facing
              scheduling and calendar
              synchronization features
              requested by the connected
              business.
            </p>

            <p>
              Jhyro does not use Google
              Calendar data for
              advertising, does not sell
              Google user data, and does
              not use Google Calendar data
              to train generalized AI or
              machine-learning models.
            </p>

            <p>
              Jhyro AI’s use and transfer
              to any other application of
              information received from
              Google APIs will adhere to
              the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-blue-400 hover:text-blue-300"
              >
                Google API Services User
                Data Policy
              </a>
              , including the Limited Use
              requirements.
            </p>

            <p>
              A user may revoke Google
              access through their Google
              Account permissions or
              request deletion by
              contacting us.
            </p>
          </Section>

          <Section title="6. WhatsApp and Meta data">
            <p>
              When a business connects
              WhatsApp, Jhyro may process
              WhatsApp Business Account
              identifiers, phone-number
              identifiers, access tokens,
              customer telephone numbers,
              incoming and outgoing
              messages, message
              timestamps, delivery
              information, and information
              needed to route messages to
              the correct business.
            </p>

            <p>
              This information is used to
              provide automated customer
              support, business
              information, booking, memory,
              and human-handoff features.
            </p>

            <p>
              Businesses must follow
              WhatsApp and Meta rules,
              including applicable
              customer opt-in requirements.
              Meta and WhatsApp process
              information under their own
              policies.
            </p>

            <a
              href="https://developers.facebook.com/documentation/business-messaging/whatsapp/data-privacy-and-security/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-blue-400 hover:text-blue-300"
            >
              Learn about WhatsApp data
              privacy and security
            </a>
          </Section>

          <Section title="7. Artificial intelligence processing">
            <p>
              Jhyro may send relevant
              message content, recent
              conversation history,
              business information,
              booking context, and customer
              details to OpenAI’s API to
              generate replies, identify
              booking details, summarize
              conversations, or extract
              useful memories.
            </p>

            <p>
              Jhyro is designed to send
              only information reasonably
              needed for the requested AI
              feature. Businesses should
              not ask customers to submit
              passwords, complete
              payment-card numbers,
              government identification
              numbers, medical records, or
              other unnecessary sensitive
              information through Jhyro.
            </p>

            <p>
              OpenAI states that API
              business data is not used to
              train its models by default
              unless the customer
              explicitly opts in.
            </p>

            <a
              href="https://openai.com/enterprise-privacy/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-blue-400 hover:text-blue-300"
            >
              Read about OpenAI business
              data privacy
            </a>
          </Section>

          <Section title="8. Service providers and disclosures">
            <p>
              We may disclose information
              to service providers when
              necessary to operate Jhyro,
              including:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                Supabase for database,
                authentication, and
                backend infrastructure.
              </li>

              <li>
                Vercel for application
                hosting, deployment, and
                operational services.
              </li>

              <li>
                OpenAI for AI-powered
                message and information
                processing.
              </li>

              <li>
                Meta and WhatsApp for
                connected business
                messaging.
              </li>

              <li>
                Google for authentication
                and connected Calendar
                services.
              </li>

              <li>
                PayPal for subscriptions,
                payments, and billing
                status.
              </li>
            </ul>

            <p>
              These providers may process
              information under their own
              agreements and privacy
              policies.
            </p>

            <p>
              PayPal may act as an
              independent controller for
              information it processes in
              connection with its payment
              services. Review the{" "}
              <a
                href="https://www.paypal.com/us/legalhub/paypal/privacy-full"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-blue-400 hover:text-blue-300"
              >
                PayPal Privacy Statement
              </a>
              .
            </p>
          </Section>

          <Section title="9. Legal bases and business instructions">
            <p>
              Depending on the applicable
              law and context, we process
              information to perform a
              contract, follow the
              instructions of a Jhyro
              business customer, obtain
              consent, comply with legal
              obligations, and pursue
              legitimate interests such as
              operating, securing, and
              improving the service.
            </p>

            <p>
              For customer conversations
              processed on behalf of a
              business, that business
              generally determines why and
              how the information is used.
              Jhyro generally acts as a
              service provider or
              processor for that business.
            </p>
          </Section>

          <Section title="10. Data retention">
            <p>
              We retain account,
              integration, customer,
              conversation, memory, and
              booking information for as
              long as reasonably necessary
              to provide Jhyro, maintain
              the business account, comply
              with legal obligations,
              resolve disputes, and protect
              the service.
            </p>

            <p>
              Google authorization tokens
              are retained while the
              Calendar connection remains
              active. A user may revoke
              access or request deletion.
            </p>

            <p>
              When an account or eligible
              information is deleted, we
              aim to remove it from active
              systems within 30 days,
              subject to legal,
              security, fraud-prevention,
              backup, and technical
              requirements. Billing
              records may be retained for
              the period required by
              applicable tax, accounting,
              and payment laws.
            </p>
          </Section>

          <Section title="11. Security">
            <p>
              We use reasonable technical
              and organizational measures
              intended to protect
              information, including
              access controls, protected
              server-side credentials,
              encrypted network
              connections, authentication,
              and separation of business
              records.
            </p>

            <p>
              No internet service is
              completely secure. Users
              must protect their login
              credentials and immediately
              report suspected
              unauthorized access.
            </p>
          </Section>

          <Section title="12. International processing">
            <p>
              Jhyro and its service
              providers may process
              information in Jamaica, the
              United States, and other
              countries where our service
              providers operate. Those
              countries may have different
              data-protection laws from
              the user’s country.
            </p>
          </Section>

          <Section title="13. Your rights and choices">
            <p>
              Depending on applicable law,
              individuals may have rights
              to request access,
              correction, deletion,
              restriction, portability, or
              objection regarding their
              personal information.
            </p>

            <p>
              A customer of a business
              using Jhyro should normally
              contact that business first.
              The business may ask Jhyro
              to assist with the request.
            </p>

            <p>
              Requests may also be sent to{" "}
              <a
                href="mailto:galli.aiassistant@gmail.com"
                className="font-semibold text-blue-400 hover:text-blue-300"
              >
                galli.aiassistant@gmail.com
              </a>
              . We may need to verify the
              requester’s identity and
              authority before completing
              a request.
            </p>

            <Link
              href="/data-deletion"
              className="inline-flex font-semibold text-blue-400 hover:text-blue-300"
            >
              View data-deletion
              instructions →
            </Link>
          </Section>

          <Section title="14. Children and account eligibility">
            <p>
              Jhyro business-owner accounts
              are intended for individuals
              who are at least 18 years
              old. Jhyro is not directed
              to children, and businesses
              must not knowingly use Jhyro
              to collect children’s
              information without an
              appropriate legal basis and
              any required parental or
              guardian consent.
            </p>
          </Section>

          <Section title="15. Sale of information and advertising">
            <p>
              Jhyro does not sell personal
              information or Google user
              data. Jhyro does not use
              connected Google Calendar
              data or private WhatsApp
              message content for targeted
              advertising.
            </p>
          </Section>

          <Section title="16. Changes to this policy">
            <p>
              We may update this Privacy
              Policy as Jhyro changes or
              legal requirements evolve.
              We will update the effective
              date and provide additional
              notice when required.
            </p>
          </Section>

          <Section title="17. Contact">
            <p>
              Sanjay Gallimore
              <br />
              Trading as Jhyro AI
              <br />
              Jamaica
            </p>

            <a
              href="mailto:galli.aiassistant@gmail.com"
              className="font-semibold text-blue-400 hover:text-blue-300"
            >
              galli.aiassistant@gmail.com
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

function Subsection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="font-semibold text-white">
        {title}
      </h3>

      <div className="mt-2 space-y-3">
        {children}
      </div>
    </div>
  )
}