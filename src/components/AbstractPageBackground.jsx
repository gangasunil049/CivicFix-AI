export default function AbstractPageBackground({ children }) {
  return (
    <div className="relative isolate min-h-[calc(100vh-56px)] overflow-hidden bg-[#111827] px-4 py-10 sm:px-6">
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/report-abstract.svg')" }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
