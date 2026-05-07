import { getCurrentSessionUser } from "@/lib/auth/session";
import { getSessionCallAccess } from "@/lib/sessions/access";
import { createJitsiMeetingConfig } from "@/lib/video/jitsi";
import { VideoCallShell } from "@/components/video/video-call-shell";
import { notFound, redirect } from "next/navigation";

type SessionCallPageProps = {
  params: Promise<{
    bookingId: string;
  }>;
};

function getDisplayName(user: {
  email: string;
  profile?: {
    displayName: string;
  } | null;
}) {
  return user.profile?.displayName ?? user.email;
}

export default async function SessionCallPage({ params }: SessionCallPageProps) {
  const currentUser = await getCurrentSessionUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  const { bookingId } = await params;
  const access = await getSessionCallAccess(bookingId, currentUser);

  if (!access) {
    notFound();
  }

  const { booking } = access;
  const studentName = getDisplayName(booking.student);
  const instructorName = getDisplayName(booking.instructorProfile.user);
  const participantName =
    access.participantRole === "instructor" ? instructorName : studentName;

  const config = createJitsiMeetingConfig({
    bookingId: booking.id,
    participant: {
      email: currentUser.email,
      name: participantName,
    },
  });

  return (
    <VideoCallShell
      config={config}
      instructorName={instructorName}
      sessionTitle={booking.topic ?? "Tutoring session"}
      studentName={studentName}
    />
  );
}
