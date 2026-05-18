"use client"

import { useEffect, useState } from "react"
import { useUser, SignInButton } from "@clerk/nextjs"
import { supabase } from "./../lib/supabase"

type Chat = {
  role: string
  content: string
}

export default function Dashboard() {
  const { user, isSignedIn } = useUser()
  const [chats, setChats] = useState<Chat[]>([])

  useEffect(() => {
    const loadChats = async () => {
      if (!user?.id) return

      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("user_id", user.id)

      if (data && !error) {
        setChats(data)
      }
    }

    if (user?.id) loadChats()
  }, [user])

  // 📊 ANALYTICS CALCULATION
  const totalMessages = chats.length
  const userMessages = chats.filter((c) => c.role === "user").length
  const aiMessages = chats.filter((c) => c.role === "ai").length

  if (!isSignedIn) {
    return (
      <div style={styles.center}>
        <h2>Please sign in</h2>
        <SignInButton />
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>📊 Analytics Dashboard</h1>

      <p style={styles.subtitle}>
        Welcome {user?.firstName || "User"}
      </p>

      {/* ANALYTICS CARDS */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>💬 Total Messages</h3>
          <p style={styles.number}>{totalMessages}</p>
        </div>

        <div style={styles.card}>
          <h3>👤 User Messages</h3>
          <p style={styles.number}>{userMessages}</p>
        </div>

        <div style={styles.card}>
          <h3>🤖 AI Responses</h3>
          <p style={styles.number}>{aiMessages}</p>
        </div>
      </div>

      {/* CHAT LOG */}
      <div style={styles.chatBox}>
        <h3>🧾 Recent Activity</h3>

        {chats.length === 0 ? (
          <p>No activity yet.</p>
        ) : (
          chats.slice(0, 10).map((chat, i) => (
            <div key={i} style={styles.chatItem}>
              <b>{chat.role}</b>: {chat.content}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const styles: any = {
  page: {
    padding: 30,
    backgroundColor: "#0f172a",
    minHeight: "100vh",
    color: "white",
    fontFamily: "Arial",
  },

  title: {
    fontSize: 28,
    marginBottom: 10,
  },

  subtitle: {
    color: "#94a3b8",
    marginBottom: 20,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 15,
    marginBottom: 30,
  },

  card: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 12,
  },

  number: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
  },

  chatBox: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 12,
  },

  chatItem: {
    padding: 10,
    borderBottom: "1px solid #334155",
  },

  center: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    backgroundColor: "#0f172a",
  },
}