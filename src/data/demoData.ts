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
