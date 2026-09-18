import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex">
      <Sidebar />
      <div className="flex-1 overflow-auto p-9 md:p-10">{children}</div>
    </div>
  );
}
