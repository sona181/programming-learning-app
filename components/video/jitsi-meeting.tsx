"use client";

import { useEffect, useRef, useState } from "react";

type JitsiApi = {
  dispose: () => void;
};

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (
      domain: string,
      options: {
        configOverwrite?: Record<string, unknown>;
        interfaceConfigOverwrite?: Record<string, unknown>;
        parentNode: HTMLElement;
        roomName: string;
        userInfo?: {
          displayName?: string;
          email?: string;
        };
        width?: string;
        height?: string;
      },
    ) => JitsiApi;
  }
}

type JitsiMeetingProps = {
  domain: string;
  participantEmail: string;
  participantName: string;
  roomName: string;
};

function loadJitsiScript(domain: string) {
  const scriptId = `jitsi-external-api-${domain}`;
  const existingScript = document.getElementById(scriptId);

  if (existingScript) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://${domain}/external_api.js`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Jitsi."));
    document.body.appendChild(script);
  });
}

export function JitsiMeeting({
  domain,
  participantEmail,
  participantName,
  roomName,
}: JitsiMeetingProps) {
  const apiRef = useRef<JitsiApi | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function mountMeeting() {
      try {
        await loadJitsiScript(domain);

        if (!isMounted || !containerRef.current || !window.JitsiMeetExternalAPI) {
          return;
        }

        apiRef.current = new window.JitsiMeetExternalAPI(domain, {
          parentNode: containerRef.current,
          roomName,
          width: "100%",
          height: "100%",
          userInfo: {
            displayName: participantName,
            email: participantEmail,
          },
          configOverwrite: {
            prejoinPageEnabled: true,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
          },
        });
      } catch {
        if (isMounted) {
          setError("The video call could not be loaded.");
        }
      }
    }

    mountMeeting();

    return () => {
      isMounted = false;
      apiRef.current?.dispose();
      apiRef.current = null;
    };
  }, [domain, participantEmail, participantName, roomName]);

  if (error) {
    return (
      <div className="flex h-full min-h-[480px] items-center justify-center rounded-xl border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full min-h-[480px] overflow-hidden rounded-xl bg-slate-950"
    />
  );
}
