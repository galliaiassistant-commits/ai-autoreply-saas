type Props = {
  chats: string[]
  currentChat: number
  setCurrentChat: any
  createNewChat: () => void
  sidebarOpen: boolean
  setSidebarOpen: any
}

export default function Sidebar({
  chats,
  currentChat,
  setCurrentChat,
  createNewChat,
  sidebarOpen,
  setSidebarOpen,
}: Props) {
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
            🤖 GalliAssist
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

        <button
          onClick={createNewChat}
          style={styles.newChat}
        >
          + New Chat
        </button>

        <div style={styles.chatList}>
          {chats.map((chat, i) => (
            <div
              key={i}
              onClick={() => {
                setCurrentChat(i)
                setSidebarOpen(false)
              }}
              style={{
                ...styles.chatItem,

                backgroundColor:
                  currentChat === i
                    ? "#1e293b"
                    : "transparent",
              }}
            >
              {chat}
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
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",

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
    gap: 10,
  },

  chatItem: {
    padding: 12,
    borderRadius: 10,
    cursor: "pointer",
    color: "white",
    fontSize: 14,
  },
}