"use client"

import { useState } from "react"
import { supabase } from "./lib/supabase"

type Chat = {
  role: "user" | "ai"
  content: string
}

export default function Home() {
  const [message, setMessage] = useState("")
  const [chat, setChat] = useState<Chat[]>([])
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim()) return

    const userMessage = message
    setMessage("")

    // ADD USER MESSAGE TO UI
    const updatedChat = [
      ...chat,
      {
        role: "user" as const,
        content: userMessage,
      },
    ]

    setChat(updatedChat)

    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        // SEND MESSAGE + HISTORY
        body: JSON.stringify({
          message: userMessage,
          history: updatedChat,
        }),
      })

      const data = await res.json()

      // ADD AI RESPONSE
      setChat((prev) => [
        ...prev,
        {
          role: "ai",
          content: data.reply,
        },
      ])

      // OPTIONAL SAVE TO SUPABASE
      await supabase.from("chats").insert({
        role: "user",
        content: userMessage,
      })

      await supabase.from("chats").insert({
        role: "ai",
        content: data.reply,
      })
    } catch (err: any) {
      setChat((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Error: " + err.message,
        },
      ])
    }

    setLoading(false)
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <div style={styles.logo}>
            🤖 GalliAssist AI
          </div>

          <div style={styles.subtitle}>
            Business auto-reply assistant
          </div>
        </div>
      </div>

      {/* CHAT */}
      <div style={styles.chatBox}>
        {chat.length === 0 && (
          <div style={styles.empty}>
            Start chatting with GalliAssist AI
          </div>
        )}

        {chat.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.messageRow,
              justifyContent:
                msg.role === "user"
                  ? "flex-end"
                  : "flex-start",
            }}
          >
            <div
              style={{
                ...styles.message,
                backgroundColor:
                  msg.role === "user"
                    ? "#2563eb"
                    : "#1e293b",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={styles.typing}>
            GalliAssist is typing...
          </div>
        )}
      </div>

      {/* INPUT */}
      <div style={styles.inputBar}>
        <input
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter")
              sendMessage()
          }}
          placeholder="Message GalliAssist..."
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
  page: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#0f172a",
    color: "white",
    fontFamily: "Arial",
  },

  header: {
    padding: 15,
    borderBottom: "1px solid #1e293b",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    fontSize: 18,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 12,
    color: "#94a3b8",
  },

  chatBox: {
    flex: 1,
    padding: 20,
    overflowY: "auto",
  },

  messageRow: {
    display: "flex",
    marginBottom: 10,
  },

  message: {
    padding: "10px 14px",
    borderRadius: 12,
    maxWidth: "70%",
  },

  typing: {
    padding: 10,
    opacity: 0.7,
  },

  empty: {
    textAlign: "center",
    marginTop: 100,
    color: "#94a3b8",
  },

  inputBar: {
    display: "flex",
    padding: 15,
    borderTop: "1px solid #1e293b",
    gap: 10,
  },

  input: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #334155",
    backgroundColor: "#1e293b",
    color: "white",
  },

  button: {
    padding: "12px 16px",
    borderRadius: 10,
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
}