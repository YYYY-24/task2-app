import NewForm from "@/components/NewForm";
import { getProjects } from "@/lib/data";

export default async function NewPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; project?: string }>;
}) {
  const { type, project } = await searchParams;
  const projects = await getProjects();

  return (
    <NewForm
      projects={projects}
      initialTab={type === "task" ? "task" : "project"}
      initialProjectId={project ?? ""}
    />
  );
}
