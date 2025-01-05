"use client";
import Receipt from "@/components/receipt";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@radix-ui/react-dropdown-menu";
import { pdf } from "@react-pdf/renderer";
import { addDoc, collection } from "firebase/firestore";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { ReceiptData, SimulatedEvent, User } from "@/lib/types";

const users = [
  {
    apellido: "Perez",
    nombre: "Juan",
    dirección: "M1/1",
    coef: "1.127",
    valor: "48.376",
    saldAnt: "0",
    fRes: "6.337",
    exp: "57.039",
    fdoRes: "0",
    lastExp: "63.376",
    observaciones: "Es limpio",
    deuda: "62.012",
    mes_expensas: "enero",
    celular: "123456789",
    receiptNumber: "123456789",
  },
];

function TableDemo() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const router = useRouter();
  const [filters, setFilters] = useState({
    nombre: "",
    apellido: "",
    dirección: "",
    mes_expensas: ".",
  });

  const usersPerPage = 15;
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const arrayMonths = [
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

  const formik = useFormik({
    initialValues: {
      paymentType: "transferencia",
      expensesMonth: "",
      checkNumber: "",
      bank: "",
      amount: "",
      amountString: "",
      receiptNumber: "",
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  function getCurrentDay() {
    const today = new Date();
    setDay(String(today.getDate()).padStart(2, "0"));
  }

  function getCurrentMonth() {
    const today = new Date();
    setMonth(String(today.getMonth() + 1).padStart(2, "0"));
  }

  function getCurrentYear() {
    const today = new Date();
    setYear(String(today.getFullYear()).slice(-2));
  }

  useEffect(() => {
    getCurrentDay();
    getCurrentMonth();
    getCurrentYear();
  }, []);

  const saveReceiptToFirestore = async (receiptData: ReceiptData) => {
    try {
      // Save to Firestore
      const receiptRef = await addDoc(collection(db, "receipts"), {
        ...receiptData,
        createdAt: new Date().toISOString(),
      });

      toast({ title: "Recibo guardado exitosamente!" });

      return receiptRef;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error saving receipt:", error);
        toast({
          title: "Error al guardar el recibo",
          description: error.message,
        });
        throw error;
      }
    }
  };

  const uploadPdfToCloudinary = async (pdfBlob: Blob, fileName: string) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(pdfBlob);

      const pdfBase64 = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Error reading PDF file"));
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdfData: pdfBase64,
          fileName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error uploading PDF:", error);
      throw error;
    }
  };

  const handleSaveReceipt = async (user: User) => {
    try {
      const receiptData: ReceiptData = {
        name: user.nombre,
        surname: user.apellido,
        address: user.dirección,
        amount: formik.values.amount,
        expensesMonth: formik.values.expensesMonth,
        paymentMethod: formik.values.paymentType,
        amountString: formik.values.amountString,
        bank: formik.values.bank,
        checkNumber: formik.values.checkNumber,
        receiptNumber: formik.values.receiptNumber,
      };

      const pdfBlob = await pdf(<Receipt data={receiptData} />).toBlob();
      const fileName = `recibo_${user.nombre}_${user.apellido}_${Date.now()}`;

      const cloudinaryResponse = await uploadPdfToCloudinary(pdfBlob, fileName);

      receiptData.pdfUrl = cloudinaryResponse.url;
      receiptData.pdfPublicId = cloudinaryResponse.public_id;

      await saveReceiptToFirestore(receiptData);
      receiptData.pdfUrl && router.push(receiptData.pdfUrl);
      toast({
        title: "Recibo guardado exitosamente!",
        description: "PDF subido a Cloudinary y datos guardados en Firebase",
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error saving receipt:", error);
        toast({
          title: "Error al guardar el recibo",
          description: error.message || "Error desconocido",
        });
      }
    }
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    const results = users.filter(
      (user) =>
        user.nombre.toLowerCase().includes(filters.nombre.toLowerCase()) &&
        user.apellido.toLowerCase().includes(filters.apellido.toLowerCase()) &&
        user.dirección
          .toLowerCase()
          .includes(filters.dirección.toLowerCase()) &&
        (filters.mes_expensas === "." ||
          user.mes_expensas?.toLowerCase() ===
            filters.mes_expensas.toLowerCase())
    );
    setFilteredUsers(results);
    setCurrentPage(1);
  }, [filters]);

  const handleFilterChange = (
    e: SimulatedEvent | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleObservationChange = (index: number, value: string) => {
    const updatedUsers = [...filteredUsers];
    updatedUsers[indexOfFirstUser + index].observaciones = value;
    setFilteredUsers(updatedUsers);
  };

  console.log(formik.values);

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold">Gestión de facturas</h2>
      <div className="bg-[#f1eab3] p-4">
        <div className="w-full max-w-4xl mb-4 flex gap-2">
          <Input
            placeholder="Buscar Unidad"
            name="dirección"
            value={filters.dirección}
            onChange={handleFilterChange}
          />
          {/* <Input
            placeholder="Buscar apellido"
            name="apellido"
            value={filters.apellido}
            onChange={handleFilterChange}
          /> */}
          <Input
            placeholder="Buscar nombre"
            name="nombre"
            value={filters.nombre}
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
              {arrayMonths.map((mes) => (
                <SelectItem key={mes} value={mes.toLowerCase()}>
                  {mes}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table className="w-full mx-auto">
          <TableHeader>
            <TableRow>
              <TableHead>List</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Consorcista</TableHead>
              <TableHead>COEF</TableHead>
              <TableHead>VALOR</TableHead>
              <TableHead>sald/ant</TableHead>
              <TableHead>F.RES</TableHead>
              <TableHead>EXP</TableHead>
              <TableHead>FDO RES</TableHead>
              <TableHead>NOV</TableHead>
              <TableHead>DEUDA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentUsers.map((user, index) => (
              <TableRow
                key={`${user.apellido}-${user.celular}`}
                className="max-h-5">
                <TableCell>{index + 1}</TableCell>
                <TableCell>{user.dirección}</TableCell>
                <TableCell>{user.nombre}</TableCell>
                <TableCell>{user.coef}</TableCell>
                <TableCell>{user.valor}</TableCell>
                <TableCell>{user.saldAnt}</TableCell>
                <TableCell>{user.fRes}</TableCell>
                <TableCell>{user.exp}</TableCell>
                <TableCell>{user.fdoRes}</TableCell>
                <TableCell>{user.lastExp}</TableCell>
                <TableCell>{user.deuda}</TableCell>

                <TableCell></TableCell>
                <TableCell className="">
                  <div className="w-48 p-3 mx-auto">
                    <div className="space-y-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-[#4c7f78] hover:bg-white hover:border hover:border-[#4c7f78] hover:text-[#4c7f78] shadow shadow-[#4c7f78]">
                            Realizar factura
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-md shadow-md bg-[#fffaeb] flex flex-col gap-5">
                          <DialogHeader>
                            <DialogTitle
                              className="text-start flex flex-col gap-3
                          ">
                              Crear Factura para{" "}
                              <span>
                                <b>
                                  {user.nombre} {user.apellido}
                                </b>{" "}
                                del <b>{user.dirección}</b>
                              </span>
                            </DialogTitle>
                          </DialogHeader>
                          <SelectSeparator className="bg-black my-3" />
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <Label className="w-full">Tipo de pago</Label>
                              <Select
                                name="paymentType"
                                value={formik.values.paymentType}
                                onValueChange={(value) =>
                                  formik.setFieldValue("paymentType", value)
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
                            {formik.values.paymentType === "efectivo" && (
                              <>
                                <div>
                                  <Label>Número de cheque</Label>
                                  <Input
                                    id="checkNumber"
                                    name="checkNumber"
                                    value={formik.values.checkNumber}
                                    onChange={formik.handleChange}
                                    placeholder="Ingrese el número de cheque"
                                  />
                                </div>
                                <div>
                                  <Label>Banco</Label>
                                  <Input
                                    id="bank"
                                    name="bank"
                                    value={formik.values.bank}
                                    onChange={formik.handleChange}
                                    placeholder="Ingrese el nombre del banco"
                                  />
                                </div>
                              </>
                            )}
                            <div className="flex items-center gap-3">
                              <Label className="w-full">
                                en concepto de:{" "}
                                <span className="font-bold italic">
                                  Expensas
                                </span>
                              </Label>
                              <Select
                                required
                                name="expensesMonth"
                                value={formik.values.expensesMonth}
                                onValueChange={(value) =>
                                  formik.setFieldValue("expensesMonth", value)
                                }>
                                <SelectTrigger>
                                  <SelectValue placeholder="Mes de expensas" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value=".">Todos</SelectItem>
                                  {arrayMonths.map((mes) => (
                                    <SelectItem
                                      key={mes}
                                      value={mes.toLowerCase()}>
                                      {mes}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center gap-3">
                              <Label className="w-full">La suma de:</Label>
                              <Input
                                id="amountString"
                                name="amountString"
                                type="text"
                                value={formik.values.amountString}
                                onChange={formik.handleChange}
                                placeholder="Ingrese la suma"
                              />
                            </div>
                          </div>
                            <div className="flex  items-center gap-3  ">
                              <Label className="w-full">Importe</Label>
                              <Input
                                id="amount"
                                name="amount"
                                type="number"
                                value={formik.values.amount}
                                onChange={formik.handleChange}
                                placeholder="Ingrese el importe"
                              />
                            </div>
                            <div className="flex l items-center gap-3 ">
                              <Label className="w-full">Número de Recibo</Label>
                              <Input
                                id="receiptNumber"
                                name="receiptNumber"
                                type="text"
                                value={formik.values.receiptNumber}
                                onChange={formik.handleChange}
                                placeholder="Ingrese el número de recibo"
                              />
                            </div>
                          <SelectSeparator className="bg-black" />
                          <DialogFooter className="flex flex-col max-sm:flex-col gap-3 items-end">

                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleSaveReceipt(user)}
                                className="bg-[#4c7f78] hover:bg-white hover:border hover:border-[#4c7f78] hover:text-[#4c7f78] shadow shadow-[#4c7f78]">
                                Descargar y Guardar
                              </Button>
                              <Button
                                onClick={() => handleSaveReceipt(user)}
                                className="bg-[#4c7f78] hover:bg-white hover:border hover:border-[#4c7f78] hover:text-[#4c7f78] shadow shadow-[#4c7f78]">
                                Solo Guardar
                              </Button>
                            </div>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button className="bg-white text-black hover:text-white w-full hover:bg-black border border-gray-500 hover:border-black hover:shadow-lg">
                        Editar
                      </Button>
                      <Button className="bg-red-600 text-white w-full hover:bg-white hover:text-red-600 hover:border hover:border-red-600 focus:text-white shadow shadow-red-600">
                        <span>Eliminar</span>
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex mt-4 gap-2 justify-center">
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
    </div>
  );
}

export default TableDemo;
