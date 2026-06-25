import OpenAI from "openai"

export async function detectAction(
  openai: OpenAI,
  userText: string
) {
  const actionResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You classify customer messages.

Return ONLY valid JSON.

Possible actions:

book_appointment
cancel_booking
reschedule_booking
confirm_booking
business_question
pricing_question
opening_hours
greeting
goodbye
thank_you
complaint
human_support
general_chat

Return:
{
  "action": "general_chat"
}
`,
      },
      {
        role: "user",
        content: userText,
      },
    ],
  })

  try {
    const result = JSON.parse(
      actionResponse.choices[0].message.content || "{}"
    )

    console.log("ACTION:", result.action)

    return result.action || "general_chat"
  } catch {
    return "general_chat"
  }
}