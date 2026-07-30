export function getAuthError(
  message: string
) {
  if (
    message.includes(
      "Invalid login credentials"
    )
  ) {
    return "Incorrect email or password."
  }

  if (
    message.includes(
      "Email not confirmed"
    )
  ) {
    return "Please verify your email before signing in."
  }

  if (
    message.includes(
      "already registered"
    )
  ) {
    return "An account with this email already exists."
  }

  if (
    message.includes(
      "Password should be at least"
    )
  ) {
    return "Password is too short."
  }

  if (
    message.includes("Failed to fetch")
  ) {
    return "Unable to connect. Check your internet connection and try again."
  }

  if (
    message.includes(
      "Network request failed"
    )
  ) {
    return "Unable to connect. Please try again."
  }

  return message
}