export default function SessionCallNotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-slate-950">
          Session unavailable
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          This call does not exist or your account is not part of the booked
          session.
        </p>
      </div>
    </main>
  );
}
