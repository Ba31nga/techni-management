import Sidebar from "@/components/Sidebar";

export default function TestAccessPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold">Test Access Page</h1>
        <p>Use this page to visually test the sidebar behavior.</p>
      </div>
    </div>
  );
}
