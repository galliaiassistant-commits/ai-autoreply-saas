<h1
style={{
  color: "red",
  fontSize: 50,
}}
>
LIVE NEW VERSION
</h1>

"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/Sidebar"
import ChatMessage from "@/components/ChatMessage"
import AuthModal from "@/components/AuthModal"
import { supabase } from "./lib/supabase"
import { styles } from "@/styles/chat"
import {
  Mic,
  ImagePlus,
  SendHorizontal,
} from "lucide-react"

type Message = {
  role: "user" | "assistant"
  content: string
}

type Conversation = {
  title: string
  messages: Message[]
  pinned?: boolean
  archived?: boolean
}

export default function Home() {
  const [message, setMessage] =
    useState("")

    const [image, setImage] =
  useState<string | null>(
    null
  )

  const [
  generatedImage,
  setGeneratedImage,
] = useState<
  string | null
>(null)
const [recording, setRecording] =
  useState(false)

const [voiceMode, setVoiceMode] =
  useState(false)

  const [loading, setLoading] =
    useState(false)

  const [sidebarOpen, setSidebarOpen] =
    useState(false)

  const [currentChat, setCurrentChat] =
    useState(0)

  const [authOpen, setAuthOpen] =
    useState(false)

  const [user, setUser] =
    useState<any>(null)

  const [conversations, setConversations] =
    useState<Conversation[]>([
      {
        title: "New Chat",

        messages: [],

        pinned: false,

        archived: false,
      },
    ])

  // LOAD SAVED CHATS
  useEffect(() => {
    const saved =
      localStorage.getItem(
        "galli-conversations"
      )

    if (saved) {
      setConversations(
        JSON.parse(saved)
      )
    }
  }, [])

  // SAVE CHATS
  useEffect(() => {
    localStorage.setItem(
      "galli-conversations",
      JSON.stringify(conversations)
    )
  }, [conversations])

  // CHECK USER
  useEffect(() => {
  const getUser =
    async () => {
      const {
        data,
      } =
        await supabase.auth.getUser()

      setUser(data.user)
    }

  getUser()
}, [])
  const currentMessages =
    conversations[currentChat]
      ?.messages || []

  // CREATE CHAT
  const createNewChat = () => {
    setConversations((prev) => [
      ...prev,
      {
        title: "New Chat",

        messages: [],

        pinned: false,

        archived: false,
      },
    ])

    setCurrentChat(
      conversations.length
    )
  }

const startVoiceInput = () => {
  const SpeechRecognition =
    (
      window as any
    ).SpeechRecognition ||
    (
      window as any
    ).webkitSpeechRecognition

  if (!SpeechRecognition) {
    alert(
      "Voice recognition not supported."
    )

    return
  }

  const recognition =
    new SpeechRecognition()

  recognition.lang = "en-US"

  recognition.start()

setVoiceMode(true)

  setRecording(true)

  recognition.onresult = (
    event: any
  ) => {
    const transcript =
      event.results[0][0]
        .transcript

    setMessage(
      (prev: string) =>
        prev + " " + transcript
    )
  }

  recognition.onend = () => {
    setRecording(false)
  }
}

const speakResponse = (
  text: string
) => {
  const utterance =
    new SpeechSynthesisUtterance(
      text
    )

  utterance.rate = 1

  utterance.pitch = 1

  utterance.volume = 1

  window.speechSynthesis.speak(
    utterance
  )
}
const generateImage =
  async () => {
    if (!message.trim())
      return

    try {
      const response =
        await fetch(
          "/api/image",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              prompt: message,
            }),
          }
        )

      const data =
        await response.json()

      setGeneratedImage(
        data.image
      )
    } catch (err) {
      console.log(err)
    }
  }
  // SEND MESSAGE
  const sendMessage = async () => {
    if (!message.trim()) return

const lowerMessage =
  message.toLowerCase()

const shouldGenerateImage =
  lowerMessage.includes(
    "generate"
  ) ||
  lowerMessage.includes(
    "create image"
  ) ||
  lowerMessage.includes(
    "make an image"
  ) ||
  lowerMessage.includes(
    "draw"
  )

if (shouldGenerateImage) {
  await generateImage()

  return
}

    const userMessage = message

    setMessage("")

    const updatedConversations = [
      ...conversations,
    ]

    // USER MESSAGE
    updatedConversations[
      currentChat
    ].messages.push({
      role: "user",

      content: userMessage,
    })

    // EMPTY AI MESSAGE
    updatedConversations[
      currentChat
    ].messages.push({
      role: "assistant",

      content: "",
    })

    setConversations([
      ...updatedConversations,
    ])

    setLoading(true)

    try {
      const response = await fetch(
        "/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

        body: JSON.stringify({
  messages: [
    ...conversations[currentChat]
      .messages,

    {
      role: "user",

      content: message,
    },
  ],

  image,
}),
        }
      )

      if (!response.body) return

      const reader =
        response.body.getReader()

      const decoder =
        new TextDecoder()

      let fullReply = ""

      while (true) {
        const { done, value } =
          await reader.read()

        if (done) break

        const chunk =
          decoder.decode(value)

        fullReply += chunk

        updatedConversations[
          currentChat
        ].messages[
          updatedConversations[
            currentChat
          ].messages.length - 1
        ].content = fullReply

        setConversations([
          ...updatedConversations,
        ])
      }
if (voiceMode) {
  speakResponse(fullReply)

  setVoiceMode(false)
}
      // AUTO TITLE
      if (
        updatedConversations[
          currentChat
        ].title === "New Chat"
      ) {
        updatedConversations[
          currentChat
        ].title =
          userMessage.slice(0, 25)
      }

      setConversations([
        ...updatedConversations,
      ])
    } catch (err: any) {
      updatedConversations[
        currentChat
      ].messages[
        updatedConversations[
          currentChat
        ].messages.length - 1
      ].content =
        "Error: " + err.message

      setConversations([
        ...updatedConversations,
      ])
    }

    setLoading(false)
  }

  return (
    <div style={styles.page}>
      {/* SIDEBAR */}
      <Sidebar
        chats={conversations}
        setChats={setConversations}
        currentChat={currentChat}
        setCurrentChat={
          setCurrentChat
        }
        createNewChat={
          createNewChat
        }
        sidebarOpen={sidebarOpen}
        setSidebarOpen={
          setSidebarOpen
        }
      />

      {/* MAIN */}
      <div style={styles.main}>
        {/* TOP BAR */}
        <div style={styles.topBar}>
          <button
            onClick={() =>
              setSidebarOpen(true)
            }
            style={styles.menuButton}
          >
            ☰
          </button>

          {/* AUTH */}
          <div
            style={{
              marginLeft: "auto",

              display: "flex",

              alignItems: "center",

              gap: 12,
            }}
          >
            {user ? (
              <>
                <div
                  style={{
                    width: 38,
                    height: 38,

                    borderRadius:
                      "50%",

                    backgroundColor:
                      "#2563eb",

                    display: "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    fontWeight:
                      "bold",
                  }}
                >
                  {user.email?.[0]?.toUpperCase()}
                </div>

                <button
                  onClick={async () => {
                    await supabase.auth.signOut()

                    window.location.reload()
                  }}
                  style={
                    styles.sendButton
                  }
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() =>
                  setAuthOpen(
                    true
                  )
                }
                style={
                  styles.sendButton
                }
              >
                Login
              </button>
            )}
          </div>
        </div>

        {/* CHAT AREA */}
        <div style={styles.chatArea}>
          {/* MESSAGES */}
          <div
            style={
              styles.messagesContainer
            }
          >
            {currentMessages.map(
              (
                msg: Message,
                i: number
              ) => (
                <ChatMessage
                  key={i}
                  role={msg.role}
                  content={msg.content}
                />
              )
            )}

            {loading && (
              <div
                style={styles.loading}
              >
                GalliAssist is
                thinking...
              </div>
            )}
          </div>

          {/* INPUT */}
          <div
            style={styles.inputSection}
          >
            {image && (
  <div
    style={{
      padding: 10,

      display: "flex",

      justifyContent:
        "flex-start",
    }}
  >
    <img
      src={image}
      alt="upload"
      style={{
        width: 180,

        borderRadius: 18,

        border:
          "1px solid #334155",
      }}
    />
  </div>
)}

{generatedImage && (
  <div
    style={{
      padding: 10,
    }}
  >
    <img
      src={generatedImage}
      alt="generated"
      style={{
        width: 300,

        borderRadius: 18,
      }}
    />
  </div>
)}

            <div style={styles.inputWrapper}>
  <input
    type="file"
    accept="image/*"
    id="imageUpload"
    style={{
      display: "none",
    }}
    onChange={(e) => {
      const file =
        e.target.files?.[0]

      if (!file) return

      const reader =
        new FileReader()

      reader.onloadend =
        () => {
          setImage(
            reader.result as string
          )
        }

      reader.readAsDataURL(file)
    }}
  />

  <label
    htmlFor="imageUpload"
    style={{
      cursor: "pointer",

      fontSize: 22,

      padding: "0 10px",
    }}
  >
    
  </label>

<button
  onClick={startVoiceInput}
  style={{
    background: "transparent",

    border: "none",

    cursor: "pointer",

    fontSize: 22,

    padding: "0 10px",

    color: recording
      ? "#ef4444"
      : "white",

    display: "flex",

    alignItems: "center",
  }}
>
  
</button>
<button
  onClick={generateImage}
  style={{
    background: "transparent",

    border: "none",

    cursor: "pointer",

    fontSize: 22,

    padding: "0 10px",
  }}
>
  ✨
</button>

<button
  title="Upload Image"
  style={{
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 8,
    color: "#94a3b8",
  }}
>
  <label
    htmlFor="imageUpload"
    style={{
      cursor: "pointer",
      display: "flex",
    }}
  >
    <ImagePlus size={22} />
  </label>
</button>

<button
  onClick={startVoiceInput}
  title="Voice Input"
  style={{
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 8,
    color: recording
      ? "#ef4444"
      : "#94a3b8",
  }}
>
  <Mic size={22} />
</button>

  <textarea
                value={message}
                onChange={(e) =>
                  setMessage(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key ===
                      "Enter" &&
                    !e.shiftKey
                  ) {
                    e.preventDefault()

                    sendMessage()
                  }
                }}
                placeholder="Message GalliAssist..."
                style={styles.input}
              />

                <button
  onClick={sendMessage}
  style={{
    background:
      "linear-gradient(to right,#2563eb,#7c3aed)",

    border: "none",

    borderRadius: 14,

    padding: "10px 14px",

    cursor: "pointer",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",
  }}
>
  <SendHorizontal
    size={20}
    color="white"
  />
</button>
            
            </div>
          </div>
        </div>
      </div>

      {/* AUTH MODAL */}
      <AuthModal
        open={authOpen}
        setOpen={setAuthOpen}
      />
    </div>
  )
}
