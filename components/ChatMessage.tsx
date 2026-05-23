"use client"

import { Bot, User, Copy } from "lucide-react"

import ReactMarkdown from "react-markdown"

import {
  Prism as SyntaxHighlighter,
} from "react-syntax-highlighter"

import {
  oneDark,
} from "react-syntax-highlighter/dist/esm/styles/prism"

type Props = {
  role: "user" | "assistant"

  content: string
}

export default function ChatMessage({
  role,
  content,
}: Props) {
  const isUser =
    role === "user"

  // COPY MESSAGE
  const copyMessage = async () => {
    navigator.clipboard.writeText(
      content
    )
  }

  return (
    <div
      style={{
        width: "100%",

        display: "flex",

        justifyContent:
          isUser
            ? "flex-end"
            : "flex-start",

        marginBottom: 28,
      }}
    >
      <div
        style={{
          display: "flex",

          flexDirection: isUser
            ? "row-reverse"
            : "row",

          alignItems: "flex-end",

          gap: 12,

          maxWidth: "80%",
        }}
      >
        {/* AVATAR */}
        <div
          style={{
            width: 38,
            height: 38,

            borderRadius: 12,

            backgroundColor:
              isUser
                ? "#2563eb"
                : "#111827",

            display: "flex",

            alignItems: "center",

            justifyContent:
              "center",

            flexShrink: 0,

            border:
              "1px solid #1e293b",
          }}
        >
          {isUser ? (
            <User size={18} />
          ) : (
            <Bot size={18} />
          )}
        </div>

        {/* MESSAGE */}
        <div
          style={{
            position: "relative",

            backgroundColor:
              isUser
                ? "#2563eb"
                : "#111827",

            color: "white",

            padding:
              "16px 18px",

            borderRadius: 20,

            lineHeight: 1.7,

            fontSize: 15,

            whiteSpace: "pre-wrap",

            wordBreak:
              "break-word",

            border:
              "1px solid #1e293b",

            boxShadow:
              "0 4px 20px rgba(0,0,0,0.25)",

            overflow: "hidden",
          }}
        >
          {/* COPY BUTTON */}
          <button
            onClick={copyMessage}
            style={{
              position: "absolute",

              top: 10,
              right: 10,

              width: 30,
              height: 30,

              borderRadius: 8,

              border: "none",

              backgroundColor:
                "rgba(255,255,255,0.08)",

              color: "white",

              cursor: "pointer",

              display: "flex",

              alignItems: "center",

              justifyContent:
                "center",
            }}
          >
            <Copy size={15} />
          </button>

          {/* MARKDOWN */}
          <div
            style={{
              paddingRight: 40,
            }}
          >
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

                  return !inline &&
                    match ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={
                        match[1]
                      }
                      PreTag="div"
                      customStyle={{
                        borderRadius: 14,

                        padding: 16,

                        fontSize: 14,
                      }}
                      {...props}
                    >
                      {String(
                        children
                      ).replace(
                        /\n$/,
                        ""
                      )}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      style={{
                        backgroundColor:
                          "rgba(255,255,255,0.1)",

                        padding:
                          "2px 6px",

                        borderRadius: 6,

                        fontSize: 14,
                      }}
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}