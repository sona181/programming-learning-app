import { JitsiMeeting } from "@/components/video/jitsi-meeting";
import type { JitsiMeetingConfig } from "@/lib/video/jitsi";

type VideoCallShellProps = {
  config: JitsiMeetingConfig;
  sessionTitle: string;
  studentName: string;
  instructorName: string;
};

export function VideoCallShell({
  config,
  instructorName,
  sessionTitle,
  studentName,
}: VideoCallShellProps) {
  return (
    <main className="min-h-dvh bg-slate-100 px-4 py-5 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] max-w-7xl flex-col gap-4">
        <header className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full bg-emerald-500"
              />
              <span>Live session</span>
            </div>
            <h1 className="mt-1 truncate text-xl font-semibold text-slate-950">
              {sessionTitle}
            </h1>
          </div>

          <div className="grid gap-1 text-sm text-slate-600 sm:text-right">
            <span>Professor: {instructorName}</span>
            <span>Student: {studentName}</span>
          </div>
        </header>

        <section className="min-h-0 flex-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <JitsiMeeting
            domain={config.domain}
            participantEmail={config.participant.email}
            participantName={config.participant.name}
            roomName={config.roomName}
          />
        </section>
      </div>
    </main>
  );
}
