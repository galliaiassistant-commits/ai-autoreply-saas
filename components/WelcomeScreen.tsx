export default function WelcomeScreen() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        Welcome to Jhyro AI
      </h1>

      <p style={styles.subtitle}>
        Start a conversation with your AI assistant.
      </p>
    </div>
  )
}

const styles: any = {
  container: {
    textAlign: "center",
    marginTop: 120,
    color: "white",
  },

  title: {
    fontSize: 42,
    marginBottom: 12,
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 18,
  },
}