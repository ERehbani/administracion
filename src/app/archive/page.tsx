"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TenantMonthlyData = {
  id: string;
  name: string;
  surname: string;
  address: string;
  year: number;
  [key: string]: string | number | undefined | { receipt: string; amount: number };
};

const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default function DashboardPage() {
  const [tenants, setTenants] = useState<TenantMonthlyData[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<TenantMonthlyData[]>([]);
  const [filters, setFilters] = useState({
    name: "",
    surname: "",
    address: "",
    year: "all",
  });
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  useEffect(() => {
    const q = query(collection(db, "receipts"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const receiptData = snapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        const year = new Date(data.createdAt).getFullYear();
        const tenantId = `${data.name}_${data.surname}_${data.address}_${year}`;
        if (!acc[tenantId]) {
          acc[tenantId] = {
            id: tenantId,
            name: data.name,
            surname: data.surname,
            address: data.address,
            year: year,
          };
        }
        acc[tenantId][data.expensesMonth.toLowerCase()] = {
          receipt: data.receipt || 'N/A',
          amount: data.amount
        };
        return acc;
      }, {} as { [key: string]: TenantMonthlyData });

      const tenantList = Object.values(receiptData);
      setTenants(tenantList);

      const years = [...new Set(tenantList.map(tenant => tenant.year))].sort((a, b) => b - a);
      setAvailableYears(years.map(year => year.toString()));
      
      if (years.length > 0 && filters.year === "all") {
        setFilters(prev => ({ ...prev, year: years[0].toString() }));
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = tenants.filter((tenant) => {
      return (
        tenant.name.toLowerCase().includes(filters.name.toLowerCase()) &&
        tenant.surname.toLowerCase().includes(filters.surname.toLowerCase()) &&
        tenant.address.toLowerCase().includes(filters.address.toLowerCase()) &&
        (filters.year === "" || tenant.year === parseInt(filters.year))
      );
    });
    setFilteredTenants(filtered);
  }, [filters, tenants]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleYearChange = (value: string) => {
    setFilters({
      ...filters,
      year: value === "all" ? "" : value,
    });
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Registro de Inquilinos</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="Filtrar por nombre"
            />
          </div>
          <div>
            <Label htmlFor="surname">Apellido</Label>
            <Input
              id="surname"
              name="surname"
              value={filters.surname}
              onChange={handleFilterChange}
              placeholder="Filtrar por apellido"
            />
          </div>
          <div>
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              name="address"
              value={filters.address}
              onChange={handleFilterChange}
              placeholder="Filtrar por dirección"
            />
          </div>
          <div>
            <Label htmlFor="year">Año</Label>
            <Select value={filters.year} onValueChange={handleYearChange}>
              <SelectTrigger id="year">
                <SelectValue placeholder="Seleccionar año" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Todos los años</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="bg-[#f1eab3] rounded-lg overflow-x-auto ">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead rowSpan={2}>Año</TableHead>
              <TableHead rowSpan={2}>Nombre</TableHead>
              <TableHead rowSpan={2}>Dirección</TableHead>
              {months.map((month) => (
                <TableHead key={month} colSpan={2} className="text-center">{month}</TableHead>
              ))}
            </TableRow>
            <TableRow>
              {months.flatMap((month) => [
                <TableHead key={`${month}-receipt`}>Recibo</TableHead>,
                <TableHead key={`${month}-amount`}>Importe</TableHead>
              ])}
            </TableRow>
          </TableHeader>
          <TableBody className="h-[calc(100vh-20vh)]">
            {filteredTenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>{tenant.year}</TableCell>
                <TableCell>{`${tenant.name} ${tenant.surname}`}</TableCell>
                <TableCell>{tenant.address}</TableCell>
                {months.flatMap((month) => {
                  const monthData = tenant[month.toLowerCase()] as { receipt: string; amount: number } | undefined;
                  return [
                    <TableCell key={`${tenant.id}-${month}-receipt`}>
                      {monthData?.receipt || '-'}
                    </TableCell>,
                    <TableCell key={`${tenant.id}-${month}-amount`}>
                      {monthData?.amount !== undefined ? `$${monthData.amount.toFixed(2)}` : '-'}
                    </TableCell>
                  ];
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

