import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to dashboard or login page
  redirect("/login")

  return null
}

