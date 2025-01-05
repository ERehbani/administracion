export interface ReceiptData {
  day?: string;
  month?: string;
  year?: string;
  name: string;
  surname: string;
  address: string;
  amount: string;
  expensesMonth: string;
  paymentMethod: string;
  amountString: string;
  checkNumber?: string; // Opcional
  bank?: string; // Opcional
  pdfUrl?: string;
  pdfPublicId?: string
  receiptNumber: string;
}

export interface SimulatedEvent {
  target: {
    name: string;
    value: string;
  };
}

export interface User {
  apellido: string;
  nombre: string;
  dirección: string;
  celular: string;
  mes_expensas: string;
  valor: string;
  observaciones: string;
}
