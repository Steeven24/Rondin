import { redirect } from "next/navigation";
import { getProfile, HOME_BY_ROLE } from "@/lib/auth";

/** Sends each user to the home screen of their role. */
export default async function HomePage() {
  const profile = await getProfile();
  redirect(profile ? HOME_BY_ROLE[profile.role] : "/login");
}
