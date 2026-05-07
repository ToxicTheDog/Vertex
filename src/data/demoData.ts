import { DEMO_MODE } from '@/config/api';

// Demo data za ERP sistem

export interface Client {
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

export interface Invoice {
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

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  vatRate: number;
  total: number;
}

export interface Employee {
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

export interface Article {
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

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  capacity: number;
  usedCapacity: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface PaymentOrder {
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

export interface BankStatement {
  id: string;
  date: string;
  bankName: string;
  accountNumber: string;
  openingBalance: number;
  closingBalance: number;
  transactionsCount: number;
  totalIncome: number;
  totalExpense: number;
}

export interface Contract {
  id: string;
  number: string;
  title: string;
  clientId: string;
  clientName: string;
  type: 'sales' | 'purchase' | 'service' | 'rental';
  startDate: string;
  endDate: string;
  value: number;
  status: 'draft' | 'active' | 'completed' | 'terminated';
}

export interface CrmNote {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  subject: string;
  content: string;
  author: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  manager: string;
  phone: string;
  isActive: boolean;
}

export interface FiscalRegister {
  id: string;
  branchId: string;
  branchName: string;
  serialNumber: string;
  model: string;
  lastServiceDate: string;
  status: 'active' | 'inactive' | 'service';
}

export interface PosTerminal {
  id: string;
  branchId: string;
  branchName: string;
  terminalId: string;
  provider: string;
  status: 'active' | 'inactive';
}

export interface Order {
  id: string;
  number: string;
  date: string;
  clientId?: string;
  clientName?: string;
  supplierId?: string;
  supplierName?: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  type: 'received' | 'issued';
}

export interface OrderItem {
  id: string;
  articleId: string;
  articleName: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

export interface Supplier {
  id: string;
  name: string;
  pib: string;
  maticniBroj: string;
  address: string;
  city: string;
  email: string;
  phone: string;
  contactPerson: string;
  paymentTerms: number;
  rating: number;
}

export interface PriceList {
  id: string;
  name: string;
  validFrom: string;
  validTo: string;
  currency: string;
  isActive: boolean;
  itemsCount: number;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  description: string;
  articlesCount: number;
}

export interface SerialNumber {
  id: string;
  articleId: string;
  articleName: string;
  serialNumber: string;
  lotNumber?: string;
  expiryDate?: string;
  warehouseId: string;
  warehouseName: string;
  status: 'in-stock' | 'sold' | 'reserved';
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  hoursWorked: number;
  projectId?: string;
  projectName?: string;
  description: string;
}

export interface PayrollEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  grossSalary: number;
  netSalary: number;
  tax: number;
  socialContributions: number;
  bonuses: number;
  deductions: number;
  status: 'draft' | 'approved' | 'paid';
}

export interface Absence {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'vacation' | 'sick' | 'unpaid' | 'maternity' | 'other';
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
}

export interface BusinessTrip {
  id: string;
  employeeId: string;
  employeeName: string;
  destination: string;
  purpose: string;
  startDate: string;
  endDate: string;
  estimatedCost: number;
  actualCost?: number;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
}

export interface TravelOrder {
  id: string;
  tripId: string;
  employeeName: string;
  number: string;
  date: string;
  destination: string;
  purpose: string;
  dailyAllowance: number;
  transportCost: number;
  accommodationCost: number;
  totalCost: number;
}

export interface FixedAsset {
  id: string;
  code: string;
  name: string;
  category: string;
  purchaseDate: string;
  purchaseValue: number;
  currentValue: number;
  location: string;
  responsiblePerson: string;
  status: 'active' | 'disposed' | 'written-off';
}

export interface DepreciationEntry {
  id: string;
  assetId: string;
  assetName: string;
  year: number;
  month: number;
  amount: number;
  accumulatedDepreciation: number;
  bookValue: number;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  applicableArticles: string[];
  isActive: boolean;
}

export interface Feedback {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  rating: number;
  category: string;
  comment: string;
  status: 'new' | 'reviewed' | 'resolved';
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  status: 'pending' | 'completed' | 'overdue';
  relatedTo?: string;
}

export interface StockMovement {
  id: string;
  date: string;
  type: 'in' | 'out' | 'transfer';
  articleId: string;
  articleName: string;
  quantity: number;
  fromWarehouse?: string;
  toWarehouse?: string;
  documentNumber: string;
  reason: string;
}

export interface InventoryList {
  id: string;
  name: string;
  date: string;
  warehouseId: string;
  warehouseName: string;
  status: 'draft' | 'in-progress' | 'completed';
  itemsCount: number;
  discrepancies: number;
}

export interface ReceivedInvoice {
  id: string;
  number: string;
  supplierName: string;
  supplierId: string;
  date: string;
  dueDate: string;
  subtotal: number;
  vat: number;
  total: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  sefStatus?: 'received' | 'accepted' | 'rejected';
}

export interface RecurringInvoice {
  id: string;
  clientId: string;
  clientName: string;
  articleDescription: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextDate: string;
  lastGenerated?: string;
  isActive: boolean;
}

export interface TaxRecord {
  id: string;
  type: 'vat' | 'income_tax' | 'payroll_tax' | 'property_tax';
  period: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  documentNumber: string;
  documentType: 'invoice' | 'receipt' | 'payment';
  partnerName: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

// Demo klijenti
export const demoClients: Client[] = [
  {
    id: '1',
    name: 'Tech Solutions d.o.o.',
    pib: '123456789',
    maticniBroj: '12345678',
    address: 'Bulevar Kralja Aleksandra 73',
    city: 'Beograd',
    email: 'info@techsolutions.rs',
    phone: '+381 11 123 4567',
    contactPerson: 'Marko Marković',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Digital Media Group',
    pib: '987654321',
    maticniBroj: '87654321',
    address: 'Cara Dušana 42',
    city: 'Novi Sad',
    email: 'contact@dmg.rs',
    phone: '+381 21 456 7890',
    contactPerson: 'Ana Anić',
    createdAt: '2024-02-20'
  },
  {
    id: '3',
    name: 'Green Energy d.o.o.',
    pib: '456789123',
    maticniBroj: '45678912',
    address: 'Kneza Miloša 15',
    city: 'Niš',
    email: 'office@greenenergy.rs',
    phone: '+381 18 789 0123',
    contactPerson: 'Petar Petrović',
    createdAt: '2024-03-10'
  },
  {
    id: '4',
    name: 'Auto Plus',
    pib: '321654987',
    maticniBroj: '32165498',
    address: 'Vojvode Stepe 88',
    city: 'Beograd',
    email: 'sales@autoplus.rs',
    phone: '+381 11 234 5678',
    contactPerson: 'Jovan Jovanović',
    createdAt: '2024-04-05'
  },
  {
    id: '5',
    name: 'Food Market d.o.o.',
    pib: '654987321',
    maticniBroj: '65498732',
    address: 'Kralja Petra I 22',
    city: 'Kragujevac',
    email: 'info@foodmarket.rs',
    phone: '+381 34 567 8901',
    contactPerson: 'Milica Milić',
    createdAt: '2024-05-12'
  }
];

// Demo fakture
export const demoInvoices: Invoice[] = [
  {
    id: '1',
    number: 'FAK-2024-001',
    clientId: '1',
    clientName: 'Tech Solutions d.o.o.',
    date: '2024-01-20',
    dueDate: '2024-02-20',
    items: [
      { id: '1', name: 'Konsultantske usluge', quantity: 40, unit: 'sat', price: 50, vatRate: 20, total: 2000 },
      { id: '2', name: 'Razvoj softvera', quantity: 80, unit: 'sat', price: 75, vatRate: 20, total: 6000 }
    ],
    subtotal: 8000,
    vat: 1600,
    total: 9600,
    status: 'paid',
    type: 'invoice'
  },
  {
    id: '2',
    number: 'FAK-2024-002',
    clientId: '2',
    clientName: 'Digital Media Group',
    date: '2024-02-15',
    dueDate: '2024-03-15',
    items: [
      { id: '1', name: 'Web dizajn', quantity: 1, unit: 'kom', price: 2500, vatRate: 20, total: 2500 },
      { id: '2', name: 'SEO optimizacija', quantity: 1, unit: 'mesec', price: 800, vatRate: 20, total: 800 }
    ],
    subtotal: 3300,
    vat: 660,
    total: 3960,
    status: 'sent',
    type: 'invoice'
  },
  {
    id: '3',
    number: 'FAK-2024-003',
    clientId: '3',
    clientName: 'Green Energy d.o.o.',
    date: '2024-03-01',
    dueDate: '2024-03-31',
    items: [
      { id: '1', name: 'Solarni paneli', quantity: 10, unit: 'kom', price: 500, vatRate: 20, total: 5000 },
      { id: '2', name: 'Instalacija', quantity: 1, unit: 'usluga', price: 1500, vatRate: 20, total: 1500 }
    ],
    subtotal: 6500,
    vat: 1300,
    total: 7800,
    status: 'overdue',
    type: 'invoice'
  },
  {
    id: '4',
    number: 'PRE-2024-001',
    clientId: '4',
    clientName: 'Auto Plus',
    date: '2024-03-10',
    dueDate: '2024-04-10',
    items: [
      { id: '1', name: 'Auto delovi', quantity: 5, unit: 'kom', price: 200, vatRate: 20, total: 1000 }
    ],
    subtotal: 1000,
    vat: 200,
    total: 1200,
    status: 'draft',
    type: 'proforma'
  },
  {
    id: '5',
    number: 'FAK-2024-004',
    clientId: '5',
    clientName: 'Food Market d.o.o.',
    date: '2024-03-15',
    dueDate: '2024-04-15',
    items: [
      { id: '1', name: 'Prehrambeni proizvodi', quantity: 100, unit: 'kg', price: 5, vatRate: 10, total: 500 }
    ],
    subtotal: 500,
    vat: 50,
    total: 550,
    status: 'paid',
    type: 'invoice'
  }
];

// Demo zaposleni
export const demoEmployees: Employee[] = [
  {
    id: '1',
    firstName: 'Marko',
    lastName: 'Marković',
    jmbg: '0101990710001',
    position: 'Direktor',
    department: 'Uprava',
    email: 'marko@company.rs',
    phone: '+381 60 123 4567',
    salary: 250000,
    startDate: '2020-01-01',
    status: 'active'
  },
  {
    id: '2',
    firstName: 'Ana',
    lastName: 'Anić',
    jmbg: '1507992785012',
    position: 'Finansijski menadžer',
    department: 'Finansije',
    email: 'ana@company.rs',
    phone: '+381 60 234 5678',
    salary: 180000,
    startDate: '2021-03-15',
    status: 'active'
  },
  {
    id: '3',
    firstName: 'Petar',
    lastName: 'Petrović',
    jmbg: '2203988710023',
    position: 'Programer',
    department: 'IT',
    email: 'petar@company.rs',
    phone: '+381 60 345 6789',
    salary: 150000,
    startDate: '2022-06-01',
    status: 'active'
  },
  {
    id: '4',
    firstName: 'Milica',
    lastName: 'Milić',
    jmbg: '0812995785034',
    position: 'HR menadžer',
    department: 'Ljudski resursi',
    email: 'milica@company.rs',
    phone: '+381 60 456 7890',
    salary: 140000,
    startDate: '2021-09-01',
    status: 'active'
  },
  {
    id: '5',
    firstName: 'Jovan',
    lastName: 'Jovanović',
    jmbg: '1104987710045',
    position: 'Prodavac',
    department: 'Prodaja',
    email: 'jovan@company.rs',
    phone: '+381 60 567 8901',
    salary: 100000,
    startDate: '2023-01-15',
    status: 'on-leave'
  }
];

// Demo artikli
export const demoArticles: Article[] = [
  {
    id: '1',
    code: 'ART-001',
    name: 'Laptop HP ProBook',
    description: 'Profesionalni laptop za poslovne korisnike',
    category: 'Elektronika',
    unit: 'kom',
    price: 85000,
    vatRate: 20,
    stock: 15,
    minStock: 5
  },
  {
    id: '2',
    code: 'ART-002',
    name: 'Monitor Dell 27"',
    description: '27 inča IPS monitor',
    category: 'Elektronika',
    unit: 'kom',
    price: 35000,
    vatRate: 20,
    stock: 25,
    minStock: 10
  },
  {
    id: '3',
    code: 'ART-003',
    name: 'Tastatura Logitech',
    description: 'Bežična tastatura',
    category: 'Periferije',
    unit: 'kom',
    price: 5500,
    vatRate: 20,
    stock: 50,
    minStock: 20
  },
  {
    id: '4',
    code: 'ART-004',
    name: 'Kancelarijska stolica',
    description: 'Ergonomska stolica za kancelariju',
    category: 'Nameštaj',
    unit: 'kom',
    price: 18000,
    vatRate: 20,
    stock: 8,
    minStock: 5
  },
  {
    id: '5',
    code: 'ART-005',
    name: 'Papir A4',
    description: 'Kancelarijski papir 500 listova',
    category: 'Kancelarijski materijal',
    unit: 'ris',
    price: 800,
    vatRate: 20,
    stock: 200,
    minStock: 50
  },
  {
    id: '6',
    code: 'ART-006',
    name: 'Toneri za štampač',
    description: 'Originalni toneri za HP štampače',
    category: 'Kancelarijski materijal',
    unit: 'kom',
    price: 12000,
    vatRate: 20,
    stock: 3,
    minStock: 10
  }
];

// Demo magacini
export const demoWarehouses: Warehouse[] = [
  {
    id: '1',
    name: 'Glavni magacin',
    address: 'Industrijska zona BB, Beograd',
    capacity: 1000,
    usedCapacity: 650
  },
  {
    id: '2',
    name: 'Magacin Novi Sad',
    address: 'Bulevar Oslobođenja 15, Novi Sad',
    capacity: 500,
    usedCapacity: 320
  },
  {
    id: '3',
    name: 'Maloprodajni magacin',
    address: 'Knez Mihailova 10, Beograd',
    capacity: 200,
    usedCapacity: 180
  }
];

// Demo transakcije
export const demoTransactions: Transaction[] = [
  { id: '1', date: '2024-01-15', type: 'income', category: 'Prodaja', description: 'Uplata fakture FAK-2024-001', amount: 9600, status: 'completed' },
  { id: '2', date: '2024-01-20', type: 'expense', category: 'Nabavka', description: 'Kupovina opreme', amount: 25000, status: 'completed' },
  { id: '3', date: '2024-02-01', type: 'expense', category: 'Plate', description: 'Isplata plata za januar', amount: 820000, status: 'completed' },
  { id: '4', date: '2024-02-10', type: 'income', category: 'Prodaja', description: 'Uplata fakture FAK-2024-005', amount: 550, status: 'completed' },
  { id: '5', date: '2024-02-15', type: 'expense', category: 'Režije', description: 'Struja i grejanje', amount: 45000, status: 'completed' },
  { id: '6', date: '2024-03-01', type: 'expense', category: 'Plate', description: 'Isplata plata za februar', amount: 820000, status: 'completed' },
  { id: '7', date: '2024-03-05', type: 'income', category: 'Usluge', description: 'Konsultantske usluge', amount: 15000, status: 'pending' },
  { id: '8', date: '2024-03-10', type: 'expense', category: 'Marketing', description: 'Reklamna kampanja', amount: 35000, status: 'completed' }
];

// Demo nalozi za plaćanje
export const demoPaymentOrders: PaymentOrder[] = [
  { id: '1', number: 'NP-2024-001', date: '2024-03-01', recipientName: 'Dobavljač A d.o.o.', recipientAccount: '160-123456-78', amount: 150000, purpose: 'Plaćanje fakture br. 123', status: 'executed', paymentCode: '221', referenceNumber: '97-123-456' },
  { id: '2', number: 'NP-2024-002', date: '2024-03-05', recipientName: 'EPS Snabdevanje', recipientAccount: '160-987654-32', amount: 45000, purpose: 'Struja za februar', status: 'executed', paymentCode: '221', referenceNumber: '97-789-012' },
  { id: '3', number: 'NP-2024-003', date: '2024-03-10', recipientName: 'Telefonija d.o.o.', recipientAccount: '265-111222-33', amount: 15000, purpose: 'Telefonski račun', status: 'approved', paymentCode: '221', referenceNumber: '97-345-678' },
  { id: '4', number: 'NP-2024-004', date: '2024-03-15', recipientName: 'Transport Express', recipientAccount: '340-555666-77', amount: 85000, purpose: 'Usluge transporta', status: 'pending', paymentCode: '221', referenceNumber: '97-901-234' },
];

// Demo izvodi banke
export const demoBankStatements: BankStatement[] = [
  { id: '1', date: '2024-03-01', bankName: 'Banka Intesa', accountNumber: '160-123456-78', openingBalance: 1250000, closingBalance: 1380000, transactionsCount: 15, totalIncome: 250000, totalExpense: 120000 },
  { id: '2', date: '2024-02-01', bankName: 'Banka Intesa', accountNumber: '160-123456-78', openingBalance: 1150000, closingBalance: 1250000, transactionsCount: 22, totalIncome: 320000, totalExpense: 220000 },
  { id: '3', date: '2024-01-01', bankName: 'Banka Intesa', accountNumber: '160-123456-78', openingBalance: 980000, closingBalance: 1150000, transactionsCount: 18, totalIncome: 280000, totalExpense: 110000 },
];

// Demo ugovori
export const demoContracts: Contract[] = [
  { id: '1', number: 'UGV-2024-001', title: 'Ugovor o održavanju softvera', clientId: '1', clientName: 'Tech Solutions d.o.o.', type: 'service', startDate: '2024-01-01', endDate: '2024-12-31', value: 120000, status: 'active' },
  { id: '2', number: 'UGV-2024-002', title: 'Ugovor o nabavci opreme', clientId: '2', clientName: 'Digital Media Group', type: 'sales', startDate: '2024-02-01', endDate: '2024-06-30', value: 450000, status: 'active' },
  { id: '3', number: 'UGV-2024-003', title: 'Zakup poslovnog prostora', clientId: '3', clientName: 'Green Energy d.o.o.', type: 'rental', startDate: '2024-01-01', endDate: '2025-12-31', value: 960000, status: 'active' },
  { id: '4', number: 'UGV-2023-015', title: 'Ugovor o konsultantskim uslugama', clientId: '4', clientName: 'Auto Plus', type: 'service', startDate: '2023-06-01', endDate: '2023-12-31', value: 85000, status: 'completed' },
];

// Demo CRM beleške
export const demoCrmNotes: CrmNote[] = [
  { id: '1', clientId: '1', clientName: 'Tech Solutions d.o.o.', date: '2024-03-15', type: 'call', subject: 'Produženje ugovora', content: 'Razgovarano o produženju ugovora za narednu godinu. Klijent zainteresovan.', author: 'Marko Marković' },
  { id: '2', clientId: '2', clientName: 'Digital Media Group', date: '2024-03-14', type: 'email', subject: 'Nova ponuda', content: 'Poslata ponuda za dodatne usluge web dizajna.', author: 'Ana Anić' },
  { id: '3', clientId: '1', clientName: 'Tech Solutions d.o.o.', date: '2024-03-10', type: 'meeting', subject: 'Kvartalni pregled', content: 'Održan sastanak za kvartalni pregled saradnje. Sve po planu.', author: 'Marko Marković' },
  { id: '4', clientId: '3', clientName: 'Green Energy d.o.o.', date: '2024-03-08', type: 'note', subject: 'Kašnjenje plaćanja', content: 'Kontaktirati klijenta u vezi kašnjenja plaćanja fakture.', author: 'Ana Anić' },
];

// Demo poslovnice
export const demoBranches: Branch[] = [
  { id: '1', name: 'Centrala Beograd', address: 'Knez Mihailova 10', city: 'Beograd', manager: 'Marko Marković', phone: '+381 11 123 4567', isActive: true },
  { id: '2', name: 'Poslovnica Novi Sad', address: 'Bulevar Oslobođenja 50', city: 'Novi Sad', manager: 'Petar Petrović', phone: '+381 21 456 7890', isActive: true },
  { id: '3', name: 'Poslovnica Niš', address: 'Cara Dušana 15', city: 'Niš', manager: 'Jovan Jovanović', phone: '+381 18 789 0123', isActive: true },
];

// Demo fiskalne blagajne
export const demoFiscalRegisters: FiscalRegister[] = [
  { id: '1', branchId: '1', branchName: 'Centrala Beograd', serialNumber: 'FR-2024-001', model: 'GALEB GP-550', lastServiceDate: '2024-01-15', status: 'active' },
  { id: '2', branchId: '1', branchName: 'Centrala Beograd', serialNumber: 'FR-2024-002', model: 'GALEB GP-550', lastServiceDate: '2024-01-15', status: 'active' },
  { id: '3', branchId: '2', branchName: 'Poslovnica Novi Sad', serialNumber: 'FR-2024-003', model: 'INT RASTER', lastServiceDate: '2024-02-20', status: 'active' },
  { id: '4', branchId: '3', branchName: 'Poslovnica Niš', serialNumber: 'FR-2024-004', model: 'GALEB GP-100', lastServiceDate: '2023-12-01', status: 'service' },
];

// Demo POS terminali
export const demoPosTerminals: PosTerminal[] = [
  { id: '1', branchId: '1', branchName: 'Centrala Beograd', terminalId: 'TID-001', provider: 'Banka Intesa', status: 'active' },
  { id: '2', branchId: '1', branchName: 'Centrala Beograd', terminalId: 'TID-002', provider: 'Banka Intesa', status: 'active' },
  { id: '3', branchId: '2', branchName: 'Poslovnica Novi Sad', terminalId: 'TID-003', provider: 'Erste Bank', status: 'active' },
  { id: '4', branchId: '3', branchName: 'Poslovnica Niš', terminalId: 'TID-004', provider: 'Komercijalna Banka', status: 'inactive' },
];

// Demo dobavljači
export const demoSuppliers: Supplier[] = [
  { id: '1', name: 'IT Distribucija d.o.o.', pib: '111222333', maticniBroj: '11122233', address: 'Bulevar Mihajla Pupina 10', city: 'Beograd', email: 'prodaja@itdist.rs', phone: '+381 11 333 4444', contactPerson: 'Milan Milanović', paymentTerms: 30, rating: 5 },
  { id: '2', name: 'Office Supplies d.o.o.', pib: '444555666', maticniBroj: '44455566', address: 'Cara Lazara 22', city: 'Novi Sad', email: 'nabavka@officesup.rs', phone: '+381 21 555 6666', contactPerson: 'Jovana Jovanović', paymentTerms: 15, rating: 4 },
  { id: '3', name: 'Tech Import d.o.o.', pib: '777888999', maticniBroj: '77788899', address: 'Vojvode Stepe 100', city: 'Beograd', email: 'import@techimport.rs', phone: '+381 11 777 8888', contactPerson: 'Stefan Stefanović', paymentTerms: 45, rating: 4 },
];

// Demo primljene narudžbe
export const demoReceivedOrders: Order[] = [
  { id: '1', number: 'NAR-2024-001', date: '2024-03-10', clientId: '1', clientName: 'Tech Solutions d.o.o.', items: [{ id: '1', articleId: '1', articleName: 'Laptop HP ProBook', quantity: 5, unit: 'kom', price: 85000, total: 425000 }], total: 425000, status: 'confirmed', type: 'received' },
  { id: '2', number: 'NAR-2024-002', date: '2024-03-12', clientId: '2', clientName: 'Digital Media Group', items: [{ id: '1', articleId: '2', articleName: 'Monitor Dell 27"', quantity: 10, unit: 'kom', price: 35000, total: 350000 }], total: 350000, status: 'pending', type: 'received' },
  { id: '3', number: 'NAR-2024-003', date: '2024-03-15', clientId: '3', clientName: 'Green Energy d.o.o.', items: [{ id: '1', articleId: '3', articleName: 'Tastatura Logitech', quantity: 20, unit: 'kom', price: 5500, total: 110000 }], total: 110000, status: 'shipped', type: 'received' },
];

// Demo izdate narudžbe
export const demoIssuedOrders: Order[] = [
  { id: '4', number: 'NAB-2024-001', date: '2024-03-08', supplierId: '1', supplierName: 'IT Distribucija d.o.o.', items: [{ id: '1', articleId: '1', articleName: 'Laptop HP ProBook', quantity: 10, unit: 'kom', price: 75000, total: 750000 }], total: 750000, status: 'delivered', type: 'issued' },
  { id: '5', number: 'NAB-2024-002', date: '2024-03-11', supplierId: '2', supplierName: 'Office Supplies d.o.o.', items: [{ id: '1', articleId: '5', articleName: 'Papir A4', quantity: 100, unit: 'ris', price: 700, total: 70000 }], total: 70000, status: 'confirmed', type: 'issued' },
];

// Demo cenovnici
export const demoPriceLists: PriceList[] = [
  { id: '1', name: 'Maloprodajni cenovnik 2024', validFrom: '2024-01-01', validTo: '2024-12-31', currency: 'RSD', isActive: true, itemsCount: 150 },
  { id: '2', name: 'Veleprodajni cenovnik 2024', validFrom: '2024-01-01', validTo: '2024-12-31', currency: 'RSD', isActive: true, itemsCount: 150 },
  { id: '3', name: 'Akcijski cenovnik Q1', validFrom: '2024-01-01', validTo: '2024-03-31', currency: 'RSD', isActive: false, itemsCount: 45 },
];

// Demo kategorije
export const demoCategories: Category[] = [
  { id: '1', name: 'Elektronika', description: 'Elektronski uređaji i oprema', articlesCount: 25 },
  { id: '2', name: 'Periferije', parentId: '1', description: 'Računarska periferija', articlesCount: 15 },
  { id: '3', name: 'Nameštaj', description: 'Kancelarijski nameštaj', articlesCount: 12 },
  { id: '4', name: 'Kancelarijski materijal', description: 'Potrošni materijal za kancelariju', articlesCount: 45 },
];

// Demo serijski brojevi
export const demoSerialNumbers: SerialNumber[] = [
  { id: '1', articleId: '1', articleName: 'Laptop HP ProBook', serialNumber: 'SN-HP-001234', warehouseId: '1', warehouseName: 'Glavni magacin', status: 'in-stock' },
  { id: '2', articleId: '1', articleName: 'Laptop HP ProBook', serialNumber: 'SN-HP-001235', warehouseId: '1', warehouseName: 'Glavni magacin', status: 'sold' },
  { id: '3', articleId: '2', articleName: 'Monitor Dell 27"', serialNumber: 'SN-DELL-005678', warehouseId: '1', warehouseName: 'Glavni magacin', status: 'in-stock' },
  { id: '4', articleId: '2', articleName: 'Monitor Dell 27"', serialNumber: 'SN-DELL-005679', lotNumber: 'LOT-2024-Q1', warehouseId: '2', warehouseName: 'Magacin Novi Sad', status: 'reserved' },
];

// Demo evidencija radnog vremena
export const demoTimeEntries: TimeEntry[] = [
  { id: '1', employeeId: '1', employeeName: 'Marko Marković', date: '2024-03-15', startTime: '08:00', endTime: '16:00', hoursWorked: 8, description: 'Redovno radno vreme' },
  { id: '2', employeeId: '2', employeeName: 'Ana Anić', date: '2024-03-15', startTime: '09:00', endTime: '17:00', hoursWorked: 8, description: 'Redovno radno vreme' },
  { id: '3', employeeId: '3', employeeName: 'Petar Petrović', date: '2024-03-15', startTime: '08:00', endTime: '18:00', hoursWorked: 10, projectId: '1', projectName: 'Projekat ERP', description: 'Razvoj novog modula' },
  { id: '4', employeeId: '4', employeeName: 'Milica Milić', date: '2024-03-15', startTime: '08:30', endTime: '16:30', hoursWorked: 8, description: 'Intervjui kandidata' },
];

// Demo obračun zarada
export const demoPayrollEntries: PayrollEntry[] = [
  { id: '1', employeeId: '1', employeeName: 'Marko Marković', month: '2024-03', grossSalary: 250000, netSalary: 175000, tax: 25000, socialContributions: 50000, bonuses: 0, deductions: 0, status: 'paid' },
  { id: '2', employeeId: '2', employeeName: 'Ana Anić', month: '2024-03', grossSalary: 180000, netSalary: 126000, tax: 18000, socialContributions: 36000, bonuses: 0, deductions: 0, status: 'paid' },
  { id: '3', employeeId: '3', employeeName: 'Petar Petrović', month: '2024-03', grossSalary: 150000, netSalary: 105000, tax: 15000, socialContributions: 30000, bonuses: 10000, deductions: 0, status: 'approved' },
  { id: '4', employeeId: '4', employeeName: 'Milica Milić', month: '2024-03', grossSalary: 140000, netSalary: 98000, tax: 14000, socialContributions: 28000, bonuses: 0, deductions: 0, status: 'approved' },
  { id: '5', employeeId: '5', employeeName: 'Jovan Jovanović', month: '2024-03', grossSalary: 100000, netSalary: 70000, tax: 10000, socialContributions: 20000, bonuses: 0, deductions: 0, status: 'draft' },
];

// Demo odsustva
export const demoAbsences: Absence[] = [
  { id: '1', employeeId: '5', employeeName: 'Jovan Jovanović', type: 'sick', startDate: '2024-03-10', endDate: '2024-03-20', days: 8, status: 'approved', reason: 'Bolovanje - respiratorna infekcija' },
  { id: '2', employeeId: '2', employeeName: 'Ana Anić', type: 'vacation', startDate: '2024-04-01', endDate: '2024-04-10', days: 8, status: 'approved', reason: 'Godišnji odmor' },
  { id: '3', employeeId: '3', employeeName: 'Petar Petrović', type: 'vacation', startDate: '2024-05-15', endDate: '2024-05-25', days: 9, status: 'pending', reason: 'Godišnji odmor - planiran put' },
];

// Demo službena putovanja
export const demoBusinessTrips: BusinessTrip[] = [
  { id: '1', employeeId: '1', employeeName: 'Marko Marković', destination: 'Beč, Austrija', purpose: 'IT konferencija', startDate: '2024-04-15', endDate: '2024-04-18', estimatedCost: 150000, status: 'planned' },
  { id: '2', employeeId: '2', employeeName: 'Ana Anić', destination: 'Novi Sad', purpose: 'Revizija poslovnice', startDate: '2024-03-20', endDate: '2024-03-21', estimatedCost: 15000, actualCost: 14500, status: 'completed' },
  { id: '3', employeeId: '3', employeeName: 'Petar Petrović', destination: 'Ljubljana, Slovenija', purpose: 'Obuka kod partnera', startDate: '2024-03-25', endDate: '2024-03-28', estimatedCost: 80000, status: 'in-progress' },
];

// Demo putni nalozi
export const demoTravelOrders: TravelOrder[] = [
  { id: '1', tripId: '2', employeeName: 'Ana Anić', number: 'PN-2024-001', date: '2024-03-19', destination: 'Novi Sad', purpose: 'Revizija poslovnice', dailyAllowance: 3000, transportCost: 5000, accommodationCost: 6500, totalCost: 14500 },
  { id: '2', tripId: '1', employeeName: 'Marko Marković', number: 'PN-2024-002', date: '2024-04-10', destination: 'Beč, Austrija', purpose: 'IT konferencija', dailyAllowance: 15000, transportCost: 45000, accommodationCost: 90000, totalCost: 150000 },
];

// Demo osnovna sredstva
export const demoFixedAssets: FixedAsset[] = [
  { id: '1', code: 'OS-001', name: 'Server Dell PowerEdge', category: 'IT oprema', purchaseDate: '2022-01-15', purchaseValue: 850000, currentValue: 650000, location: 'Server soba', responsiblePerson: 'Petar Petrović', status: 'active' },
  { id: '2', code: 'OS-002', name: 'Službeni automobil VW Passat', category: 'Vozila', purchaseDate: '2021-06-01', purchaseValue: 2500000, currentValue: 1800000, location: 'Garaža', responsiblePerson: 'Marko Marković', status: 'active' },
  { id: '3', code: 'OS-003', name: 'Klimatizacija centralna', category: 'Oprema', purchaseDate: '2020-03-15', purchaseValue: 450000, currentValue: 280000, location: 'Kancelarija', responsiblePerson: 'Jovan Jovanović', status: 'active' },
  { id: '4', code: 'OS-004', name: 'Stari server HP', category: 'IT oprema', purchaseDate: '2018-01-01', purchaseValue: 500000, currentValue: 0, location: 'Arhiva', responsiblePerson: 'Petar Petrović', status: 'written-off' },
];

// Demo amortizacija
export const demoDepreciationEntries: DepreciationEntry[] = [
  { id: '1', assetId: '1', assetName: 'Server Dell PowerEdge', year: 2024, month: 1, amount: 14167, accumulatedDepreciation: 198333, bookValue: 651667 },
  { id: '2', assetId: '1', assetName: 'Server Dell PowerEdge', year: 2024, month: 2, amount: 14167, accumulatedDepreciation: 212500, bookValue: 637500 },
  { id: '3', assetId: '2', assetName: 'Službeni automobil VW Passat', year: 2024, month: 1, amount: 41667, accumulatedDepreciation: 583333, bookValue: 1916667 },
  { id: '4', assetId: '2', assetName: 'Službeni automobil VW Passat', year: 2024, month: 2, amount: 41667, accumulatedDepreciation: 625000, bookValue: 1875000 },
];

// Demo promocije
export const demoPromotions: Promotion[] = [
  { id: '1', name: 'Prolećna akcija', description: '20% popusta na svu elektroniku', discountType: 'percentage', discountValue: 20, startDate: '2024-03-01', endDate: '2024-03-31', applicableArticles: ['1', '2', '3'], isActive: true },
  { id: '2', name: 'Vikend popust', description: 'Fiksni popust od 5000 RSD', discountType: 'fixed', discountValue: 5000, startDate: '2024-03-15', endDate: '2024-03-17', applicableArticles: ['4', '5'], isActive: false },
  { id: '3', name: 'Letnja rasprodaja', description: '30% na nameštaj', discountType: 'percentage', discountValue: 30, startDate: '2024-06-01', endDate: '2024-08-31', applicableArticles: ['4'], isActive: false },
];

// Demo povratne informacije
export const demoFeedbacks: Feedback[] = [
  { id: '1', clientId: '1', clientName: 'Tech Solutions d.o.o.', date: '2024-03-10', rating: 5, category: 'Usluga', comment: 'Odlična usluga i brza isporuka!', status: 'reviewed' },
  { id: '2', clientId: '2', clientName: 'Digital Media Group', date: '2024-03-12', rating: 4, category: 'Proizvod', comment: 'Kvalitetni proizvodi, ali malo skupo.', status: 'new' },
  { id: '3', clientId: '3', clientName: 'Green Energy d.o.o.', date: '2024-03-08', rating: 3, category: 'Podrška', comment: 'Dugo čekanje na odgovor tehničke podrške.', status: 'resolved' },
];

// Demo podsetnici
export const demoReminders: Reminder[] = [
  { id: '1', title: 'Poziv klijentu', description: 'Pozvati Tech Solutions u vezi produženja ugovora', dueDate: '2024-03-20', dueTime: '10:00', priority: 'high', assignedTo: 'Marko Marković', status: 'pending' },
  { id: '2', title: 'Izveštaj za upravu', description: 'Pripremiti mesečni finansijski izveštaj', dueDate: '2024-03-25', dueTime: '14:00', priority: 'high', assignedTo: 'Ana Anić', status: 'pending' },
  { id: '3', title: 'Servis vozila', description: 'Zakazati redovni servis službeног vozila', dueDate: '2024-04-01', dueTime: '09:00', priority: 'medium', assignedTo: 'Jovan Jovanović', status: 'pending' },
  { id: '4', title: 'Obnoviti licencu', description: 'Obnoviti softversku licencu za ERP', dueDate: '2024-03-15', dueTime: '12:00', priority: 'high', assignedTo: 'Petar Petrović', status: 'overdue' },
];

// Demo kretanje zaliha
export const demoStockMovements: StockMovement[] = [
  { id: '1', date: '2024-03-15', type: 'in', articleId: '1', articleName: 'Laptop HP ProBook', quantity: 10, toWarehouse: 'Glavni magacin', documentNumber: 'PRI-2024-001', reason: 'Nabavka od dobavljača' },
  { id: '2', date: '2024-03-14', type: 'out', articleId: '2', articleName: 'Monitor Dell 27"', quantity: 5, fromWarehouse: 'Glavni magacin', documentNumber: 'OTP-2024-001', reason: 'Prodaja kupcu' },
  { id: '3', date: '2024-03-13', type: 'transfer', articleId: '3', articleName: 'Tastatura Logitech', quantity: 20, fromWarehouse: 'Glavni magacin', toWarehouse: 'Maloprodajni magacin', documentNumber: 'PRE-2024-001', reason: 'Dopuna maloprodaje' },
  { id: '4', date: '2024-03-12', type: 'in', articleId: '5', articleName: 'Papir A4', quantity: 50, toWarehouse: 'Maloprodajni magacin', documentNumber: 'PRI-2024-002', reason: 'Nabavka' },
];

// Demo inventurne liste
export const demoInventoryLists: InventoryList[] = [
  { id: '1', name: 'Godišnja inventura 2024', date: '2024-01-15', warehouseId: '1', warehouseName: 'Glavni magacin', status: 'completed', itemsCount: 150, discrepancies: 3 },
  { id: '2', name: 'Kvartalna inventura Q1', date: '2024-03-31', warehouseId: '2', warehouseName: 'Magacin Novi Sad', status: 'in-progress', itemsCount: 85, discrepancies: 0 },
  { id: '3', name: 'Inventura maloprodaje', date: '2024-03-15', warehouseId: '3', warehouseName: 'Maloprodajni magacin', status: 'draft', itemsCount: 45, discrepancies: 0 },
];

// Demo primljeni računi
export const demoReceivedInvoices: ReceivedInvoice[] = [
  { id: '1', number: 'PR-2024-001', supplierName: 'IT Distribucija d.o.o.', supplierId: '1', date: '2024-03-10', dueDate: '2024-04-10', subtotal: 750000, vat: 150000, total: 900000, status: 'approved', sefStatus: 'accepted' },
  { id: '2', number: 'PR-2024-002', supplierName: 'Office Supplies d.o.o.', supplierId: '2', date: '2024-03-12', dueDate: '2024-03-27', subtotal: 70000, vat: 14000, total: 84000, status: 'paid', sefStatus: 'accepted' },
  { id: '3', number: 'PR-2024-003', supplierName: 'Tech Import d.o.o.', supplierId: '3', date: '2024-03-15', dueDate: '2024-04-30', subtotal: 250000, vat: 50000, total: 300000, status: 'pending', sefStatus: 'received' },
];

// Demo automatske fakture
export const demoRecurringInvoices: RecurringInvoice[] = [
  { id: '1', clientId: '1', clientName: 'Tech Solutions d.o.o.', articleDescription: 'Mesečno održavanje softvera', amount: 50000, frequency: 'monthly', nextDate: '2024-04-01', lastGenerated: '2024-03-01', isActive: true },
  { id: '2', clientId: '2', clientName: 'Digital Media Group', articleDescription: 'SEO usluge', amount: 30000, frequency: 'monthly', nextDate: '2024-04-15', lastGenerated: '2024-03-15', isActive: true },
  { id: '3', clientId: '3', clientName: 'Green Energy d.o.o.', articleDescription: 'Zakup prostora', amount: 80000, frequency: 'monthly', nextDate: '2024-04-01', lastGenerated: '2024-03-01', isActive: true },
];

// Demo porezi
export const demoTaxRecords: TaxRecord[] = [
  { id: '1', type: 'vat', period: '2024-02', dueDate: '2024-03-15', amount: 125000, status: 'paid', paidDate: '2024-03-10' },
  { id: '2', type: 'payroll_tax', period: '2024-02', dueDate: '2024-03-15', amount: 82000, status: 'paid', paidDate: '2024-03-14' },
  { id: '3', type: 'vat', period: '2024-03', dueDate: '2024-04-15', amount: 145000, status: 'pending' },
  { id: '4', type: 'income_tax', period: '2024-Q1', dueDate: '2024-04-30', amount: 350000, status: 'pending' },
];

// Demo knjiga faktura
export const demoLedgerEntries: LedgerEntry[] = [
  { id: '1', date: '2024-03-01', documentNumber: 'FAK-2024-001', documentType: 'invoice', partnerName: 'Tech Solutions d.o.o.', description: 'Faktura za konsultantske usluge', debit: 9600, credit: 0, balance: 9600 },
  { id: '2', date: '2024-03-05', documentNumber: 'UPL-2024-001', documentType: 'receipt', partnerName: 'Tech Solutions d.o.o.', description: 'Uplata fakture FAK-2024-001', debit: 0, credit: 9600, balance: 0 },
  { id: '3', date: '2024-03-10', documentNumber: 'FAK-2024-002', documentType: 'invoice', partnerName: 'Digital Media Group', description: 'Faktura za web usluge', debit: 3960, credit: 0, balance: 3960 },
  { id: '4', date: '2024-03-12', documentNumber: 'PR-2024-001', documentType: 'payment', partnerName: 'IT Distribucija d.o.o.', description: 'Plaćanje ulazne fakture', debit: 0, credit: 900000, balance: -896040 },
];

// Dashboard statistika
export const dashboardStats = {
  totalRevenue: 2450000,
  totalExpenses: 1780000,
  profit: 670000,
  pendingInvoices: 5,
  overdueInvoices: 2,
  totalClients: 45,
  totalEmployees: 12,
  lowStockItems: 3,
  vatToPay: 125000,
  monthlyData: [
    { month: 'Jan', revenue: 380000, expenses: 290000 },
    { month: 'Feb', revenue: 420000, expenses: 310000 },
    { month: 'Mar', revenue: 390000, expenses: 280000 },
    { month: 'Apr', revenue: 450000, expenses: 320000 },
    { month: 'Maj', revenue: 410000, expenses: 300000 },
    { month: 'Jun', revenue: 400000, expenses: 280000 }
  ]
};

if (!DEMO_MODE) {
  [
    demoClients,
    demoInvoices,
    demoEmployees,
    demoArticles,
    demoWarehouses,
    demoTransactions,
    demoPaymentOrders,
    demoBankStatements,
    demoContracts,
    demoCrmNotes,
    demoBranches,
    demoFiscalRegisters,
    demoPosTerminals,
    demoSuppliers,
    demoReceivedOrders,
    demoIssuedOrders,
    demoPriceLists,
    demoCategories,
    demoSerialNumbers,
    demoTimeEntries,
    demoPayrollEntries,
    demoAbsences,
    demoBusinessTrips,
    demoTravelOrders,
    demoFixedAssets,
    demoDepreciationEntries,
    demoPromotions,
    demoFeedbacks,
    demoReminders,
    demoStockMovements,
    demoInventoryLists,
    demoReceivedInvoices,
    demoRecurringInvoices,
    demoTaxRecords,
    demoLedgerEntries,
  ].forEach((collection) => {
    collection.length = 0;
  });

  Object.assign(dashboardStats, {
    totalRevenue: 0,
    totalExpenses: 0,
    profit: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalClients: 0,
    totalEmployees: 0,
    lowStockItems: 0,
    vatToPay: 0,
    monthlyData: [],
  });
}
