import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import TableDemo from "./dashboard/page";
import DashboardPage from "./archive/page";

export default function Home() {
  return (
    <main className="bg-[#fffaeb] flex min-h-screen flex-col space-y-10">

      <h1 className="text-4xl font-semibold text-start">Gestión de inquilinos Jovellanos 1241</h1>
      <Tabs defaultValue="account" className="w-full">
        <TabsList>
          <TabsTrigger value="account">Gestion de facturas</TabsTrigger>
          <TabsTrigger value="password">Archivo</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <TableDemo />
        </TabsContent>
        <TabsContent value="password">
          <DashboardPage />
        </TabsContent>
      </Tabs>
    </main>
  );
}
