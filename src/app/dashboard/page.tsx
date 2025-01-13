"use client";

import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { ReceiptData, User } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useFormik } from 'formik';
import { pdf } from '@react-pdf/renderer';
import Receipt from '@/components/receipt';
import { useRouter } from 'next/navigation';

function TableDemo() {
  const { toast } = useToast();
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    nombre: "",
    apellido: "",
    dirección: "",
    mes_expensas: ".",
  });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({});
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
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

  const usersPerPage = 15;
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(query(usersCollection, orderBy('apellido')));
      const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setFilteredUsers(userList);
    } catch (error) {
      console.error("Error fetching users: ", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios. Por favor, intente de nuevo.",
      });
    }
    setIsLoading(false);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const results = filteredUsers.filter(
      (user) =>
        user.nombre.toLowerCase().includes(filters.nombre.toLowerCase()) &&
        user.apellido.toLowerCase().includes(filters.apellido.toLowerCase()) &&
        user.dirección.toLowerCase().includes(filters.dirección.toLowerCase()) &&
        (filters.mes_expensas === "." || user.mes_expensas?.toLowerCase() === filters.mes_expensas.toLowerCase())
    );
    setFilteredUsers(results);
    setCurrentPage(1);
  }, [filters]);

  const handleAddUser = async () => {
    try {
      await addDoc(collection(db, 'users'), newUser);
      setIsAddingUser(false);
      setNewUser({});
      fetchUsers();
      toast({
        title: "Usuario agregado",
        description: "El nuevo consorcista ha sido agregado exitosamente.",
      });
    } catch (error) {
      console.error("Error adding new user: ", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el nuevo consorcista. Por favor, intente de nuevo.",
      });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<User>>({});

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditedValues(currentUsers[index]);
  };

  const handleSave = async (index: number) => {
    try {
      const updatedUser = { ...currentUsers[index], ...editedValues };
      const userRef = doc(db, "users", updatedUser.id);
      await updateDoc(userRef, editedValues);

      const updatedUsers = [...filteredUsers];
      updatedUsers[indexOfFirstUser + index] = updatedUser;
      setFilteredUsers(updatedUsers);
      setEditingIndex(null);
      setEditedValues({});

      toast({
        title: "Cambios guardados",
        description: "Los datos del usuario han sido actualizados correctamente.",
      });
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al guardar los cambios. Por favor, inténtalo de nuevo.",
      });
    }
  };

  const handleCreateInvoice = (user: User) => {
    setSelectedUser(user);
    setIsInvoiceFormOpen(true);
  };

  const handleInvoiceSubmit = async (invoiceData: any) => {
    if (!selectedUser) return;

    try {
      // Aquí iría la lógica para crear la factura en el backend
      console.log("Creando factura:", { user: selectedUser, ...invoiceData });
      
      // Simulamos una llamada al backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Factura creada",
        description: `Se ha creado la factura para ${selectedUser.nombre} ${selectedUser.apellido}`,
      });

      setIsInvoiceFormOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error al crear la factura:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear la factura. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteDoc(doc(db, "users", userToDelete.id));
      setFilteredUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      toast({
        title: "Usuario eliminado",
        description: `${userToDelete.nombre} ${userToDelete.apellido} ha sido eliminado correctamente.`,
      });
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar el usuario. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

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
          <Input
            placeholder="Buscar nombre"
            name="nombre"
            value={filters.nombre}
            onChange={handleFilterChange}
          />
          <Button onClick={() => setIsAddingUser(true)}>Agregar Consorcista</Button>
        </div>

        <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Consorcista</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Input id="nombre" name="nombre" placeholder="Nombre" onChange={handleInputChange} />
                <Input id="apellido" name="apellido" placeholder="Apellido" onChange={handleInputChange} />
                <Input id="dirección" name="dirección" placeholder="Unidad" onChange={handleInputChange} />
                <Input id="coef" name="coef" placeholder="COEF" onChange={handleInputChange} />
                <Input id="valor" name="valor" placeholder="VALOR" onChange={handleInputChange} />
                <Input id="saldAnt" name="saldAnt" placeholder="sald/ant" onChange={handleInputChange} />
                <Input id="fRes" name="fRes" placeholder="F.RES" onChange={handleInputChange} />
                <Input id="exp" name="exp" placeholder="EXP" onChange={handleInputChange} />
                <Input id="fdoRes" name="fdoRes" placeholder="FDO RES" onChange={handleInputChange} />
                <Input id="lastExp" name="lastExp" placeholder="Valor del mes" onChange={handleInputChange} />
                <Input id="deuda" name="deuda" placeholder="DEUDA" onChange={handleInputChange} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddUser}>Agregar Consorcista</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
              <TableHead>Valor del mes</TableHead>
              <TableHead>DEUDA</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={12}>Cargando...</TableCell>
              </TableRow>
            ) : currentUsers.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell>{indexOfFirstUser + index + 1}</TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <Input
                      name="dirección"
                      value={editedValues.dirección || user.dirección}
                      onChange={handleInputChange}
                    />
                  ) : (
                    user.dirección
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <Input
                      name="nombre"
                      value={editedValues.nombre || user.nombre}
                      onChange={handleInputChange}
                    />
                  ) : (
                    user.nombre
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <Input
                      name="coef"
                      value={editedValues.coef || user.coef}
                      onChange={handleInputChange}
                    />
                  ) : (
                    user.coef
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <Input
                      name="valor"
                      value={editedValues.valor || user.valor}
                      onChange={handleInputChange}
                    />
                  ) : (
                    user.valor
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <Input
                      name="saldAnt"
                      value={editedValues.saldAnt || user.saldAnt}
                      onChange={handleInputChange}
                    />
                  ) : (
                    user.saldAnt
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <Input
                      name="fRes"
                      value={editedValues.fRes || user.fRes}
                      onChange={handleInputChange}
                    />
                  ) : (
                    user.fRes
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <Input
                      name="exp"
                      value={editedValues.exp || user.exp}
                      onChange={handleInputChange}
                    />
                  ) : (
                    user.exp
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <Input
                      name="fdoRes"
                      value={editedValues.fdoRes || user.fdoRes}
                      onChange={handleInputChange}
                    />
                  ) : (
                    user.fdoRes
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <Input
                      name="lastExp"
                      value={editedValues.lastExp || user.lastExp}
                      onChange={handleInputChange}
                    />
                  ) : (
                    user.lastExp
                  )}
                </TableCell>
                <TableCell>
                  {editingIndex === index ? (
                    <Input
                      name="deuda"
                      value={editedValues.deuda || user.deuda}
                      onChange={handleInputChange}
                    />
                  ) : (
                    user.deuda
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-2">
                    {editingIndex === index ? (
                      <>
                        <Button onClick={() => handleSave(index)}>Guardar</Button>
                        <Button onClick={() => setEditingIndex(null)}>Cancelar</Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => handleEdit(index)}>Editar</Button>
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
                        <Button onClick={() => handleDeleteUser(user)} variant="destructive">Borrar</Button>
                      </>
                    )}
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
                onClick={() => setCurrentPage(i + 1)}
                variant={currentPage === i + 1 ? "default" : "outline"}>
                {i + 1}
              </Button>
            )
          )}
        </div>
      </div>
      {selectedUser && (
        <InvoiceForm
          user={selectedUser}
          isOpen={isInvoiceFormOpen}
          onClose={() => setIsInvoiceFormOpen(false)}
          onSubmit={handleInvoiceSubmit}
        />
      )}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          <p>¿Está seguro que desea eliminar a {userToDelete?.nombre} {userToDelete?.apellido}?</p>
          <DialogFooter>
            <Button onClick={() => setIsDeleteModalOpen(false)} variant="outline">Cancelar</Button>
            <Button onClick={confirmDeleteUser} variant="destructive">Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TableDemo;

