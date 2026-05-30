interface DashboardStatsProps {
  title: string
  value: string
  icon: React.ReactNode
  colorClass: string
}

export default function DashboardStats({ title, value, icon, colorClass }: DashboardStatsProps) {
  return (
    <div className={`card flex items-center gap-4 ${colorClass}`}>
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}
