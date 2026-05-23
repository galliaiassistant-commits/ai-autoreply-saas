export const styles: any = {
  page: {
    display: "flex",
    backgroundColor: "#020617",
    height: "100vh",
    color: "white",
    overflow: "hidden",
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },

  topBar: {
    height: 64,
    borderBottom: "1px solid #1e293b",
    display: "flex",
    alignItems: "center",
    padding: "0 20px",
    backgroundColor: "#020617",
  },

  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    border: "none",
    backgroundColor: "#111827",
    color: "white",
    cursor: "pointer",
    fontSize: 22,
  },

  chatArea: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },

  messagesContainer: {
    width: "100%",
    maxWidth: 900,
    margin: "0 auto",
    padding: "30px 20px 140px",
    display: "flex",
    flexDirection: "column",
  },

  loading: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 10,
    paddingLeft: 10,
  },

  inputSection: {
    position: "sticky",
    bottom: 0,
    width: "100%",
    backgroundColor: "#020617",
    padding: "20px",
    borderTop: "1px solid #1e293b",
  },

  inputWrapper: {
    maxWidth: 900,
    margin: "0 auto",
    display: "flex",
    gap: 12,
    alignItems: "flex-end",
  },

  input: {
    flex: 1,
    backgroundColor: "#111827",
    border: "1px solid #1e293b",
    color: "white",
    borderRadius: 18,
    padding: 16,
    fontSize: 15,
    resize: "none",
    minHeight: 58,
    outline: "none",
  },

  sendButton: {
    backgroundColor: "#2563eb",
    border: "none",
    color: "white",
    padding: "14px 24px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 15,
  },
}