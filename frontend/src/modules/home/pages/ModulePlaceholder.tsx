type ModulePlaceholderProps = {
  titulo: string
}

export function ModulePlaceholder({ titulo }: ModulePlaceholderProps) {
  return (
    <div className="p-6 sm:p-10">
      <h1 className="text-2xl font-semibold tracking-tight text-green-900">{titulo}</h1>
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
        Contenido próximamente.
      </p>
    </div>
  )
}
