"use client"

import {
  useEffect,
  useRef,
  useState,
} from "react"

import ChatInput from "@/components/ChatInput"
import ChatMessage from "@/components/ChatMessage"
import Sidebar from "@/components/Sidebar"
import TypingIndicator from "@/components/TypingIndicator"
import WelcomeScreen from "@/components/WelcomeScreen"

import { styles } from "@/styles/chat"

type ChatMessageType = {
  role: "user" | "assistant"
  content: string
}

type Conversation = {
  title: string
  messages: ChatMessageType[]
}

export default function Home() {
  const [mounted, setMounted] =
    useState(false)

  const [message, setMessage] =
    useState("")

    const [sidebarOpen, setSidebarOpen] =
  useState(false)

  const [loading, setLoading] =
    useState(false)

  const [conversations, setConversations] =
    useState<Conversation[]>([
      {
        title: "New Chat",
        messages: [],
      },
    ])

  const [currentChat, setCurrentChat] =
    useState(0)

  const bottomRef =
    useRef<HTMLDivElement>(null)

  // FIX HYDRATION
  useEffect(() => {
    setMounted(true)

    const savedConversations =
      localStorage.getItem(
        "galli-conversations"
      )

    const savedCurrentChat =
      localStorage.getItem(
        "galli-current-chat"
      )

    if (savedConversations) {
      setConversations(
        JSON.parse(savedConversations)
      )
    }

    if (savedCurrentChat) {
      setCurrentChat(
        Number(savedCurrentChat)
      )
    }
  }, [])

  // SAVE CONVERSATIONS
  useEffect(() => {
    if (!mounted) return

    localStorage.setItem(
      "galli-conversations",
      JSON.stringify(conversations)
    )
  }, [conversations, mounted])

  // SAVE CURRENT CHAT
  useEffect(() => {
    if (!mounted) return

    localStorage.setItem(
      "galli-current-chat",
      String(currentChat)
    )
  }, [currentChat, mounted])

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [conversations])

  const currentConversation =
    conversations[currentChat]

  // NEW CHAT
  const createNewChat = () => {
    setConversations((prev) => [
      ...prev,
      {
        title: "New Chat",
        messages: [],
      },
    ])

    setCurrentChat(conversations.length)
  }

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!message.trim()) return

    const userMessage = message

    setMessage("")

    const updatedMessages = [
      ...currentConversation.messages,

      {
        role: "user" as const,
        content: userMessage,
      },
    ]

    const updatedConversations = [
      ...conversations,
    ]

    updatedConversations[currentChat] = {
      ...currentConversation,

      title:
        currentConversation.title ===
        "New Chat"
          ? userMessage.slice(0, 25)
          : currentConversation.title,

      messages: updatedMessages,
    }

    setConversations(updatedConversations)

    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: userMessage,
          history: updatedMessages,
        }),
      })

      if (!res.body) return

      const reader = res.body.getReader()

      const decoder = new TextDecoder()

      let aiResponse = ""

      updatedConversations[
        currentChat
      ].messages.push({
        role: "assistant",
        content: "",
      })

      setConversations([
        ...updatedConversations,
      ])

      while (true) {
        const { done, value } =
          await reader.read()

        if (done) break

        const chunk =
          decoder.decode(value)

        aiResponse += chunk

        updatedConversations[
          currentChat
        ].messages[
          updatedConversations[
            currentChat
          ].messages.length - 1
        ] = {
          role: "assistant",
          content: aiResponse,
        }

        setConversations([
          ...updatedConversations,
        ])
      }
    } catch (err: any) {
      console.error(err)
    }

    setLoading(false)
  }

  if (!mounted) {
    return null
  }

  return (
    <div style={styles.page}>
      <Sidebar
  chats={conversations.map(
    (c) => c.title
  )}
  currentChat={currentChat}
  setCurrentChat={setCurrentChat}
  createNewChat={createNewChat}
  sidebarOpen={sidebarOpen}
  setSidebarOpen={setSidebarOpen}
/>

      <div style={styles.main}>
        <div style={styles.chatArea}>
          {currentConversation
            ?.messages.length === 0 && (
            <WelcomeScreen />
          )}

<div style={styles.topBar}>
  <button
    onClick={() =>
      setSidebarOpen(true)
    }
    style={styles.menuButton}
  >
    ☰
  </button>
</div>

          {currentConversation?.messages.map(
            (msg, i) => (
              <ChatMessage
                key={i}
                role={msg.role}
                content={msg.content}
              />
            )
          )}

          {loading && (
            <TypingIndicator />
          )}

          <div ref={bottomRef} />
        </div>

        <ChatInput
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </div>
    </div>
  )
}