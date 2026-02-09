# 📊 Knjigovodstveni ERP Sistem

Kompletan profesionalni program za knjigovodstvo sa svim modulima, Dashboard dizajnom i tamnom/svetlom temom.

## 🚀 Pokretanje projekta

```bash
npm install
npm run dev
```

## 🔧 Konfiguracija

### Demo Mode

U fajlu `src/config/api.ts` možete kontrolisati da li aplikacija koristi demo podatke ili pravi API:

```typescript
// Postavite na false kada je backend spreman
export const DEMO_MODE = true;

// Base URL za API
export const API_BASE_URL = 'https://api.vertex.com/';
```

### Environment varijable (produkcija)

```env
VITE_API_URL=https://api.vertex.com
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🔌 API Dokumentacija

### Base URL
```
https://api.vertex.com/
```

### Autentifikacija
Svi API pozivi zahtevaju JWT token u header-u:
```
Authorization: Bearer <token>
```

---

## 📋 Endpointi sa primerima

### Autentifikacija

#### POST `/auth/login`
Prijava korisnika

**Request:**
```json
{
  "email": "admin@vertex.com",
  "password": "secure_password"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-123",
      "email": "admin@vertex.com",
      "name": "Admin Korisnik",
      "role": "admin",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "msg": "Pogrešan email ili lozinka"
}
```

#### GET `/auth/me`
Trenutni korisnik

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "admin@vertex.com",
      "name": "Admin Korisnik",
      "role": "admin"
    }
  }
}
```

---

### Klijenti (Clients)

#### GET `/clients`
Lista svih klijenata

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Tech Solutions d.o.o.",
      "pib": "123456789",
      "maticniBroj": "12345678",
      "address": "Bulevar Kralja Aleksandra 73",
      "city": "Beograd",
      "email": "info@techsolutions.rs",
      "phone": "+381 11 123 4567",
      "contactPerson": "Marko Marković",
      "createdAt": "2024-01-15"
    }
  ]
}
```

#### POST `/clients`
Kreiranje klijenta

**Request:**
```json
{
  "name": "Nova Firma d.o.o.",
  "pib": "111222333",
  "maticniBroj": "11122233",
  "address": "Ulica 123",
  "city": "Beograd",
  "email": "info@novafirma.rs",
  "phone": "+381 11 000 0000",
  "contactPerson": "Ime Prezime"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new-id-123",
    "name": "Nova Firma d.o.o.",
    "...": "ostali podaci"
  }
}
```

#### PUT `/clients/:id`
Ažuriranje klijenta

#### DELETE `/clients/:id`
Brisanje klijenta

**Response:**
```json
{
  "success": true
}
```

---

### Fakture (Invoices)

#### GET `/invoices`
Lista svih faktura

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "number": "FAK-2024-001",
      "clientId": "1",
      "clientName": "Tech Solutions d.o.o.",
      "date": "2024-01-20",
      "dueDate": "2024-02-20",
      "items": [
        {
          "id": "item-1",
          "name": "Konsultantske usluge",
          "quantity": 10,
          "unit": "sat",
          "price": 5000,
          "vatRate": 20,
          "total": 50000
        }
      ],
      "subtotal": 50000,
      "vat": 10000,
      "total": 60000,
      "status": "sent",
      "type": "invoice"
    }
  ]
}
```

#### POST `/invoices`
Kreiranje fakture

**Request:**
```json
{
  "clientId": "1",
  "date": "2024-03-15",
  "dueDate": "2024-04-15",
  "items": [
    {
      "name": "Usluga programiranja",
      "quantity": 20,
      "unit": "sat",
      "price": 6000,
      "vatRate": 20
    }
  ],
  "type": "invoice"
}
```

#### POST `/invoices/:id/send`
Slanje fakture klijentu

**Response:**
```json
{
  "success": true,
  "message": "Faktura uspešno poslata"
}
```

#### POST `/invoices/:id/mark-paid`
Označavanje fakture kao plaćene

**Request:**
```json
{
  "paidDate": "2024-03-20"
}
```

---

### Nalozi za plaćanje (Payment Orders)

#### GET `/payment-orders`
Lista naloga

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "number": "NP-2024-001",
      "date": "2024-03-01",
      "recipientName": "Dobavljač d.o.o.",
      "recipientAccount": "265-1234567890-12",
      "amount": 150000,
      "purpose": "Plaćanje fakture FAK-123",
      "status": "pending",
      "paymentCode": "221",
      "referenceNumber": "97-12345678"
    }
  ]
}
```

#### POST `/payment-orders`
Kreiranje naloga

#### PUT `/payment-orders/:id/approve`
Odobrenje naloga

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "status": "approved"
  }
}
```

#### PUT `/payment-orders/:id/execute`
Izvršenje naloga

#### PUT `/payment-orders/:id/reject`
Odbijanje naloga

**Request:**
```json
{
  "reason": "Nedovoljno sredstava"
}
```

---

### Zaposleni (Employees)

#### GET `/employees`
Lista zaposlenih

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "firstName": "Marko",
      "lastName": "Marković",
      "jmbg": "0101990710001",
      "position": "Senior Developer",
      "department": "IT",
      "email": "marko@firma.rs",
      "phone": "+381 64 123 4567",
      "salary": 180000,
      "startDate": "2023-01-15",
      "status": "active"
    }
  ]
}
```

---

### Artikli (Articles)

#### GET `/articles`
Lista artikala

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "code": "ART001",
      "name": "Laptop Dell XPS 15",
      "description": "Profesionalni laptop",
      "category": "Računari",
      "unit": "kom",
      "price": 180000,
      "vatRate": 20,
      "stock": 15,
      "minStock": 5
    }
  ]
}
```

#### PUT `/articles/:id/stock`
Ažuriranje zaliha

**Request:**
```json
{
  "quantity": 10,
  "type": "add"
}
```

---

### Ugovori (Contracts)

#### GET `/contracts`
Lista ugovora

#### PUT `/contracts/:id/terminate`
Raskid ugovora

**Request:**
```json
{
  "reason": "Istekao ugovorni period"
}
```

---

### Porezi (Taxes)

#### GET `/taxes`
Lista poreskih obaveza

#### POST `/taxes/:id/pay`
Plaćanje poreza

**Request:**
```json
{
  "paidDate": "2024-03-15"
}
```

#### GET `/taxes/vat-report?period=2024-03`
PDV izveštaj za period

#### POST `/taxes/pppdv/generate`
Generisanje PPPDV obrasca

**Request:**
```json
{
  "period": "2024-03"
}
```

---

### Izvodi banke (Bank Statements)

#### GET `/bank-statements`
Lista izvoda

#### POST `/bank-statements/import`
Uvoz izvoda (multipart/form-data)

**Request:**
```
Content-Type: multipart/form-data
file: [XML/CSV fajl izvoda]
```

#### GET `/bank-statements/:id/transactions`
Transakcije izvoda

---

### Izveštaji (Reports)

#### GET `/reports/financial?from=2024-01-01&to=2024-03-31`
Finansijski izveštaj

**Response:**
```json
{
  "success": true,
  "data": {
    "totalIncome": 5000000,
    "totalExpense": 3500000,
    "profit": 1500000,
    "vatCollected": 1000000,
    "vatPaid": 700000,
    "netVat": 300000
  }
}
```

#### GET `/reports/sales?from=2024-01-01&to=2024-03-31&groupBy=month`
Izveštaj prodaje

#### GET `/reports/cash-flow?from=2024-01-01&to=2024-03-31`
Keš flow izveštaj

#### GET `/reports/profitability?from=2024-01-01&to=2024-03-31`
Izveštaj profitabilnosti

---

### Dashboard

#### GET `/dashboard/stats`
Statistike za dashboard

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 12500000,
    "pendingInvoices": 8,
    "activeClients": 45,
    "monthlyGrowth": 12.5,
    "recentTransactions": [...]
  }
}
```

#### GET `/dashboard/realtime`
Real-time ažuriranja (polling)

**Response:**
```json
{
  "success": true,
  "data": {
    "newInvoices": 2,
    "newPayments": 45000,
    "alerts": [
      {
        "type": "warning",
        "message": "Faktura FAK-2024-015 dospeva sutra"
      }
    ]
  }
}
```

---

### PDV Smanjenje (VAT Reduction)

#### GET `/vat-reduction/purchases`
Lista kupovina na račun firme

#### POST `/vat-reduction/purchases`
Dodavanje nove kupovine

**Request:**
```json
{
  "date": "2024-03-15",
  "supplierName": "Maxi",
  "category": "kancelarijski_materijal",
  "description": "Toneri za štampač",
  "amount": 15000,
  "vatAmount": 3000,
  "invoiceNumber": "12345"
}
```

#### GET `/vat-reduction/summary`
Sumarni pregled PDV smanjenja

---

### Admin - Korisnici

#### GET `/auth/me/users`
Lista svih korisnika (samo admin)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-1",
      "email": "admin@vertex.com",
      "name": "Admin",
      "role": "admin",
      "isActive": true,
      "lastLogin": "2024-03-15T10:30:00Z"
    }
  ]
}
```

#### POST `/auth/login/register`
Kreiranje novog korisnika

**Request:**
```json
{
  "email": "novi@vertex.com",
  "name": "Novi Korisnik",
  "password": "secure_password",
  "role": "accountant"
}
```

#### PUT `/auth/me/users/:id/permissions`
Ažuriranje dozvola korisnika

**Request:**
```json
{
  "categories": {
    "finansije": true,
    "klijenti": true,
    "prodaja": false,
    "hr": false,
    "marketing": false,
    "projekti": true,
    "inventar": false,
    "automatizacija": false,
    "admin": false
  }
}
```

---

### Admin - Logovi

#### GET `/auth/me/logs?from=2024-03-01&to=2024-03-31&action=create&userId=user-1`
Sistemski logovi

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "log-1",
      "timestamp": "2024-03-15T10:30:00Z",
      "action": "create",
      "resource": "invoices",
      "details": "POST /invoices",
      "userId": "user-1",
      "userName": "Admin"
    }
  ]
}
```

---

### CRM - Beleške

#### GET `/crm/notes`
Lista CRM beleški za klijente

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "note-1",
      "clientId": "1",
      "clientName": "Tech Solutions d.o.o.",
      "title": "Važna napomena",
      "content": "Klijent je želeo da produži ugovor",
      "date": "2024-03-15T10:30:00Z",
      "author": "Admin"
    }
  ]
}
```

#### POST `/crm/notes`
Dodavanje nove CRM beleške

**Request:**
```json
{
  "clientId": "1",
  "title": "Pregovor o uslugama",
  "content": "Potrebno diskutovati o novim uslugama"
}
```

---

### Poslovnice (Branches)

#### GET `/branches`
Lista poslovnica

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "branch-1",
      "name": "Centralna poslovnica",
      "address": "Bulevar Kralja Aleksandra 73",
      "city": "Beograd",
      "phone": "+381 11 123 4567",
      "manager": "Marko Marković"
    }
  ]
}
```

#### POST `/branches`
Kreiranje nove poslovnice

---

### Fiskalne blagajne (Fiscal Registers)

#### GET `/fiscal-registers`
Lista fiskalnih blagajni

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "register-1",
      "name": "Blagajna 1",
      "serialNumber": "FIS123456",
      "branchId": "branch-1",
      "status": "active"
    }
  ]
}
```

---

### POS terminali (POS Terminals)

#### GET `/pos-terminals`
Lista POS terminala

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pos-1",
      "name": "POS Terminal 1",
      "serialNumber": "POS123456",
      "branchId": "branch-1",
      "status": "online"
    }
  ]
}
```

---

### Narudžbe (Orders)

#### GET `/orders/received`
Primljene narudžbe

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-1",
      "number": "NAR-2024-001",
      "supplierId": "supplier-1",
      "supplierName": "Dobavljač d.o.o.",
      "date": "2024-03-15",
      "items": [
        {
          "articleId": "art-1",
          "quantity": 10,
          "price": 5000
        }
      ],
      "total": 50000,
      "status": "pending"
    }
  ]
}
```

#### GET `/orders/issued`
Izdate narudžbe

#### POST `/orders`
Kreiranje narudžbe

#### PUT `/orders/:id/status`
Ažuriranje statusa narudžbe

**Request:**
```json
{
  "status": "confirmed"
}
```

---

### Dobavljači (Suppliers)

#### GET `/suppliers`
Lista dobavljača

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "supplier-1",
      "name": "Dobavljač d.o.o.",
      "pib": "123456789",
      "address": "Dobavljačeva ulica 10",
      "city": "Beograd",
      "contactPerson": "Pera Perić",
      "email": "info@dobavljac.rs",
      "phone": "+381 11 999 9999"
    }
  ]
}
```

---

### Cenovnici (Price Lists)

#### GET `/price-lists`
Lista cenovnika

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pricelist-1",
      "name": "Cenovnik 2024",
      "validFrom": "2024-01-01",
      "validTo": "2024-12-31",
      "items": [
        {
          "articleId": "art-1",
          "price": 5000
        }
      ]
    }
  ]
}
```

---

### Kategorije (Categories)

#### GET `/categories`
Lista kategorija artikala

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat-1",
      "name": "Računari",
      "description": "Računari i oprema"
    }
  ]
}
```

---

### Serijski brojevi (Serial Numbers)

#### GET `/serial-numbers`
Lista serijskih brojeva

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "serial-1",
      "articleId": "art-1",
      "serialNumber": "SN123456",
      "status": "active"
    }
  ]
}
```

---

### HR - Evidencija radnog vremena (Time Tracking)

#### GET `/time-tracking`
Lista evidencije radnog vremena

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "tt-1",
      "employeeId": "emp-1",
      "date": "2024-03-15",
      "startTime": "08:00",
      "endTime": "16:30",
      "hours": 8.5
    }
  ]
}
```

#### POST `/time-tracking`
Dodavanje evidencije radnog vremena

---

### HR - Obračun zarada (Payroll)

#### GET `/payroll`
Lista obračuna zarada

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "payroll-1",
      "employeeId": "emp-1",
      "period": "2024-03",
      "baseSalary": 180000,
      "allowances": 20000,
      "deductions": 15000,
      "netSalary": 185000,
      "status": "pending"
    }
  ]
}
```

#### POST `/payroll/calculate`
Obračun zarada

#### PUT `/payroll/:id/approve`
Odobrenje obračuna

---

### HR - Odsustva (Absences)

#### GET `/absences`
Lista odsustva

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "absence-1",
      "employeeId": "emp-1",
      "type": "vacation",
      "startDate": "2024-03-20",
      "endDate": "2024-03-27",
      "days": 8,
      "status": "pending"
    }
  ]
}
```

#### POST `/absences`
Zahtev za odsustvo

#### PUT `/absences/:id/approve`
Odobrenje odsustva

---

### HR - Službena putovanja (Business Trips)

#### GET `/business-trips`
Lista službenih putovanja

#### POST `/business-trips`
Kreiranje službenog putovanja

---

### HR - Putni nalozi (Travel Orders)

#### GET `/travel-orders`
Lista putnih naloga

#### POST `/travel-orders`
Kreiranje putnog naloga

---

### Osnovna sredstva (Fixed Assets)

#### GET `/fixed-assets`
Lista osnovnih sredstava

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "asset-1",
      "name": "Laptop Dell XPS",
      "category": "Računari",
      "purchaseDate": "2023-01-15",
      "originalValue": 180000,
      "currentValue": 150000,
      "depreciationRate": 15
    }
  ]
}
```

---

### Amortizacija (Depreciation)

#### GET `/depreciation`
Lista amortizacije

#### POST `/depreciation/calculate`
Obračun amortizacije

---

### Promocije (Promotions)

#### GET `/promotions`
Lista promocija

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "promo-1",
      "name": "Jesenji popust",
      "description": "Popust od 10%",
      "discountPercent": 10,
      "startDate": "2024-09-01",
      "endDate": "2024-09-30",
      "status": "active"
    }
  ]
}
```

#### POST `/promotions`
Kreiranje promocije

---

### Povratne informacije (Feedback)

#### GET `/feedback`
Lista povratnih informacija

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "feedback-1",
      "clientId": "client-1",
      "rating": 5,
      "comment": "Odličan servis",
      "date": "2024-03-15T10:30:00Z",
      "status": "received"
    }
  ]
}
```

#### PUT `/feedback/:id/status`
Ažuriranje statusa povratne informacije

---

### Podsetnici (Reminders)

#### GET `/reminders`
Lista podsetnika

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "reminder-1",
      "title": "Rok za plaćanje fakture",
      "dueDate": "2024-03-20",
      "priority": "high",
      "status": "pending"
    }
  ]
}
```

#### POST `/reminders`
Kreiranje podsetnika

#### PUT `/reminders/:id/complete`
Označavanje podsetnika kao završenog

---

### Inventar (Inventory)

#### GET `/inventory/movements`
Lista kretanja inventara

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "mov-1",
      "articleId": "art-1",
      "type": "inbound",
      "quantity": 50,
      "date": "2024-03-15",
      "reference": "NAR-2024-001"
    }
  ]
}
```

#### GET `/inventory/lists`
Lista inventurnih listi

#### POST `/inventory/lists`
Kreiranje inventurne liste

---

## 👨‍💼 Admin API Endpointi

### Upravljanje korisnicima (Users)

#### POST `/auth/login/register`
Kreiranje novog korisnika (samo admin)

**Request:**
```json
{
  "email": "knjigzovoda@vertex.com",
  "name": "Petar Petrović",
  "password": "secure_password_123",
  "role": "accountant"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-new-1",
    "email": "knjigzovoda@vertex.com",
    "name": "Petar Petrović",
    "role": "accountant",
    "createdAt": "2024-03-15T10:30:00Z"
  }
}
```

#### GET `/auth/me/users`
Lista svih korisnika (samo admin)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-1",
      "email": "admin@vertex.com",
      "name": "Admin Korisnik",
      "role": "admin",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "lastLogin": "2024-03-15T10:30:00Z"
    },
    {
      "id": "user-2",
      "email": "knjigzovoda@vertex.com",
      "name": "Petar Petrović",
      "role": "accountant",
      "isActive": true,
      "createdAt": "2024-02-01T00:00:00Z"
    }
  ]
}
```

#### PUT `/auth/me/users/:id/permissions`
Ažuriranje dozvola korisnika (samo admin)

**Request:**
```json
{
  "categories": {
    "finansije": true,
    "klijenti": true,
    "prodaja": true,
    "hr": false,
    "marketing": false,
    "projekti": true,
    "inventar": true,
    "automatizacija": false,
    "admin": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-2",
    "permissions": {
      "finansije": true,
      "klijenti": true,
      "prodaja": true,
      "hr": false,
      "marketing": false,
      "projekti": true,
      "inventar": true,
      "automatizacija": false,
      "admin": false
    }
  }
}
```

#### DELETE `/auth/me/users/:id`
Brisanje korisnika (samo admin)

**Response:**
```json
{
  "success": true,
  "message": "Korisnik je obrisan"
}
```

---

### Sistemski logovi (Activity Logs)

#### GET `/auth/me/logs`
Lista sistemskih logova (samo admin)

**Query parametri:**
- `from` - od datuma (YYYY-MM-DD)
- `to` - do datuma (YYYY-MM-DD)
- `action` - tip akcije (create, update, delete, view, login, logout)
- `userId` - ID korisnika
- `resource` - tip resursa (invoices, clients, employees, itd.)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "log-1",
      "timestamp": "2024-03-15T10:30:00Z",
      "action": "create",
      "resource": "invoices",
      "details": "POST /invoices",
      "userId": "user-2",
      "userName": "Petar Petrović",
      "status": "success"
    },
    {
      "id": "log-2",
      "timestamp": "2024-03-15T09:15:00Z",
      "action": "view",
      "resource": "clients",
      "details": "GET /clients",
      "userId": "user-2",
      "userName": "Petar Petrović",
      "status": "success"
    },
    {
      "id": "log-3",
      "timestamp": "2024-03-14T17:45:00Z",
      "action": "update",
      "resource": "invoices",
      "details": "PUT /invoices/1",
      "userId": "user-1",
      "userName": "Admin Korisnik",
      "status": "success"
    }
  ]
}
```

#### GET `/auth/me/logs/export`
Izvoz logova kao CSV

**Query parametri:**
- `from` - od datuma
- `to` - do datuma

**Response:** CSV fajl sa svim logovima

---

## 📦 API Response Format

### Standardni odgovor za uspešan zahtev

```json
{
  "success": true,
  "data": {
    "id": "resource-id",
    "name": "Resource name",
    "...": "ostali podaci"
  },
  "message": "Operacija je uspešno izvršena"
}
```

### Standardni odgovor za neuspešan zahtev

```json
{
  "success": false,
  "message": "Opis greške za korisnika",
  "error": "Tehnički detalji greške (opciono)"
}
```

### HTTP Status kodovi:
- `200` - Uspešan zahtev
- `201` - Uspešno kreiran resurs
- `400` - Loš zahtev (validacija)
- `401` - Neautorizovan pristup (nema JWT tokena)
- `403` - Zabranjen pristup (nema dozvole za resurs)
- `404` - Resurs nije pronađen (vraća prazne podatke)
- `500` - Serverska greška

---

## 🔐 Zaštita i Greške

### Rukovanje greškama na frontend-u

Sistem automatski prikazuje "trenutno nema podataka" kada:
- API vrati `404` status (resurs nije pronađen)
- API vrati praznu listu podataka
- API vrati error sa statusom `500` ili drugom greškom

### Demo Mode

Dok je `DEMO_MODE = true` u `src/config/api.ts`:
- Svi API pozivi vraćaju demo podatke iz LocalStorage
- Nema stvarnih zahteva na backend
- Akcije se loguju lokalno

Kada se postavi `DEMO_MODE = false`:
- Svi pozivi idu na `https://api.vertex.com/`
- Potreban je validan JWT token
- Greške se loguju na serveru

---

## 📦 Tehnologije

- **Frontend:** React 18, TypeScript, Vite
- **UI:** Tailwind CSS, shadcn/ui, Radix UI
- **Grafici:** Recharts
- **Routing:** React Router v6
- **State:** React Query, Context API
- **Storage:** Local Storage (demo), API (produkcija)

---

## 📁 Struktura projekta

```
src/
├── components/
│   ├── layout/          # Layout komponente (Sidebar, Header)
│   ├── dialogs/         # Modal dijalozi za CRUD
│   └── ui/              # shadcn/ui komponente
├── config/
│   └── api.ts           # API konfiguracija i endpoints
├── contexts/            # React konteksti (Theme)
├── data/                # Demo podaci
├── hooks/               # Custom hooks
├── services/
│   ├── apiService.ts    # Centralizovani API pozivi
│   ├── authService.ts   # Autentifikacija
│   └── logService.ts    # Sistemski logovi
├── pages/
│   ├── admin/           # Admin stranice (Settings)
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

## 🔐 Korisničke uloge

| Uloga | Opis | Pristup |
|-------|------|---------|
| `admin` | Administrator | Sve stranice + podešavanja |
| `accountant` | Knjigovođa | Finansije, klijenti, prodaja |
| `viewer` | Pregled | Samo čitanje podataka |

---

## 📝 Logovanje akcija

Sistem automatski loguje sve korisničke akcije:
- Pregled resursa
- Kreiranje/izmena/brisanje
- Prijave/odjave
- Odobrenja/odbijanja

Logovi su dostupni u Admin > Podešavanja > Logovi (samo za admin korisnike).
