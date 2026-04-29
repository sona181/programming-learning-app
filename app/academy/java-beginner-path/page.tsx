import { PathOverviewShell } from "@/components/academy/path-overview-shell";
import {
  getAcademyFrontendNotice,
  getAcademyFrontendUserId,
} from "@/lib/academy/dev-user";

export default function JavaBeginnerPathPage() {
  return (
    <PathOverviewShell
      noticeText={getAcademyFrontendNotice()}
      userId={getAcademyFrontendUserId()}
    />
  );
}
