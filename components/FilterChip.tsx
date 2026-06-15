interface FilterChipProps {
  label:    string
  selected: boolean
  onClick:  () => void
}

export default function FilterChip({ label, selected, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm border transition-all duration-150 active:scale-95 ${
        selected
          ? 'bg-charcoal text-cream border-charcoal font-medium'
          : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
      }`}
    >
      {label}
    </button>
  )
}
