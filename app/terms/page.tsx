import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service | Jhyro AI",
  description:
    "Terms governing access to and use of Jhyro AI.",
}

const EFFECTIVE_DATE =
  "July 16, 2026"

export default function TermsPage() {
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
            Terms of Service
          </h1>

          <p className="mt-4 text-slate-400">
            Effective date:{" "}
            {EFFECTIVE_DATE}
          </p>
        </header>

        <div className="mt-8 space-y-8">
          <Section title="1. Agreement to these Terms">
            <p>
              These Terms of Service
              (“Terms”) govern access to
              and use of Jhyro AI,
              including its website,
              dashboard, artificial
              intelligence features,
              messaging integrations,
              booking tools, calendar
              integrations, subscription
              services, and related
              features.
            </p>

            <p>
              Jhyro AI is operated by
              Sanjay Gallimore, trading as
              Jhyro AI, in Jamaica.
              References to “Jhyro,”
              “Jhyro AI,” “we,” “us,” or
              “our” refer to the operator
              of the service.
            </p>

            <p>
              By creating an account,
              connecting an integration,
              purchasing a subscription,
              or otherwise using Jhyro,
              you agree to these Terms and
              our{" "}
              <Link
                href="/privacy"
                className="font-semibold text-blue-400 hover:text-blue-300"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <p>
              If you do not agree, do not
              access or use Jhyro.
            </p>
          </Section>

          <Section title="2. Eligibility and authority">
            <p>
              Business-owner accounts are
              intended for individuals who
              are at least 18 years old
              and legally capable of
              entering into a binding
              agreement.
            </p>

            <p>
              If you use Jhyro for a
              company, organization, or
              another person, you represent
              that you have authority to
              accept these Terms and
              connect accounts and data on
              their behalf.
            </p>

            <p>
              You must provide accurate
              account and business
              information and keep it
              current.
            </p>
          </Section>

          <Section title="3. The Jhyro service">
            <p>
              Jhyro is an AI-powered
              business assistant intended
              to help businesses:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                Respond to customer
                messages.
              </li>

              <li>
                Provide business-approved
                information.
              </li>

              <li>
                Capture customer details
                and conversation history.
              </li>

              <li>
                Create and manage
                appointment requests.
              </li>

              <li>
                Check business hours,
                availability, booking
                conflicts, and connected
                calendars.
              </li>

              <li>
                Store relevant customer
                preferences and summaries.
              </li>

              <li>
                Connect supported
                third-party messaging,
                calendar, payment, and
                infrastructure services.
              </li>
            </ul>

            <p>
              Features may change, be
              improved, be limited, or be
              discontinued over time.
            </p>
          </Section>

          <Section title="4. Artificial intelligence limitations">
            <p>
              Jhyro uses artificial
              intelligence and automated
              rules. AI-generated content
              can sometimes be inaccurate,
              incomplete, delayed, or
              unsuitable for a particular
              situation.
            </p>

            <p>
              You are responsible for
              reviewing your business
              settings, knowledge, services,
              prices, hours, policies, and
              automated responses.
            </p>

            <p>
              Jhyro must not be relied
              upon as a substitute for
              professional legal, medical,
              financial, emergency, or
              other regulated advice.
            </p>

            <p>
              You must provide a practical
              way for customers to contact
              a human when appropriate.
            </p>
          </Section>

          <Section title="5. Your business information">
            <p>
              You are responsible for the
              accuracy and legality of all
              information you submit to
              Jhyro, including business
              names, addresses, contact
              information, hours, services,
              prices, availability, booking
              policies, AI instructions,
              and business knowledge.
            </p>

            <p>
              You authorize Jhyro to use
              that information to provide
              responses and services to
              you and your customers.
            </p>

            <p>
              Jhyro is not responsible for
              losses caused by incorrect,
              outdated, incomplete, or
              misleading information
              supplied by you.
            </p>
          </Section>

          <Section title="6. Customer data and privacy responsibilities">
            <p>
              Businesses using Jhyro
              determine which customer
              information is submitted and
              how it is used. You are
              responsible for:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                Having a lawful basis to
                collect and process
                customer information.
              </li>

              <li>
                Providing any legally
                required privacy notices.
              </li>

              <li>
                Obtaining any legally
                required consents.
              </li>

              <li>
                Responding to customer
                privacy and data-rights
                requests.
              </li>

              <li>
                Avoiding unnecessary
                collection of sensitive
                information.
              </li>

              <li>
                Using Jhyro only for
                lawful business purposes.
              </li>
            </ul>

            <p>
              You must not instruct
              customers to send passwords,
              complete payment-card
              numbers, government account
              credentials, or other
              unnecessary highly sensitive
              information through Jhyro.
            </p>
          </Section>

          <Section title="7. WhatsApp and messaging responsibilities">
            <p>
              If you connect WhatsApp or
              another messaging service,
              you represent that you have
              permission to connect and
              use the applicable business
              account, telephone number,
              credentials, and customer
              data.
            </p>

            <p>
              You must follow all
              applicable messaging rules,
              including WhatsApp and Meta
              terms, messaging policies,
              template rules, customer
              opt-in requirements,
              marketing restrictions, and
              anti-spam laws.
            </p>

            <p>
              You must not use Jhyro to
              send unsolicited bulk
              messages, deceptive
              promotions, harassment, or
              unlawful communications.
            </p>

            <p>
              Meta, WhatsApp, or another
              provider may restrict,
              suspend, or terminate an
              account independently of
              Jhyro. We do not control
              those decisions.
            </p>
          </Section>

          <Section title="8. Google Calendar">
            <p>
              If you connect Google
              Calendar, you authorize
              Jhyro to use the permissions
              you approve to check
              free/busy availability and
              create, update, or delete
              events associated with
              Jhyro bookings.
            </p>

            <p>
              You represent that you have
              authority to connect the
              selected Google account and
              calendar.
            </p>

            <p>
              You remain responsible for
              checking appointments,
              Calendar events, availability,
              timezones, service durations,
              and scheduling accuracy.
            </p>

            <p>
              Calendar synchronization may
              be delayed or fail because
              of expired permissions,
              service outages, incorrect
              settings, revoked access, or
              third-party changes.
            </p>

            <p>
              You may revoke Jhyro’s
              Google access through your
              Google Account settings or
              request disconnection and
              deletion.
            </p>
          </Section>

          <Section title="9. Accounts and security">
            <p>
              You are responsible for
              maintaining the
              confidentiality of your
              account, password, connected
              accounts, access tokens, and
              other credentials.
            </p>

            <p>
              You must promptly notify us
              if you suspect unauthorized
              access, credential exposure,
              account compromise, or
              misuse.
            </p>

            <p>
              You are responsible for
              activity conducted through
              your account unless
              applicable law provides
              otherwise.
            </p>

            <p>
              You must never publish or
              share API keys, access
              tokens, refresh tokens,
              service-role keys, client
              secrets, or other private
              credentials.
            </p>
          </Section>

          <Section title="10. Subscriptions and payments">
            <p>
              Some Jhyro features require
              a paid subscription.
              Available plans, features,
              prices, and billing periods
              are displayed before
              purchase and may change for
              future billing periods.
            </p>

            <p>
              Payments and subscriptions
              are currently processed
              through PayPal. PayPal may
              apply its own terms,
              policies, currency
              conversions, restrictions,
              and payment decisions.
            </p>

            <p>
              By purchasing a subscription,
              you authorize PayPal and
              Jhyro to process recurring
              charges according to the
              selected plan until
              cancellation.
            </p>

            <p>
              You are responsible for
              keeping your payment method
              and billing information
              current.
            </p>
          </Section>

          <Section title="11. Failed payments and grace period">
            <p>
              If a subscription payment
              fails or becomes overdue,
              Jhyro may mark the account
              as payment due and provide a
              seven-day grace period.
            </p>

            <p>
              During the grace period,
              Jhyro may continue providing
              AI replies while displaying
              billing warnings.
            </p>

            <p>
              If payment remains unpaid
              after the grace period,
              Jhyro may suspend AI replies,
              booking automation, memory
              processing, summaries, and
              other paid features until
              payment is restored.
            </p>

            <p>
              Successful payment may
              reactivate suspended
              features automatically.
            </p>
          </Section>

          <Section title="12. Cancellation and refunds">
            <p>
              You may cancel a subscription
              through the available PayPal
              subscription controls or by
              contacting us.
            </p>

            <p>
              Cancellation normally
              prevents future recurring
              charges. Access may continue
              until the end of the
              applicable paid billing
              period unless otherwise
              stated.
            </p>

            <p>
              Fees already charged are
              generally non-refundable
              except where required by
              applicable law, required by
              PayPal’s rules, or expressly
              agreed by Jhyro.
            </p>
          </Section>

          <Section title="13. Acceptable use">
            <p>
              You must not use Jhyro to:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                Violate any law,
                regulation, court order,
                or third-party right.
              </li>

              <li>
                Engage in fraud,
                impersonation, deception,
                phishing, or credential
                theft.
              </li>

              <li>
                Send spam or communications
                without required consent.
              </li>

              <li>
                Harass, threaten, exploit,
                or discriminate against
                another person.
              </li>

              <li>
                Distribute malware or
                interfere with systems,
                networks, or accounts.
              </li>

              <li>
                Attempt to bypass billing,
                security, access controls,
                rate limits, or account
                restrictions.
              </li>

              <li>
                Reverse engineer, scrape,
                copy, resell, or misuse
                Jhyro except where
                expressly permitted.
              </li>

              <li>
                Process unlawful,
                unnecessary, or
                improperly obtained
                sensitive information.
              </li>

              <li>
                Use Jhyro for emergency
                dispatch, life-critical
                decisions, or high-risk
                regulated decisions
                without appropriate human
                oversight.
              </li>
            </ul>
          </Section>

          <Section title="14. Third-party services">
            <p>
              Jhyro depends on third-party
              services, which may include
              Meta, WhatsApp, Google,
              OpenAI, Supabase, Vercel,
              and PayPal.
            </p>

            <p>
              Your use of those services
              may also be governed by
              their own terms and privacy
              policies.
            </p>

            <p>
              Jhyro is not responsible for
              third-party outages,
              suspensions, policy changes,
              data practices, account
              decisions, pricing changes,
              or service discontinuation.
            </p>
          </Section>

          <Section title="15. Ownership and licences">
            <p>
              Jhyro and its software,
              designs, branding,
              documentation, and original
              service content are owned by
              or licensed to Jhyro and are
              protected by applicable
              intellectual-property laws.
            </p>

            <p>
              You retain ownership of the
              business information and
              content you submit, subject
              to the rights of your
              customers and other parties.
            </p>

            <p>
              You grant Jhyro a limited,
              non-exclusive licence to
              host, process, transmit,
              reproduce, and use submitted
              content only as reasonably
              necessary to provide,
              secure, maintain, and improve
              the contracted service.
            </p>
          </Section>

          <Section title="16. Feedback">
            <p>
              If you voluntarily provide
              suggestions or feedback, you
              permit Jhyro to use that
              feedback without restriction
              or compensation, provided
              that we do not publicly
              identify you without
              permission.
            </p>
          </Section>

          <Section title="17. Suspension and termination">
            <p>
              We may restrict, suspend, or
              terminate access when:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                Payments remain overdue.
              </li>

              <li>
                These Terms or applicable
                laws are violated.
              </li>

              <li>
                Use creates security,
                legal, operational, or
                reputational risk.
              </li>

              <li>
                A third-party provider
                requires action.
              </li>

              <li>
                The service is abused or
                used fraudulently.
              </li>
            </ul>

            <p>
              Where reasonably practical,
              we may provide notice and an
              opportunity to correct the
              issue.
            </p>

            <p>
              You may stop using Jhyro and
              request account deletion,
              subject to outstanding
              payments and legally required
              retention.
            </p>
          </Section>

          <Section title="18. Service availability">
            <p>
              Jhyro is provided on an
              “as available” basis. We do
              not guarantee uninterrupted,
              error-free, or completely
              secure operation.
            </p>

            <p>
              Maintenance, internet
              failures, third-party
              outages, API limits, expired
              credentials, software errors,
              and events outside our
              reasonable control may
              affect availability.
            </p>
          </Section>

          <Section title="19. Disclaimer of warranties">
            <p>
              To the fullest extent
              permitted by applicable law,
              Jhyro is provided without
              warranties of any kind,
              whether express, implied, or
              statutory, including implied
              warranties of
              merchantability, fitness for
              a particular purpose,
              non-infringement, accuracy,
              or availability.
            </p>

            <p>
              Nothing in these Terms
              excludes a warranty or right
              that cannot lawfully be
              excluded.
            </p>
          </Section>

          <Section title="20. Limitation of liability">
            <p>
              To the fullest extent
              permitted by applicable law,
              Jhyro will not be liable for
              indirect, incidental,
              special, consequential,
              exemplary, or punitive
              damages, or for lost profits,
              revenue, data, goodwill,
              customers, opportunities, or
              business interruption.
            </p>

            <p>
              To the fullest extent
              permitted by law, Jhyro’s
              total liability arising from
              or relating to the service
              will not exceed the amount
              you paid to Jhyro during the
              three months immediately
              before the event giving rise
              to the claim.
            </p>

            <p>
              These limitations do not
              apply where liability cannot
              legally be limited or
              excluded.
            </p>
          </Section>

          <Section title="21. Indemnity">
            <p>
              To the extent permitted by
              law, you agree to defend,
              indemnify, and hold Jhyro
              harmless from third-party
              claims, losses, liabilities,
              and reasonable expenses
              arising from your unlawful
              use of Jhyro, your violation
              of these Terms, your business
              content, your customer
              communications, or your
              violation of another
              person’s rights.
            </p>
          </Section>

          <Section title="22. Governing law and disputes">
            <p>
              These Terms are governed by
              the laws of Jamaica, without
              regard to conflict-of-law
              principles.
            </p>

            <p>
              Before filing a formal claim,
              you agree to contact us and
              attempt in good faith to
              resolve the dispute
              informally.
            </p>

            <p>
              Subject to any mandatory
              consumer rights or
              jurisdictional requirements,
              disputes will be submitted
              to the courts of competent
              jurisdiction in Jamaica.
            </p>
          </Section>

          <Section title="23. Changes to these Terms">
            <p>
              We may update these Terms as
              Jhyro changes or legal
              requirements evolve.
            </p>

            <p>
              We will update the effective
              date and provide additional
              notice where required.
              Continued use after an
              updated version takes effect
              constitutes acceptance to
              the extent permitted by law.
            </p>
          </Section>

          <Section title="24. General provisions">
            <p>
              If any provision is found
              unenforceable, the remaining
              provisions will continue in
              effect.
            </p>

            <p>
              Failure to enforce a
              provision is not a waiver of
              that provision.
            </p>

            <p>
              You may not assign your
              rights or obligations under
              these Terms without our
              written permission. Jhyro
              may assign these Terms as
              part of a reorganization,
              financing, merger,
              acquisition, or sale of the
              service, subject to
              applicable law.
            </p>

            <p>
              These Terms and the Privacy
              Policy form the agreement
              between you and Jhyro
              regarding the service,
              unless another written
              agreement applies.
            </p>
          </Section>

          <Section title="25. Contact">
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