/* eslint-disable react/no-unescaped-entities */
import { ReceiptData } from "@/lib/types";
import {
  Document,
  Font,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";


type ReceiptProps = {
  data: ReceiptData; // Usamos la interfaz como tipo para la prop "data"
};

const Receipt = (items: ReceiptProps) => {
  const { data } = items;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>CONSORCIO DE PROPIETARIOS</Text>
            <Text style={styles.title}>DEL EDIFICIO COMPLEJO HABITACIONAL</Text>
            <Text style={styles.title}>DEL BARRIO "ALMIRANTE BROWN"</Text>
            <Text style={styles.address}>
              MANZANA N° 12 L - JOVELLANOS 1241
            </Text>
            <Text style={styles.subtext}>
              (Artículo N° 1 Reglamento Copropiedad)
            </Text>
            <Text style={styles.subtext}>
              7600 Mar del Plata - Pcia. Buenos Aires
            </Text>
            <Text style={styles.subtext}>República Argentina</Text>
            <Text style={styles.subtext}>IVA NO RESPONSABLE</Text>
          </View>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              margin: "0 10px",
            }}>
            <Text style={{ border: "1px solid black", padding: "5px" }}>X</Text>
            <Text style={{ fontSize: "12px" }}>
              Recibo no válido como factura
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.receiptBox}>
              <Text style={styles.receiptTitle}>RECIBO</Text>
              <Text style={styles.receiptNumber}>N° 0001-00002010</Text>
            </View>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>FECHA</Text>
              <View style={styles.dateGrid}>
                <Text style={styles.dateCell}>{data.day}</Text>
                <Text style={styles.dateCell}>{data.month}</Text>
                <Text style={styles.dateCell}>{data.year}</Text>
              </View>
            </View>
            <View style={styles.cuitBox}>
              <Text style={styles.cuitText}>CUIT N° 30-64446662-4</Text>
              <Text style={styles.cuitText}>ING. BRUTOS: EXENTO</Text>
              <Text style={styles.cuitText}>
                Fecha Inicio de Act.: 22/08/1993
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.label}>Apellido y Nombre:</Text>
            <Text style={styles.value}>
              {data.name} {data.surname}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Domicilio:</Text>
            <Text style={styles.value}>{data.address}</Text>
            <Text style={styles.label}>Localidad:</Text>
            <Text style={styles.value}>M.D.P</Text>
          </View>

          <View style={styles.amountSection}>
            <Text style={styles.label}>Recibí la suma de $</Text>
            <Text style={styles.amountText}>
              {data.amountString.toUpperCase()}
            </Text>
          </View>

          <View style={styles.conceptSection}>
            <Text style={styles.label}>
              en concepto de: Expensas:
              <Text style={styles.month}>
                {" "}
                {data.expensesMonth.toUpperCase()}
              </Text>
            </Text>
            <Text style={styles.value}></Text>
          </View>

          <View style={styles.paymentSection}>
            {data.paymentMethod === "transferencia" ? (
              <Text style={styles.paymentMethod}>
                Tipo de pago: TRANSFERENCIA
              </Text>
            ) : (
              <>
                <Text style={styles.paymentMethod}>Tipo de pago: EFECTIVO</Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                  }}>
                  <Text style={styles.paymentMethod}>
                    Número de cheque: {data.checkNumber}
                  </Text>
                  <Text style={styles.paymentMethod}>Banco: {data.bank}</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.footer}>
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>SON $</Text>
              <Text style={styles.totalAmount}>{data.amount}</Text>
            </View>
            <Text style={styles.sign}>Firma:</Text>
            <Text style={styles.sign}>Aclaración:</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

Font.register({
  family: "Oswald",
  src: "https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf",
});

const styles = StyleSheet.create({
  month: {
    fontWeight: 700,
  },
  footer: {
    flexDirection: "row",
  },
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    width: 200,
  },
  title: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
  },
  address: {
    fontSize: 9,
    marginTop: 5,
  },
  subtext: {
    fontSize: 8,
    marginTop: 2,
  },
  receiptBox: {
    border: 1,
    padding: 5,
    marginBottom: 5,
  },
  receiptTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  receiptNumber: {
    fontSize: 10,
    textAlign: "center",
  },
  dateBox: {
    border: 1,
    marginBottom: 5,
  },
  dateLabel: {
    fontSize: 10,
    textAlign: "center",
    borderBottom: 1,
    padding: 2,
  },
  dateGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 2,
  },
  dateCell: {
    fontSize: 10,
    width: "33%",
    textAlign: "center",
  },
  cuitBox: {
    padding: 2,
  },
  cuitText: {
    fontSize: 8,
    marginBottom: 2,
  },
  content: {
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  label: {
    fontSize: 10,
    marginRight: 5,
  },
  value: {
    fontSize: 10,
    flex: 1,
    borderBottom: 1,
    paddingBottom: 2,
  },
  sign: {
    fontSize: 10,
    flex: 1,
    borderBottom: 1,
    paddingBottom: 5,
    marginTop: 20,
    marginLeft: 10,
  },
  amountSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  amountText: {
    fontSize: 10,
    borderBottom: 1,
    paddingBottom: 2,
    marginTop: 5,
  },
  conceptSection: {
    marginTop: 10,
  },
  paymentSection: {
    marginTop: 30,
  },
  paymentMethod: {
    fontSize: 10,
    textAlign: "left",
    marginBottom: 20,
  },
  totalBox: {
    flexDirection: "row",
    marginTop: 20,
    border: 1,
    padding: 5,
    width: 150,
  },
  totalLabel: {
    fontSize: 10,
    marginRight: 5,
  },
  totalAmount: {
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default Receipt;
