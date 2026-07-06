"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react"
import { saveDashboardServices } from "./actions"

type ServiceRow = {
  name: string
  price: string
  duration: string
}

export default function ServicesEditor({
  initialServices,
}: {
  initialServices: ServiceRow[]
}) {
  const router = useRouter()

  const [services, setServices] = useState<ServiceRow[]>(
    initialServices.length > 0
      ? initialServices
      : [
          {
            name: "",
            price: "",
            duration: "30",
          },
        ]
  )

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

    const result = await saveDashboardServices({
      services,
    })

    setLoading(false)

    if (!result.ok) {
      alert(result.error)
      return
    }

    router.refresh()
    alert("Services saved successfully.")
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/business"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Business
        </Link>
      </div>

      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Edit Services
            </h1>

            <p className="mt-2 text-slate-400">
              Manage the services customers can book through Jhyro AI.
            </p>
          </div>

          <button
            type="button"
            onClick={addService}
            disabled={loading}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            <Plus size={18} />
            Add Service
          </button>
        </div>

        <div className="mt-8 space-y-4">
          {services.map((service, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="font-semibold text-white">
                  Service {index + 1}
                </p>

                <button
                  type="button"
                  onClick={() => deleteService(index)}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-500/50 px-3 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label>
                  <span className="text-sm text-slate-400">
                    Service Name
                  </span>

                  <input
                    value={service.name}
                    onChange={(e) =>
                      updateService(index, "name", e.target.value)
                    }
                    placeholder="Example: Haircut"
                    className="mt-2 w-full rounded-xl bg-slate-900 p-3 text-white outline-none placeholder:text-slate-600"
                  />
                </label>

                <label>
                  <span className="text-sm text-slate-400">
                    Price
                  </span>

                  <input
                    value={service.price}
                    onChange={(e) =>
                      updateService(index, "price", e.target.value)
                    }
                    placeholder="Example: 2500"
                    inputMode="numeric"
                    className="mt-2 w-full rounded-xl bg-slate-900 p-3 text-white outline-none placeholder:text-slate-600"
                  />
                </label>

                <label>
                  <span className="text-sm text-slate-400">
                    Duration Minutes
                  </span>

                  <input
                    value={service.duration}
                    onChange={(e) =>
                      updateService(index, "duration", e.target.value)
                    }
                    placeholder="Example: 30"
                    inputMode="numeric"
                    className="mt-2 w-full rounded-xl bg-slate-900 p-3 text-white outline-none placeholder:text-slate-600"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Saving replaces this business’s service list with the services above.
          </p>

          <button
            type="button"
            onClick={save}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-slate-200 disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? "Saving..." : "Save Services"}
          </button>
        </div>
      </section>
    </div>
  )
}