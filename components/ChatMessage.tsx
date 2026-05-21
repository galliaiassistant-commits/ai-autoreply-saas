"use client"

import { useState } from "react"

import ReactMarkdown from "react-markdown"

import { Prism as SyntaxHighlighter }
from "react-syntax-highlighter"

import { oneDark }
from "react-syntax-highlighter/dist/esm/styles/prism"

import {
  Copy,
  Check,
  Pencil,
  Eye,
  Save,
  X,
} from "lucide-react"

type Props = {
  role: "user" | "assistant"
  content: string
}

export default function ChatMessage({
  role,
  content,
}: Props) {
  const [copied, setCopied] =
    useState(false)

  const [previewMode, setPreviewMode] =
    useState(true)

  const [editing, setEditing] =
    useState(false)

  const [editedContent, setEditedContent] =
    useState(content)

  const copyCode = async (
    code: string
  ) => {
    await navigator.clipboard.writeText(
      code
    )

    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const saveEdit = () => {
    setEditing(false)
  }

  const cancelEdit = () => {
    setEditedContent(content)
    setEditing(false)
  }

  return (
   <div
  style={{
    ...styles.wrapper,

    justifyContent:
      role === "user"
        ? "flex-end"
        : "flex-start",

    backgroundColor:
      role === "assistant"
        ? "#111827"
        : "transparent",
  }}
>
      <div style={styles.container}>
        {/* AVATAR */}
        <div style={styles.avatar}>
          {role === "user"
            ? "🙂"
            : "🤖"}
        </div>

        {/* CONTENT */}
        <div style={styles.content}>
          {/* TOOLBAR */}
          <div style={styles.topBar}>
            {/* PREVIEW */}
            <button
              style={styles.iconButton}
              onClick={() =>
                setPreviewMode(
                  !previewMode
                )
              }
            >
              {previewMode ? (
                <>
                  <Pencil size={15} />

                  <div
                    style={styles.tooltip}
                  >
                    Edit View
                  </div>
                </>
              ) : (
                <>
                  <Eye size={15} />

                  <div
                    style={styles.tooltip}
                  >
                    Preview
                  </div>
                </>
              )}
            </button>

            {/* EDIT */}
            {!editing ? (
              <button
                style={styles.iconButton}
                onClick={() =>
                  setEditing(true)
                }
              >
                <Pencil size={15} />

                <div
                  style={styles.tooltip}
                >
                  Edit
                </div>
              </button>
            ) : (
              <>
                <button
                  style={styles.iconButton}
                  onClick={saveEdit}
                >
                  <Save size={15} />

                  <div
                    style={styles.tooltip}
                  >
                    Save
                  </div>
                </button>

                <button
                  style={styles.iconButton}
                  onClick={cancelEdit}
                >
                  <X size={15} />

                  <div
                    style={styles.tooltip}
                  >
                    Cancel
                  </div>
                </button>
              </>
            )}
          </div>

          {/* EDITOR */}
          {editing ? (
            <textarea
              value={editedContent}
              onChange={(e) =>
                setEditedContent(
                  e.target.value
                )
              }
              style={styles.editor}
            />
          ) : previewMode ? (
            <ReactMarkdown
              components={{
                code({
                  inline,
                  className,
                  children,
                  ...props
                }: any) {
                  const match =
                    /language-(\w+)/.exec(
                      className || ""
                    )

                  const codeString =
                    String(
                      children
                    ).replace(
                      /\n$/,
                      ""
                    )

                  return !inline &&
                    match ? (
                    <div
  style={{
    ...styles.container,

    flexDirection:
      role === "user"
        ? "row-reverse"
        : "row",
  }}
>
                      <div
                        style={
                          styles.codeToolbar
                        }
                      >
                        <button
                          onClick={() =>
                            copyCode(
                              codeString
                            )
                          }
                          style={
                            styles.iconButton
                          }
                        >
                          {copied ? (
                            <>
                              <Check
                                size={14}
                              />

                              <div
                                style={
                                  styles.tooltip
                                }
                              >
                                Copied
                              </div>
                            </>
                          ) : (
                            <>
                              <Copy
                                size={14}
                              />

                              <div
                                style={
                                  styles.tooltip
                                }
                              >
                                Copy
                              </div>
                            </>
                          )}
                        </button>
                      </div>

                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code
                      style={
                        styles.inlineCode
                      }
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
              }}
            >
              {editedContent}
            </ReactMarkdown>
          ) : (
            <textarea
              value={editedContent}
              readOnly
              style={styles.editor}
            />
          )}
        </div>
      </div>
    </div>
  )
}

if (typeof window !== "undefined") {
  const style =
    document.createElement("style")

  style.innerHTML = `
    button:hover div {
      opacity: 1 !important;
    }
  `

  document.head.appendChild(style)
}

const styles: any = {
 wrapper: {
  width: "100%",
  padding: "20px",

  display: "flex",

  justifyContent:
    "flex-start",
},

  container: {
  maxWidth: 900,
  margin: "0 auto",

  display: "flex",
  gap: 18,

  alignItems: "flex-start",
},

  avatar: {
    width: 34,
    height: 34,

    borderRadius: 8,

    backgroundColor: "#1f2937",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,

    fontSize: 18,
  },

 content: {
  maxWidth: "75%",

  color: "white",

  lineHeight: 1.8,

  fontSize: 15,

  textAlign: "left",
},

  topBar: {
    display: "flex",
    gap: 8,
    marginBottom: 12,
    opacity: 0.8,
  },

  iconButton: {
    backgroundColor: "#0f172a",
    border: "1px solid #334155",

    color: "white",

    width: 32,
    height: 32,

    borderRadius: 8,

    cursor: "pointer",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    position: "relative",
  },

  tooltip: {
    position: "absolute",

    bottom: -34,
    left: "50%",

    transform: "translateX(-50%)",

    backgroundColor: "#020617",

    color: "white",

    padding: "5px 9px",

    borderRadius: 6,

    fontSize: 11,

    opacity: 0,

    transition: "0.2s",

    pointerEvents: "none",

    whiteSpace: "nowrap",
  },

  inlineCode: {
    backgroundColor: "#020617",
    padding: "2px 6px",
    borderRadius: 6,
  },

  codeContainer: {
    position: "relative",
    marginTop: 12,
  },

  codeToolbar: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },

  editor: {
    width: "100%",
    minHeight: 220,

    backgroundColor: "#020617",

    color: "white",

    border: "1px solid #334155",

    borderRadius: 12,

    padding: 14,

    resize: "vertical",

    fontSize: 14,

    outline: "none",
  },
}