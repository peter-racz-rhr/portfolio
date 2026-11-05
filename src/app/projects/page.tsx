import type { Metadata } from "next";
import { ProjectsView } from "@/views/site-views";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return <ProjectsView />;
}
