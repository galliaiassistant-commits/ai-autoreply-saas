type Props = {
  message: string
  setMessage: any
  sendMessage: () => void
}

export default function ChatInput({
  message,
  setMessage,
  sendMessage,
}: Props) {
  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <input
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage()
            }
          }}
          placeholder="Message Jhyro AI..."
          style={styles.input}
        />

        <button
          onClick={sendMessage}
          style={styles.button}
        >
          Send
        </button>
      </div>
    </div>
  )
}

const styles: any = {
  container: {
    padding: 20,
    borderTop:
      "1px solid #1e293b",
    backgroundColor: "#0f172a",
  },

  wrapper: {
    display: "flex",
    gap: 12,
    maxWidth: 900,
    margin: "0 auto",
  },

  input: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    border: "1px solid #334155",
    backgroundColor: "#1e293b",
    color: "white",
    fontSize: 15,
    outline: "none",
  },

  button: {
    padding: "0 22px",
    borderRadius: 14,
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: 15,
  },
}