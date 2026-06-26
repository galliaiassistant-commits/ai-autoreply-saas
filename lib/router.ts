export function shouldUseMainAI(action: string) {
  return ![
    "greeting",
    "thank_you",
    "goodbye",
  ].includes(action)
}

export function shouldUseBooking(action: string) {
  return [
    "book_appointment",
    "confirm_booking",
    "reschedule_booking",
  ].includes(action)
}

export function getQuickReply(
  action: string,
  customerName?: string | null
) {
  const name = customerName || "there"

  const replies: Record<string, string> = {
    greeting: `Hi ${name}! How can I help you today?`,
    thank_you: `You're welcome, ${name}! 😊`,
    goodbye: "Goodbye! Have a great day! 👋",
  }

  return replies[action] || null
}