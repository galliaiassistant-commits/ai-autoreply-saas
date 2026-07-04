export default function IntegrationStatus({
  connected,
  comingSoon,
}: {
  connected: boolean
  comingSoon?: boolean
}) {
  if (comingSoon) {
    return (
      <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
        Coming Soon
      </span>
    )
  }

  if (connected) {
    return (
      <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
        Connected
      </span>
    )
  }

  return (
    <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
      Not Connected
    </span>
  )
}