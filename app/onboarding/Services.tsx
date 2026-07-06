"use client"

import { useState } from "react"
import { saveBusinessServices } from "./actions"

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
    {
      name: "Haircut",
      price: "2500",
      duration: "30",
    },
  ])

  const [loading, setLoading] = useState(false)

  function updateService(
    index: number,
    field: keyof ServiceRow,
    value: string
  ) {
    const copy = [...services]
    copy[index][field] = value
    setServices(copy)
  }

  function addService() {
    setServices([
      ...services,
      {
        name: "",
        price: "",
        duration: "30",
      },
    ])
  }

  function deleteService(index: number) {
    const copy = services.filter((_, i) => i !== index)

    if (copy.length === 0) {
      setServices([
        {
          name: "",
          price: "",
          duration: "30",
        },
      ])

      return
    }

    setServices(copy)
  }

  async function save() {
    setLoading(true)

    const result = await saveBusinessServices({
      services,
    })

    setLoading(false)

    if (!result.ok) {
      alert(result.error)
      return
    }

    onNext()
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
      <h2 className="text-2xl font-bold text-white">
        Services
      </h2>

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
                disabled={loading}
                className="rounded-xl border border-red-500 px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
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
                className="rounded-xl bg-slate-900 p-3 text-white outline-none placeholder:text-slate-500"
              />

              <input
                value={service.price}
                onChange={(e) =>
                  updateService(index, "price", e.target.value)
                }
                placeholder="Price"
                inputMode="numeric"
                className="rounded-xl bg-slate-900 p-3 text-white outline-none placeholder:text-slate-500"
              />

              <input
                value={service.duration}
                onChange={(e) =>
                  updateService(index, "duration", e.target.value)
                }
                placeholder="Duration minutes"
                inputMode="numeric"
                className="rounded-xl bg-slate-900 p-3 text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addService}
        disabled={loading}
        className="mt-5 rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
      >
        + Add Service
      </button>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
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