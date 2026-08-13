import { redirect } from "next/navigation";

// Redirect ke static HTML landing di /public/index.html
// Dipakai agar SEO/search engine link tidak rusak (backward compatible),
// dan agar request ke "/" dari siapapun otomatis dapat static HTML version
// yang lebih ringan (no Next.js client bundle).
export default function Home() {
  redirect("/index.html");
}
