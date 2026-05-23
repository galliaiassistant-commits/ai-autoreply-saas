"use client"



import { useState } from "react"

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Props = {
  open: boolean

  setOpen: any
}

export default function AuthModal({
  open,
  setOpen,
}: Props) {
  const [email, setEmail] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  if (!open) return null

  const signUp = async () => {
    setLoading(true)

    const { error } =
      await supabase.auth.signUp({
        email,
        password,
      })

    if (error) {
      alert(error.message)
    } else {
      alert(
        "Account created!"
      )

      setOpen(false)
    }

    setLoading(false)
  }

  const signIn = async () => {
    setLoading(true)

    const { error } =
      await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      )

    if (error) {
      alert(error.message)
    } else {
      setOpen(false)

      window.location.reload()
    }

    setLoading(false)
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.top}>
          <h2>Welcome</h2>

          <button
            onClick={() =>
              setOpen(false)
            }
            style={styles.close}
          >
            ✕
          </button>
        </div>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          style={styles.input}
        />

        <button
          onClick={signIn}
          style={styles.loginBtn}
        >
          {loading
            ? "Loading..."
            : "Login"}
        </button>

        <button
          onClick={signUp}
          style={styles.signupBtn}
        >
          Sign Up
        </button>
      </div>
    </div>
  )
}

const styles: any = {
  overlay: {
    position: "fixed",

    inset: 0,

    backgroundColor:
      "rgba(0,0,0,0.7)",

    display: "flex",

    justifyContent:
      "center",

    alignItems: "center",

    zIndex: 9999,
  },

  modal: {
    width: 380,

    backgroundColor: "#111827",

    borderRadius: 24,

    padding: 28,

    border:
      "1px solid #1e293b",
  },

  top: {
    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 20,
  },

  close: {
    background: "transparent",

    border: "none",

    color: "white",

    fontSize: 22,

    cursor: "pointer",
  },

  input: {
    width: "100%",

    padding: 14,

    borderRadius: 14,

    border: "1px solid #334155",

    backgroundColor: "#020617",

    color: "white",

    outline: "none",

    marginBottom: 14,
  },

  loginBtn: {
    width: "100%",

    padding: 14,

    borderRadius: 14,

    border: "none",

    backgroundColor: "#2563eb",

    color: "white",

    fontWeight: "bold",

    cursor: "pointer",

    marginBottom: 12,
  },

  signupBtn: {
    width: "100%",

    padding: 14,

    borderRadius: 14,

    border: "none",

    backgroundColor: "#334155",

    color: "white",

    fontWeight: "bold",

    cursor: "pointer",
  },
}