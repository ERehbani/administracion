"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-dropdown-menu";

const users = [
  {
    apellido: "Perez",
    nombre: "Juan",
    dirección: "5-C",
    celular: "123456789",
    mes_expensas: "Noviembre",
    valor: "120.000",
    observaciones: "Es limpio",
  },
  {
    apellido: "Gonzalez",
    nombre: "Maria",
    dirección: "10-A",
    celular: "987654321",
    mes_expensas: "Diciembre",
    valor: "150.000",
    observaciones: "Tiene mascota",
  },
  {
    apellido: "Martinez",
    nombre: "Carlos",
    dirección: "7-B",
    celular: "234567890",
    mes_expensas: "Octubre",
    valor: "110.000",
    observaciones: "No paga a tiempo",
  },
  {
    apellido: "Fernandez",
    nombre: "Lucia",
    dirección: "3-D",
    celular: "345678901",
    mes_expensas: "Septiembre",
    valor: "130.000",
    observaciones: "Es ruidoso",
  },
  {
    apellido: "Lopez",
    nombre: "Juan",
    dirección: "2-E",
    celular: "456789012",
    mes_expensas: "Agosto",
    valor: "140.000",
    observaciones: "Tiene hijos pequeños",
  },
  {
    apellido: "Rodriguez",
    nombre: "Ana",
    dirección: "8-F",
    celular: "567890123",
    mes_expensas: "Julio",
    valor: "120.000",
    observaciones: "Es responsable",
  },
  {
    apellido: "Garcia",
    nombre: "Miguel",
    dirección: "9-G",
    celular: "678901234",
    mes_expensas: "Junio",
    valor: "125.000",
    observaciones: "Es amistoso",
  },
  {
    apellido: "Sanchez",
    nombre: "Laura",
    dirección: "6-H",
    celular: "789012345",
    mes_expensas: "Mayo",
    valor: "135.000",
    observaciones: "Tiene perro",
  },
  {
    apellido: "Diaz",
    nombre: "Pedro",
    dirección: "4-I",
    celular: "890123456",
    mes_expensas: "Abril",
    valor: "115.000",
    observaciones: "Viaja frecuentemente",
  },
  {
    apellido: "Romero",
    nombre: "Sofia",
    dirección: "1-J",
    celular: "901234567",
    mes_expensas: "Marzo",
    valor: "145.000",
    observaciones: "Es estudiante",
  },
  {
    apellido: "Perez",
    nombre: "Luis",
    dirección: "11-K",
    celular: "123456780",
    mes_expensas: "Febrero",
    valor: "160.000",
    observaciones: "Es jubilado",
  },
  {
    apellido: "Hernandez",
    nombre: "Elena",
    dirección: "12-L",
    celular: "234567891",
    mes_expensas: "Enero",
    valor: "170.000",
    observaciones: "Trabaja desde casa",
  },
  {
    apellido: "Torres",
    nombre: "Jorge",
    dirección: "13-M",
    celular: "345678902",
    mes_expensas: "Diciembre",
    valor: "175.000",
    observaciones: "Tiene dos coches",
  },
  {
    apellido: "Vazquez",
    nombre: "Mariana",
    dirección: "14-N",
    celular: "456789013",
    mes_expensas: "Noviembre",
    valor: "165.000",
    observaciones: "Es vegana",
  },
  {
    apellido: "Ramos",
    nombre: "Fernando",
    dirección: "15-O",
    celular: "567890124",
    mes_expensas: "Octubre",
    valor: "155.000",
    observaciones: "Es músico",
  },
  {
    apellido: "Mendez",
    nombre: "Gloria",
    dirección: "16-P",
    celular: "678901235",
    mes_expensas: "Septiembre",
    valor: "180.000",
    observaciones: "Es artista",
  },
  {
    apellido: "Silva",
    nombre: "Pablo",
    dirección: "17-Q",
    celular: "789012346",
    mes_expensas: "Agosto",
    valor: "190.000",
    observaciones: "Trabaja en el extranjero",
  },
  {
    apellido: "Morales",
    nombre: "Gabriela",
    dirección: "18-R",
    celular: "890123457",
    mes_expensas: "Julio",
    valor: "200.000",
    observaciones: "Es atleta",
  },
  {
    apellido: "Ortiz",
    nombre: "Ricardo",
    dirección: "19-S",
    celular: "901234568",
    mes_expensas: "Junio",
    valor: "210.000",
    observaciones: "Es escritor",
  },
  {
    apellido: "Gutierrez",
    nombre: "Valeria",
    dirección: "20-T",
    celular: "123456789",
    mes_expensas: "Mayo",
    valor: "220.000",
    observaciones: "Es maestra",
  },
];

function TableDemo() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [filters, setFilters] = useState({
    nombre: "",
    apellido: "",
    dirección: "",
    mes_expensas: ".",
  });
  const [invoiceData, setInvoiceData] = useState({
    paymentType: "",
    checkNumber: "",
    bank: "",
    amount: "",
  });

  const usersPerPage = 15;
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber: number): void => setCurrentPage(pageNumber);

  useEffect(() => {
    const results = users.filter(
      (user) =>
        user.nombre.toLowerCase().includes(filters.nombre.toLowerCase()) &&
        user.apellido.toLowerCase().includes(filters.apellido.toLowerCase()) &&
        user.dirección
          .toLowerCase()
          .includes(filters.dirección.toLowerCase()) &&
        (filters.mes_expensas === "." ||
          user.mes_expensas.toLowerCase() ===
            filters.mes_expensas.toLowerCase())
    );
    setFilteredUsers(results);
    setCurrentPage(1);
  }, [filters]);

  interface FilterChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

  const handleFilterChange = (e: FilterChangeEvent): void => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleObservationChange = (index: number, value: string): void => {
    const updatedUsers = [...filteredUsers];
    updatedUsers[indexOfFirstUser + index].observaciones = value;
    setFilteredUsers(updatedUsers);
  };

  interface InvoiceDataChangeEvent
    extends React.ChangeEvent<HTMLInputElement> {}

  const handleInvoiceDataChange = (e: InvoiceDataChangeEvent): void => {
    const { name, value } = e.target;
    setInvoiceData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="w-full flex flex-col items-center p-4">
      <div className="w-full max-w-4xl mb-4 flex gap-2">
        <Input
          placeholder="Buscar apellido"
          name="apellido"
          value={filters.apellido}
          onChange={handleFilterChange}
        />
        <Input
          placeholder="Buscar nombre"
          name="nombre"
          value={filters.nombre}
          onChange={handleFilterChange}
        />
        <Input
          placeholder="Buscar Dirección"
          name="dirección"
          value={filters.dirección}
          onChange={handleFilterChange}
        />
        <Select
          name="mes_expensas"
          value={filters.mes_expensas}
          onValueChange={(value) =>
            handleFilterChange({ target: { name: "mes_expensas", value } })
          }>
          <SelectTrigger>
            <SelectValue placeholder="Mes de expensas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=".">Todos</SelectItem>
            {[
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
            ].map((mes) => (
              <SelectItem key={mes} value={mes.toLowerCase()}>
                {mes}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table className="w-full mx-auto max-w-4xl">
        <TableHeader>
          <TableRow>
            <TableHead>Apellido</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead>Celular</TableHead>
            <TableHead>Observaciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentUsers.map((user, index) => (
            <TableRow key={`${user.apellido}-${user.celular}`}>
              <TableCell className="font-medium">{user.apellido}</TableCell>
              <TableCell>{user.nombre}</TableCell>
              <TableCell>{user.dirección}</TableCell>
              <TableCell>{user.celular}</TableCell>

              <TableCell>
                <Textarea
                  value={user.observaciones}
                  onChange={(e) =>
                    handleObservationChange(index, e.target.value)
                  }
                  className="w-full resize-none"
                />
              </TableCell>
              <TableCell>
                <div className="w-48 p-3">
                  <div className="space-y-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-black cursor-pointer hover:bg-white w-full hover:text-black hover:border hover:border-black">
                          Realizar factura
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Crear Factura para{" "}
                            <b>
                              {user.nombre} {user.apellido}
                            </b>{" "}
                            del <b>{user.dirección}</b>
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="paymentType">Tipo de pago</Label>
                            <Select
                              name="paymentType"
                              value={invoiceData.paymentType}
                              onValueChange={(value) =>
                                handleInvoiceDataChange({
                                  target: { name: "paymentType", value },
                                })
                              }>
                              <SelectTrigger id="paymentType">
                                <SelectValue placeholder="Seleccione el tipo de pago" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="efectivo">
                                  Efectivo
                                </SelectItem>
                                <SelectItem value="transferencia">
                                  Transferencia
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {invoiceData.paymentType === "efectivo" && (
                            <>
                              <div>
                                <Label htmlFor="checkNumber">
                                  Número de cheque
                                </Label>
                                <Input
                                  id="checkNumber"
                                  name="checkNumber"
                                  value={invoiceData.checkNumber}
                                  onChange={handleInvoiceDataChange}
                                  placeholder="Ingrese el número de cheque"
                                />
                              </div>
                              <div>
                                <Label htmlFor="bank">Banco</Label>
                                <Input
                                  id="bank"
                                  name="bank"
                                  value={invoiceData.bank}
                                  onChange={handleInvoiceDataChange}
                                  placeholder="Ingrese el nombre del banco"
                                />
                              </div>
                            </>
                          )}
                          <div>
                            <Label>
                              en concepto de:{" "}
                              <span className="font-bold italic">Expensas</span>
                            </Label>
                            <Select
                              name="mes_expensas"
                              // value={filters.mes_expensas}
                              // onValueChange={(value) =>
                              //   handleFilterChange({
                              //     target: { name: "mes_expensas", value },
                              //   })
                              // }
                              >
                              <SelectTrigger>
                                <SelectValue placeholder="Mes de expensas" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value=".">Todos</SelectItem>
                                {[
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
                                ].map((mes) => (
                                  <SelectItem
                                    key={mes}
                                    value={mes.toLowerCase()}>
                                    {mes}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="amount">Importe</Label>
                            <Input
                              id="amount"
                              name="amount"
                              type="number"
                              value={invoiceData.amount}
                              onChange={handleInvoiceDataChange}
                              placeholder="Ingrese el importe"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button className="w-full bg-black hover:bg-white hover:border hover:border-black hover:text-black">Descargar Factura</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button className="bg-white text-black w-full hover:bg-white hover:border hover:border-black">
                      Editar
                    </Button>
                    <Button className="bg-red-600 text-white w-full hover:bg-white hover:text-red-600 hover:border hover:border-red-600 focus:text-white">
                      <span>Eliminar</span>
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex mt-4 gap-2 ">
        {Array.from(
          { length: Math.ceil(filteredUsers.length / usersPerPage) },
          (_, i) => (
            <Button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              variant={currentPage === i + 1 ? "default" : "outline"}>
              {i + 1}
            </Button>
          )
        )}
      </div>
    </div>
  );
}

export default TableDemo;
