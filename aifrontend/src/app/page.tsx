import Header from "../components/dashboard/Header";
import Sidebar from "../components/layout/Sidebar";
import UploadBox from "../components/upload/UploadBox";
import UploadSummary from "../components/upload/UploadSummary";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 flex">
      <Sidebar />

      <section className="flex-1 p-6 md:p-10">
        <Header />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <UploadBox />
          </div>

          <UploadSummary />
        </div>
      </section>
    </main>
  );
}