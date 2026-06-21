"use client"

import {
  MoreHorizontal,
  Share2,
  Users,
  Pencil,
  Pin,
  Archive,
  Check,
  X,
} from "lucide-react"

import { useState } from "react"

type Chat = {
  title: string
  messages: any[]
  pinned?: boolean
  archived?: boolean
}

type Props = {
  chats: Chat[]
  setChats: any

  currentChat: number
  setCurrentChat: any

  createNewChat: () => void

  sidebarOpen: boolean
  setSidebarOpen: any
}

export default function Sidebar({
  chats,
  setChats,

  currentChat,
  setCurrentChat,

  createNewChat,

  sidebarOpen,
  setSidebarOpen,
}: Props) {
  const [editingIndex, setEditingIndex] =
    useState<number | null>(null)

  const [editedTitle, setEditedTitle] =
    useState("")

  const [menuOpen, setMenuOpen] =
    useState<number | null>(null)

  // ARCHIVE CHAT
  const archiveChat = (
    index: number
  ) => {
    const updated = [...chats]

    updated[index].archived = true

    setChats(updated)
  }

  // PIN CHAT
  const pinChat = (
    index: number
  ) => {
    const updated = [...chats]

    updated[index].pinned =
      !updated[index].pinned

    updated.sort((a, b) => {
      if (a.pinned && !b.pinned)
        return -1

      if (!a.pinned && b.pinned)
        return 1

      return 0
    })

    setChats(updated)
  }

  // SAVE RENAME
  const saveRename = (
    index: number
  ) => {
    const updated = [...chats]

    updated[index].title =
      editedTitle

    setChats(updated)

    setEditingIndex(null)
  }

  return (
    <div
      style={{
        ...styles.sidebar,

        left: sidebarOpen
          ? 0
          : -280,
      }}
    >
      {/* TOP */}
      <div>
        <div style={styles.topRow}>
          <div style={styles.brand}>
            🤖 Jhyro AI
          </div>

          <button
            onClick={() =>
              setSidebarOpen(false)
            }
            style={styles.closeButton}
          >
            ✕
          </button>
        </div>

        {/* NEW CHAT */}
        <button
          onClick={createNewChat}
          style={styles.newChat}
        >
          + New Chat
        </button>

        {/* CHAT LIST */}
        <div style={styles.chatList}>
          {chats
            .filter(
              (chat) =>
                !chat.archived
            )
            .map((chat, i) => (
              <div
                key={i}
                style={{
                  ...styles.chatItem,

                  backgroundColor:
                    currentChat === i
                      ? "#1e293b"
                      : "transparent",
                }}
              >
                {/* TITLE */}
                <div
                  onClick={() => {
                    setCurrentChat(i)

                    setSidebarOpen(
                      false
                    )
                  }}
                  style={
                    styles.chatTitle
                  }
                >
                  {editingIndex ===
                  i ? (
                    <input
                      value={
                        editedTitle
                      }
                      onChange={(
                        e
                      ) =>
                        setEditedTitle(
                          e.target
                            .value
                        )
                      }
                      style={
                        styles.renameInput
                      }
                    />
                  ) : (
                    <>
                      {chat.pinned &&
                        "📌 "}

                      {chat.title}
                    </>
                  )}
                </div>

                {/* MENU */}
                <div
                  style={
                    styles.menuWrapper
                  }
                >
                  <button
                    style={
                      styles.menuButton
                    }
                    onClick={() =>
                      setMenuOpen(
                        menuOpen === i
                          ? null
                          : i
                      )
                    }
                  >
                    <MoreHorizontal
                      size={18}
                    />
                  </button>

                  {/* DROPDOWN */}
                  {menuOpen === i && (
                    <div
                      style={
                        styles.dropdown
                      }
                    >
                      {/* SHARE */}
                      <button
                        style={
                          styles.dropdownItem
                        }
                      >
                        <Share2
                          size={15}
                        />

                        <span>
                          Share
                        </span>
                      </button>

                      {/* GROUP */}
                      <button
                        style={
                          styles.dropdownItem
                        }
                      >
                        <Users
                          size={15}
                        />

                        <span>
                          Start Group
                          Chat
                        </span>
                      </button>

                      {/* RENAME */}
                      {editingIndex ===
                      i ? (
                        <>
                          <button
                            style={
                              styles.dropdownItem
                            }
                            onClick={() =>
                              saveRename(
                                i
                              )
                            }
                          >
                            <Check
                              size={15}
                            />

                            <span>
                              Save
                            </span>
                          </button>

                          <button
                            style={
                              styles.dropdownItem
                            }
                            onClick={() =>
                              setEditingIndex(
                                null
                              )
                            }
                          >
                            <X
                              size={15}
                            />

                            <span>
                              Cancel
                            </span>
                          </button>
                        </>
                      ) : (
                        <button
                          style={
                            styles.dropdownItem
                          }
                          onClick={() => {
                            setEditingIndex(
                              i
                            )

                            setEditedTitle(
                              chat.title
                            )

                            setMenuOpen(
                              null
                            )
                          }}
                        >
                          <Pencil
                            size={15}
                          />

                          <span>
                            Rename
                          </span>
                        </button>
                      )}

                      {/* PIN */}
                      <button
                        style={
                          styles.dropdownItem
                        }
                        onClick={() =>
                          pinChat(i)
                        }
                      >
                        <Pin
                          size={15}
                        />

                        <span>
                          {chat.pinned
                            ? "Unpin Chat"
                            : "Pin Chat"}
                        </span>
                      </button>

                      {/* ARCHIVE */}
                      <button
                        style={{
                          ...styles.dropdownItem,

                          color:
                            "#f87171",
                        }}
                        onClick={() =>
                          archiveChat(i)
                        }
                      >
                        <Archive
                          size={15}
                        />

                        <span>
                          Archive Chat
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

const styles: any = {
  sidebar: {
    width: 260,

    backgroundColor: "#020617",

    borderRight:
      "1px solid #1e293b",

    padding: 20,

    position: "fixed",

    top: 0,
    bottom: 0,

    zIndex: 1000,

    transition: "0.3s",

    overflowY: "auto",
  },

  topRow: {
    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 20,
  },

  brand: {
    fontSize: 24,

    fontWeight: "bold",

    color: "white",
  },

  closeButton: {
    background: "transparent",

    border: "none",

    color: "white",

    fontSize: 22,

    cursor: "pointer",
  },

  newChat: {
    width: "100%",

    padding: 12,

    borderRadius: 12,

    border: "none",

    backgroundColor: "#2563eb",

    color: "white",

    cursor: "pointer",

    marginBottom: 20,

    fontWeight: "bold",
  },

  chatList: {
    display: "flex",

    flexDirection: "column",

    gap: 8,
  },

  chatItem: {
    padding: 12,

    borderRadius: 12,

    color: "white",

    display: "flex",

    alignItems: "center",

    justifyContent:
      "space-between",

    gap: 10,

    position: "relative",
  },

  chatTitle: {
    flex: 1,

    cursor: "pointer",

    overflow: "hidden",

    textOverflow: "ellipsis",

    whiteSpace: "nowrap",

    fontSize: 14,
  },

  menuWrapper: {
    position: "relative",
  },

  menuButton: {
    width: 30,
    height: 30,

    borderRadius: 8,

    border: "none",

    backgroundColor:
      "transparent",

    color: "white",

    cursor: "pointer",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",
  },

  dropdown: {
    position: "absolute",

    right: 0,
    top: 36,

    width: 220,

    backgroundColor: "#111827",

    border:
      "1px solid #1f2937",

    borderRadius: 14,

    padding: 8,

    zIndex: 1000,

    boxShadow:
      "0 10px 30px rgba(0,0,0,0.4)",
  },

  dropdownItem: {
    width: "100%",

    padding: "10px 12px",

    borderRadius: 10,

    border: "none",

    backgroundColor:
      "transparent",

    color: "white",

    cursor: "pointer",

    display: "flex",

    alignItems: "center",

    gap: 10,

    fontSize: 14,
  },

  renameInput: {
    width: "100%",

    backgroundColor: "#0f172a",

    border: "1px solid #334155",

    color: "white",

    borderRadius: 8,

    padding: "4px 8px",

    outline: "none",
  },
}
