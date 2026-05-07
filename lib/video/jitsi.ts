import "server-only";

type JitsiParticipant = {
  email: string;
  name: string;
};

export type JitsiMeetingConfig = {
  domain: string;
  participant: JitsiParticipant;
  roomName: string;
};

export function createJitsiMeetingConfig({
  bookingId,
  participant,
}: {
  bookingId: string;
  participant: JitsiParticipant;
}): JitsiMeetingConfig {
  const domain = process.env.NEXT_PUBLIC_JITSI_DOMAIN ?? "meet.jit.si";
  const roomName = `unilearn-${bookingId.replace(/-/g, "")}`;

  return {
    domain,
    participant,
    roomName,
  };
}
