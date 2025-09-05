import "server-only";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default function LegacyLoaRedirect(){ redirect("/loas"); return null; }
