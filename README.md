# 📊 Knjigovodstveni ERP Sistem

Kompletan profesionalni program za knjigovodstvo sa svim modulima, Dashboard dizajnom i tamnom/svetlom temom.

## 🚀 Pokretanje projekta

```bash
npm install
npm run dev
```

## 🔌 API Dokumentacija

Ova demo verzija koristi **Local Storage** za čuvanje podataka. Ispod je specifikacija API endpointa za buduću integraciju sa backend-om.

---

## 📋 Endpointi

### Klijenti (Clients)

| Metoda | Endpoint | Opis | Request Body | Response |
|--------|----------|------|--------------|----------|
| GET | `/api/clients` | Lista svih klijenata | - | `Client[]` |
| GET | `/api/clients/:id` | Pojedinačni klijent | - | `Client` |
| POST | `/api/clients` | Kreiraj klijenta | `CreateClientDTO` | `Client` |
| PUT | `/api/clients/:id` | Ažuriraj klijenta | `UpdateClientDTO` | `Client` |
| DELETE | `/api/clients/:id` | Obriši klijenta | - | `{ success: boolean }` |

**Client Interface:**
```typescript
interface Client {
  id: string;
  name: string;
  pib: string;
  maticniBroj: string;
  address: string;
  city: string;
  email: string;
  phone: string;
  contactPerson: string;
  createdAt: string;
}
```

---

### Fakture (Invoices)

| Metoda | Endpoint | Opis | Request Body | Response |
|--------|----------|------|--------------|----------|
| GET | `/api/invoices` | Lista svih faktura | - | `Invoice[]` |
| GET | `/api/invoices/:id` | Pojedinačna faktura | - | `Invoice` |
| POST | `/api/invoices` | Kreiraj fakturu | `CreateInvoiceDTO` | `Invoice` |
| PUT | `/api/invoices/:id` | Ažuriraj fakturu | `UpdateInvoiceDTO` | `Invoice` |
| DELETE | `/api/invoices/:id` | Obriši fakturu | - | `{ success: boolean }` |
| POST | `/api/invoices/:id/send` | Pošalji fakturu | - | `{ success: boolean }` |
| POST | `/api/invoices/:id/mark-paid` | Označi kao plaćeno | `{ paidDate: string }` | `Invoice` |

**Invoice Interface:**
```typescript
interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  vat: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  type: 'invoice' | 'proforma' | 'credit';
}

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  vatRate: number;
  total: number;
}
```

---

### Nalozi za plaćanje (Payment Orders)

| Metoda | Endpoint | Opis | Request Body | Response |
|--------|----------|------|--------------|----------|
| GET | `/api/payment-orders` | Lista naloga | - | `PaymentOrder[]` |
| POST | `/api/payment-orders` | Kreiraj nalog | `CreatePaymentOrderDTO` | `PaymentOrder` |
| PUT | `/api/payment-orders/:id/approve` | Odobri nalog | - | `PaymentOrder` |
| PUT | `/api/payment-orders/:id/execute` | Izvrši nalog | - | `PaymentOrder` |
| PUT | `/api/payment-orders/:id/reject` | Odbij nalog | `{ reason: string }` | `PaymentOrder` |

**PaymentOrder Interface:**
```typescript
interface PaymentOrder {
  id: string;
  number: string;
  date: string;
  recipientName: string;
  recipientAccount: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'executed' | 'rejected';
  paymentCode: string;
  referenceNumber: string;
}
```

---

### Zaposleni (Employees)

| Metoda | Endpoint | Opis | Request Body | Response |
|--------|----------|------|--------------|----------|
| GET | `/api/employees` | Lista zaposlenih | - | `Employee[]` |
| GET | `/api/employees/:id` | Pojedinačni zaposleni | - | `Employee` |
| POST | `/api/employees` | Kreiraj zaposlenog | `CreateEmployeeDTO` | `Employee` |
| PUT | `/api/employees/:id` | Ažuriraj zaposlenog | `UpdateEmployeeDTO` | `Employee` |
| DELETE | `/api/employees/:id` | Obriši zaposlenog | - | `{ success: boolean }` |

**Employee Interface:**
```typescript
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  jmbg: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  salary: number;
  startDate: string;
  status: 'active' | 'inactive' | 'on-leave';
}
```

---

### Artikli (Articles)

| Metoda | Endpoint | Opis | Request Body | Response |
|--------|----------|------|--------------|----------|
| GET | `/api/articles` | Lista artikala | - | `Article[]` |
| GET | `/api/articles/:id` | Pojedinačni artikal | - | `Article` |
| POST | `/api/articles` | Kreiraj artikal | `CreateArticleDTO` | `Article` |
| PUT | `/api/articles/:id` | Ažuriraj artikal | `UpdateArticleDTO` | `Article` |
| DELETE | `/api/articles/:id` | Obriši artikal | - | `{ success: boolean }` |
| PUT | `/api/articles/:id/stock` | Ažuriraj zalihe | `{ quantity: number, type: 'add' \| 'remove' }` | `Article` |

**Article Interface:**
```typescript
interface Article {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  price: number;
  vatRate: number;
  stock: number;
  minStock: number;
}
```

---

### Ugovori (Contracts)

| Metoda | Endpoint | Opis | Request Body | Response |
|--------|----------|------|--------------|----------|
| GET | `/api/contracts` | Lista ugovora | - | `Contract[]` |
| POST | `/api/contracts` | Kreiraj ugovor | `CreateContractDTO` | `Contract` |
| PUT | `/api/contracts/:id` | Ažuriraj ugovor | `UpdateContractDTO` | `Contract` |
| PUT | `/api/contracts/:id/terminate` | Raskini ugovor | `{ reason: string }` | `Contract` |

---

### Porezi (Taxes)

| Metoda | Endpoint | Opis | Request Body | Response |
|--------|----------|------|--------------|----------|
| GET | `/api/taxes` | Lista poreskih obaveza | - | `TaxRecord[]` |
| POST | `/api/taxes/:id/pay` | Plati porez | `{ paidDate: string }` | `TaxRecord` |
| GET | `/api/taxes/vat-report` | PDV izveštaj | `?period=2024-03` | `VatReport` |
| POST | `/api/taxes/pppdv/generate` | Generiši PPPDV | `{ period: string }` | `PPPDVForm` |

---

### Izvodi banke (Bank Statements)

| Metoda | Endpoint | Opis | Request Body | Response |
|--------|----------|------|--------------|----------|
| GET | `/api/bank-statements` | Lista izvoda | - | `BankStatement[]` |
| POST | `/api/bank-statements/import` | Uvezi izvod | `FormData (file)` | `BankStatement` |
| GET | `/api/bank-statements/:id/transactions` | Transakcije izvoda | - | `Transaction[]` |

---

## 🔐 Autentifikacija

Svi API pozivi zahtevaju JWT token u header-u:

```
Authorization: Bearer <token>
```

### Autentifikacija Endpointi

| Metoda | Endpoint | Opis | Request Body | Response |
|--------|----------|------|--------------|----------|
| POST | `/api/auth/login` | Prijava | `{ email, password }` | `{ token, user }` |
| POST | `/api/auth/logout` | Odjava | - | `{ success: boolean }` |
| GET | `/api/auth/me` | Trenutni korisnik | - | `User` |

---

## 📊 Izveštaji

| Metoda | Endpoint | Opis | Query Params | Response |
|--------|----------|------|--------------|----------|
| GET | `/api/reports/financial` | Finansijski izveštaj | `?from=&to=` | `FinancialReport` |
| GET | `/api/reports/sales` | Izveštaj prodaje | `?from=&to=&groupBy=` | `SalesReport` |
| GET | `/api/reports/cash-flow` | Keš flow | `?from=&to=` | `CashFlowReport` |
| GET | `/api/reports/profitability` | Profitabilnost | `?from=&to=` | `ProfitabilityReport` |

---

## 📦 Tehnologije

- **Frontend:** React 18, TypeScript, Vite
- **UI:** Tailwind CSS, shadcn/ui, Radix UI
- **Grafici:** Recharts
- **Routing:** React Router v6
- **State:** React Query, Context API
- **Storage:** Local Storage (demo), Supabase (produkcija)

---

## 📁 Struktura projekta

```
src/
├── components/
│   ├── layout/          # Layout komponente (Sidebar, Header)
│   └── ui/              # shadcn/ui komponente
├── contexts/            # React konteksti (Theme)
├── data/                # Demo podaci
├── hooks/               # Custom hooks
├── pages/
│   ├── finance/         # Finansije stranice
│   ├── clients/         # Klijenti stranice
│   ├── hr/              # HR stranice
│   ├── sales/           # Prodaja stranice
│   ├── inventory/       # Inventar stranice
│   ├── projects/        # Projekti stranice
│   ├── marketing/       # Marketing stranice
│   └── automation/      # Automatizacija stranice
└── lib/                 # Utility funkcije
```

---

## 🔧 Konfiguracija

Za produkcijsku verziju, podesite sledeće environment varijable:

```env
VITE_API_URL=https://api.example.com
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```
