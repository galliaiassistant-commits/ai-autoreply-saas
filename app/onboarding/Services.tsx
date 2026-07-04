"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

type ServiceRow = {
  name: string
  price: string
  duration: string
}

export default function Services({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) {
  const [services, setServices] = useState<ServiceRow[]>([
    { name: "Haircut", price: "2500", duration: "30" },
  ])
  const [loading, setLoading] = useState(false)

  function updateService(index: number, field: keyof ServiceRow, value: string) {
    const copy = [...services]
    copy[index][field] = value
    setServices(copy)
  }

  function addService() {
    setServices([...services, { name: "", price: "", duration: "30" }])
  }

  function deleteService(index: number) {
    const copy = services.filter((_, i) => i !== index)

    if (copy.length === 0) {
      setServices([{ name: "", price: "", duration: "30" }])
      return
    }

    setServices(copy)
  }

  async function save() {
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      setLoading(false)
      alert("You must be signed in.")
      return
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()

    if (!business) {
      setLoading(false)
      alert("Business not found.")
      return
    }

    const cleanServices = services
      .filter((service) => service.name.trim())
      .map((service) => ({
        business_id: business.id,
        name: service.name.trim(),
        price: service.price ? Number(service.price) : null,
        duration_minutes: Number(service.duration || 30),
        is_active: true,
      }))

    if (cleanServices.length === 0) {
      setLoading(false)
      alert("Add at least one service.")
      return
    }

    await supabase
      .from("business_services")
      .delete()
      .eq("business_id", business.id)

    const { error } = await supabase
      .from("business_services")
      .insert(cleanServices)

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    onNext()
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
      <h2 className="text-2xl font-bold">Services</h2>

      <p className="mt-2 text-slate-400">
        Add the services your AI can book.
      </p>

      <div className="mt-8 space-y-4">
        {services.map((service, index) => (
          <div
            key={index}
            className="rounded-2xl bg-slate-800 p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold text-white">
                Service {index + 1}
              </p>

              <button
                type="button"
                onClick={() => deleteService(index)}
                className="rounded-xl border border-red-500 px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10"
              >
                Delete
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <input
                value={service.name}
                onChange={(e) =>
                  updateService(index, "name", e.target.value)
                }
                placeholder="Service name"
                className="rounded-xl bg-slate-900 p-3 outline-none"
              />

              <input
                value={service.price}
                onChange={(e) =>
                  updateService(index, "price", e.target.value)
                }
                placeholder="Price"
                className="rounded-xl bg-slate-900 p-3 outline-none"
              />

              <input
                value={service.duration}
                onChange={(e) =>
                  updateService(index, "duration", e.target.value)
                }
                placeholder="Duration minutes"
                className="rounded-xl bg-slate-900 p-3 outline-none"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addService}
        className="mt-5 rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 hover:bg-slate-800"
      >
        + Add Service
      </button>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 hover:bg-slate-800"
        >
          Back
        </button>

        <button
          type="button"
          onClick={save}
          disabled={loading}
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>
    </section>
  )
}