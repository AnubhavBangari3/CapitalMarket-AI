const menuItems = [
  "Dashboard",
  "Upload SWIFT",
  "Investigations",
  "Trades",
  "Alerts",
  "Audit Logs",
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-[#07111f] border-r border-slate-800 p-6 hidden md:block">
      <div className="mb-10">
        <h1 className="text-xl font-bold text-white">Capital Market AI</h1>
        <p className="text-sm text-slate-400">Resolution System</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <div
            key={item}
            className={`px-4 py-3 rounded-xl cursor-pointer text-sm ${
              item === "Upload SWIFT"
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            {item}
          </div>
        ))}
      </nav>

      <div className="absolute bottom-6 text-sm text-slate-400">
        <p className="font-medium text-white">Ops User</p>
        <p>Operations</p>
      </div>
    </aside>
  );
}