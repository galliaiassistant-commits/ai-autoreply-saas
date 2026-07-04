import { CalendarView } from "./types"

export default function CalendarToolbar({
  view,
  setView,
}: {
  view: CalendarView
  setView: (view: CalendarView) => void
}) {
  return (
    <div className="flex rounded-xl bg-slate-800 p-1">
      {(["day", "week", "month"] as CalendarView[]).map((item) => (
        <button
          key={item}
          onClick={() => setView(item)}
          className={
            view === item
              ? "rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
              : "rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white"
          }
        >
          {item[0].toUpperCase() + item.slice(1)}
        </button>
      ))}
    </div>
  )
}