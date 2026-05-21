export const styles: any = {
  page: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#0f172a",
    color: "white",
    fontFamily:
      "Inter, Arial, sans-serif",
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    marginLeft: 0,
    width: "100%",
  },

  topBar: {
    height: 60,
    display: "flex",
    alignItems: "center",
    padding: "0 20px",
    borderBottom:
      "1px solid #1e293b",
  },

  menuButton: {
    background: "transparent",
    border: "none",
    color: "white",
    fontSize: 26,
    cursor: "pointer",
  },

  chatArea: {
    flex: 1,
    overflowY: "auto",
    padding: 24,
  },
}