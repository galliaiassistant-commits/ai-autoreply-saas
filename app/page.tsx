"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/Sidebar"
import ChatMessage from "@/components/ChatMessage"
import AuthModal from "@/components/AuthModal"
import { supabase } from "./lib/supabase"
import { styles } from "@/styles/chat"
import { SpeedInsights } from "@vercel/speed-insights/next"

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

  const [
    recording,
    setRecording,
  ] = useState(false)

  const [
    voiceMode,
    setVoiceMode,
  ] = useState(false)

  const [loading, setLoading] =
    useState(false)

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false)

  const [
    currentChat,
    setCurrentChat,
  ] = useState(0)

  const [authOpen, setAuthOpen] =
    useState(false)

  const [user, setUser] =
    useState<any>(null)

  const [
    conversations,
    setConversations,
  ] = useState<
    Conversation[]
  >([
    {
      title: "New Chat",

      messages: [],

      pinned: false,

      archived: false,
    },
  ])

  // LOAD CHATS
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
      JSON.stringify(
        conversations
      )
    )
  }, [conversations])

  // GET USER
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

  // VOICE INPUT
  const startVoiceInput =
    () => {
      const SpeechRecognition =
        (
          window as any
        ).SpeechRecognition ||
        (
          window as any
        ).webkitSpeechRecognition

      if (
        !SpeechRecognition
      ) {
        alert(
          "Voice recognition not supported."
        )

        return
      }

      const recognition =
        new SpeechRecognition()

      recognition.lang =
        "en-US"

      recognition.start()

      setVoiceMode(true)

      setRecording(true)

      recognition.onresult =
        (
          event: any
        ) => {
          const transcript =
            event.results[0][0]
              .transcript

          setMessage(
            (
              prev: string
            ) =>
              prev +
              " " +
              transcript
          )
        }

      recognition.onend =
        () => {
          setRecording(false)
        }
    }

  // SPEAK RESPONSE
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

  // SEND MESSAGE
  const generateImage =
    async () => {
      if (
        !message.trim()
      )
        return

      const updatedConversations =
        [
          ...conversations,
        ]

      // USER MESSAGE
      updatedConversations[
        currentChat
      ].messages.push({
        role: "user",

        content: message,
      })

      // EMPTY AI MESSAGE
      updatedConversations[
        currentChat
      ].messages.push({
        role:
          "assistant",

        content: "",
      })

      setConversations([
        ...updatedConversations,
      ])

      setLoading(true)

      try {
        const response =
          await fetch(
            "/api/chat",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify(
                {
                  messages:
                    [
                      ...conversations[
                        currentChat
                      ]
                        .messages,

                      {
                        role:
                          "user",

                        content:
                          message,
                      },
                    ],

                  image,
                }
              ),
            }
          )

        if (
          !response.body
        )
          return

        const reader =
          response.body.getReader()

        const decoder =
          new TextDecoder()

        let fullReply =
          ""

        while (true) {
          const {
            done,
            value,
          } =
            await reader.read()

          if (done)
            break

          const chunk =
            decoder.decode(
              value
            )

          fullReply +=
            chunk

          updatedConversations[
            currentChat
          ].messages[
            updatedConversations[
              currentChat
            ].messages
              .length -
              1
          ].content =
            fullReply

          setConversations(
            [
              ...updatedConversations,
            ]
          )
        }

        if (
          voiceMode
        ) {
          speakResponse(
            fullReply
          )

          setVoiceMode(
            false
          )
        }

        // AUTO TITLE
        if (
          updatedConversations[
            currentChat
          ].title ===
          "New Chat"
        ) {
          updatedConversations[
            currentChat
          ].title =
            message.slice(
              0,
              25
            )
        }

        setConversations([
          ...updatedConversations,
        ])

        setMessage("")

        setImage(null)
      } catch (
        err: any
      ) {
        updatedConversations[
          currentChat
        ].messages[
          updatedConversations[
            currentChat
          ].messages
            .length -
            1
        ].content =
          "Error: " +
          err.message

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
        chats={
          conversations
        }
        setChats={
          setConversations
        }
        currentChat={
          currentChat
        }
        setCurrentChat={
          setCurrentChat
        }
        createNewChat={
          createNewChat
        }
        sidebarOpen={
          sidebarOpen
        }
        setSidebarOpen={
          setSidebarOpen
        }
      />

      {/* MAIN */}
      <div style={styles.main}>
        {/* TOP BAR */}
        <div
          style={
            styles.topBar
          }
        >
          <button
            onClick={() =>
              setSidebarOpen(
                true
              )
            }
            style={
              styles.menuButton
            }
          >
            ☰
          </button>

          <div
            style={{
              marginLeft:
                "auto",

              display:
                "flex",

              alignItems:
                "center",

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

                    display:
                      "flex",

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

        {/* CHAT */}
        <div
          style={
            styles.chatArea
          }
        >
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
                  role={
                    msg.role
                  }
                  content={
                    msg.content
                  }
                />
              )
            )}

            {loading && (
              <div
                style={
                  styles.loading
                }
              >
                GalliAssist
                is
                thinking...
              </div>
            )}
          </div>

          {/* INPUT */}
          <div
            style={
              styles.inputSection
            }
          >
            {/* IMAGE PREVIEW */}
            {image && (
              <div
                style={{
                  padding: 10,

                  display:
                    "flex",

                  justifyContent:
                    "flex-start",
                }}
              >
                <img
                  src={
                    image
                  }
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

            {/* GENERATED IMAGE */}
            {generatedImage && (
              <div
                style={{
                  padding: 10,
                }}
              >
                <img
                  src={
                    generatedImage
                  }
                  alt="generated"
                  style={{
                    width: 300,

                    borderRadius: 18,
                  }}
                />
              </div>
            )}

            <div
              style={
                styles.inputWrapper
              }
            >
              {/* HIDDEN INPUT */}
              <input
                type="file"
                accept="image/*"
                id="imageUpload"
                style={{
                  display:
                    "none",
                }}
                onChange={(
                  e
                ) => {
                  const file =
                    e.target
                      .files?.[0]

                  if (
                    !file
                  )
                    return

                  const reader =
                    new FileReader()

                  reader.onloadend =
                    () => {
                      setImage(
                        reader.result as string
                      )
                    }

                  reader.readAsDataURL(
                    file
                  )
                }}
              />

              {/* IMAGE BUTTON */}
              <button
                title="Upload Image"
                style={{
                  background:
                    "transparent",

                  border:
                    "none",

                  cursor:
                    "pointer",

                  padding: 8,

                  color:
                    "#94a3b8",
                }}
              >
                <label
                  htmlFor="imageUpload"
                  style={{
                    cursor:
                      "pointer",

                    display:
                      "flex",
                  }}
                >
                  <ImagePlus
                    size={
                      22
                    }
                  />
                </label>
              </button>

              {/* MIC BUTTON */}
              <button
                onClick={
                  startVoiceInput
                }
                title="Voice Input"
                style={{
                  background:
                    "transparent",

                  border:
                    "none",

                  cursor:
                    "pointer",

                  padding: 8,

                  color:
                    recording
                      ? "#ef4444"
                      : "#94a3b8",
                }}
              >
                <Mic
                  size={
                    22
                  }
                />
              </button>

              {/* TEXTAREA */}
              <textarea
                value={
                  message
                }
                onChange={(
                  e
                ) =>
                  setMessage(
                    e.target
                      .value
                  )
                }
                onKeyDown={(
                  e
                ) => {
                  if (
                    e.key ===
                      "Enter" &&
                    !e.shiftKey
                  ) {
                    e.preventDefault()

                    generateImage()
                  }
                }}
                placeholder="Message GalliAssist..."
                style={
                  styles.input
                }
              />

              {/* SEND BUTTON */}
              <button
                onClick={
                  generateImage
                }
                style={{
                  background:
                    "linear-gradient(to right,#2563eb,#7c3aed)",

                  border:
                    "none",

                  borderRadius: 14,

                  padding:
                    "10px 14px",

                  cursor:
                    "pointer",

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",
                }}
              >
                <SendHorizontal
                  size={
                    20
                  }
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
        setOpen={
          setAuthOpen
        }
      />
    </div>
  )
}