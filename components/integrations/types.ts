export type IntegrationProvider =
  | "whatsapp"
  | "instagram"
  | "messenger"
  | "telegram"
  | "sms"
  | "google_calendar"
  | "outlook_calendar"
  | "gmail"
  | "outlook"
  | "stripe"
  | "paypal"
  | "square"
  | "shopify"
  | "woocommerce"
  | "openai"
  | "anthropic"
  | "gemini"

export type IntegrationCategory =
  | "Communication"
  | "Scheduling"
  | "Email"
  | "Payments"
  | "Commerce"
  | "AI"

export type IntegrationRecord = {
  id?: string
  business_id?: string
  provider: string
  connected: boolean
  phone_number?: string | null
  phone_number_id?: string | null
  business_account_id?: string | null
  verify_token?: string | null
  access_token?: string | null
  metadata?: any
  created_at?: string | null
  updated_at?: string | null
}

export type IntegrationDefinition = {
  provider: IntegrationProvider
  name: string
  description: string
  category: IntegrationCategory
  icon: string
  statusLabel: string
  comingSoon?: boolean
}