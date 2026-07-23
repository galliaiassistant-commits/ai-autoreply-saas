"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const categories = [
  "Medical",
  "Restaurant",
  "Barber",
  "Beauty",
  "Retail",
  "Professional Services",
  "Other",
]

export default function BusinessInfo({
  onNext,
}: {
  onNext: () => void
}) {
  const [businessId, setBusinessId] = useState("")

  const [businessName, setBusinessName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [website, setWebsite] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadBusiness() {
      const { data: userData } =
        await supabase.auth.getUser()

      const user = userData.user

      if (!user) return

      const { data } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle()

      if (data) {
        setBusinessId(data.id)
        setBusinessName(
          data.business_name || ""
        )
        setPhone(
          data.phone || ""
        )
        setAddress(
          data.address || ""
        )
        setWebsite(
          data.website || ""
        )
        setCategory(
          data.business_category || ""
        )
        setDescription(
          data.description || ""
        )
      }
    }

    loadBusiness()
  }, [])

  const canContinue =
    businessName.trim() &&
    phone.trim() &&
    category.trim() &&
    description.trim()

  async function save() {
    setError("")

    if (!canContinue) {
      setError(
        "Please complete all required fields before continuing."
      )
      return
    }

    setLoading(true)

    const { data: userData } =
      await supabase.auth.getUser()

    const user = userData.user

    if (!user) {
      setLoading(false)
      setError(
        "You must be signed in."
      )
      return
    }

    const payload = {
      business_name:
        businessName.trim(),

      phone:
        phone.trim(),

      address:
        address.trim() || null,

      website:
        website.trim() || null,

      business_category:
        category,

      description:
        description.trim(),

      owner_id:
        user.id,
    }

    if (businessId) {
      const { error } =
        await supabase
          .from("businesses")
          .update(payload)
          .eq(
            "id",
            businessId
          )

      if (error) {
        setLoading(false)
        setError(error.message)
        return
      }
    } else {
      const { data, error } =
        await supabase
          .from("businesses")
          .insert(payload)
          .select()
          .single()

      if (error) {
        setLoading(false)
        setError(error.message)
        return
      }

      setBusinessId(data.id)
    }

    setLoading(false)
    onNext()
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">

      <h2 className="text-2xl font-bold text-white">
        Business Information
      </h2>

      <p className="mt-2 text-slate-400">
        Tell Jhyro AI about your business.
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2">

        <Input
          label="Business Name *"
          value={businessName}
          setValue={setBusinessName}
          placeholder="Example: Jhyro Barber Shop"
        />

        <Input
          label="Phone Number *"
          value={phone}
          setValue={setPhone}
          placeholder="876-000-0000"
        />

        <label>
          <span className="text-sm text-slate-400">
            Business Category *
          </span>

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
          >
            <option value="">
              Select category
            </option>

            {categories.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </label>


        <Input
          label="Address"
          value={address}
          setValue={setAddress}
          placeholder="May Pen, Clarendon"
        />


        <Input
          label="Website"
          value={website}
          setValue={setWebsite}
          placeholder="https://example.com"
        />

      </div>


      <label className="mt-5 block">

        <span className="text-sm text-slate-400">
          Business Description *
        </span>

        <textarea
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
          placeholder="Describe what your business does..."
          className="mt-2 min-h-32 w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
        />

      </label>


      <div className="mt-8 flex justify-end">

        <button
          onClick={save}
          disabled={
            loading ||
            !canContinue
          }
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
        >
          {
            loading
              ? "Saving..."
              : "Continue"
          }
        </button>

      </div>

    </section>
  )
}


function Input({
  label,
  value,
  setValue,
  placeholder,
}: {
  label: string
  value: string
  setValue: (value:string)=>void
  placeholder:string
}) {

  return (
    <label>

      <span className="text-sm text-slate-400">
        {label}
      </span>

      <input
        value={value}
        onChange={(e)=>
          setValue(
            e.target.value
          )
        }
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
      />

    </label>
  )
}