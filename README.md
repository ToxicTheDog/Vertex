# 📊 Knjigovodstveni ERP Sistem

Kompletan profesionalni program za knjigovodstvo sa svim modulima, Dashboard dizajnom i tamnom/svetlom temom.

---

## 🏗️ Arhitektura Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  • UI komponente, forme, tabele                                 │
│  • LocalStorage za demo podatke                                 │
│  • NEMA direktnog pristupa bazi podataka                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (REST API)
                              │ JWT Autentifikacija
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API SERVER                           │
│                  https://api.vertex.com/                        │
│  • Autentifikacija i autorizacija                               │
│  • Validacija podataka                                          │
│  • Poslovna logika                                              │
│  • Rukovanje greškama                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Privatna mreža
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BAZA PODATAKA                              │
│  • PostgreSQL / MySQL                                           │
│  • Pristup ISKLJUČIVO preko backend-a                           │
│  • Frontend NIKADA nema direktan pristup                        │
└─────────────────────────────────────────────────────────────────┘
```

### ⚠️ VAŽNO: Bezbednosna Arhitektura

**Frontend aplikacija NIKADA nema direktan pristup bazi podataka.**

Sva komunikacija sa bazom ide isključivo preko backend API servera:
- Frontend šalje HTTP zahteve na `https://api.vertex.com/`
- Backend validira JWT token i korisničke dozvole
- Backend izvršava upite na bazi i vraća rezultate
- Osetljivi podaci (connection strings, kredencijali) nikada ne izlaze iz backend-a

---

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

// Base URL za API - JEDINA tačka komunikacije sa serverom
export const API_BASE_URL = 'https://api.vertex.com/';
```

### Environment varijable (produkcija)

```env
VITE_API_URL=https://api.vertex.com
```

> **Napomena:** Ne postoje environment varijable za direktan pristup bazi podataka jer frontend nikada ne komunicira direktno sa bazom.

---

## 🔌 API Dokumentacija

### Base URL
```
https://api.vertex.com/
```

### Autentifikacija
Svi API pozivi zahtevaju JWT token u header-u:
```
Authorization: Bearer <access_token>
```

### Token Strategija

Sistem koristi **Access Token + Refresh Token** model:

| Token | Trajanje | Svrha |
|-------|----------|-------|
| Access Token | 30 minuta | Autorizacija API poziva |
| Refresh Token | 7 dana | Dobijanje novog access tokena |

**Automatski refresh:**
- Frontend automatski osvežava access token 5 minuta pre isteka
- Ako access token istekne, API vraća `401 Unauthorized`
- Frontend automatski pokušava refresh i ponavlja originalni zahtev
- Ako refresh token istekne, korisnik mora ponovo da se prijavi

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
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 1800,
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

#### POST `/auth/refresh`
Osvežavanje access tokena

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 1800
  }
}
```

**Response (Error - Refresh Token Expired):**
```json
{
  "success": false,
  "msg": "Refresh token je istekao. Molimo prijavite se ponovo."
}
```

#### POST `/auth/logout`
Odjava korisnika (invalidira refresh token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Uspešno ste se odjavili"
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

#### GET `/inventory/tracking`
Praćenje inventara

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "track-1",
      "articleId": "art-1",
      "articleName": "Laptop Dell XPS 15",
      "warehouseId": "wh-1",
      "quantity": 15,
      "lastUpdated": "2024-03-15T10:30:00Z"
    }
  ]
}
```

---

### Magacini (Warehouses)

#### GET `/warehouses`
Lista magacina

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "wh-1",
      "name": "Glavni magacin",
      "address": "Industrijska zona bb",
      "city": "Beograd",
      "capacity": 5000,
      "currentOccupancy": 3200,
      "status": "active"
    }
  ]
}
```

#### GET `/warehouses/:id`
Detalji magacina

#### POST `/warehouses`
Kreiranje magacina

**Request:**
```json
{
  "name": "Novi magacin",
  "address": "Adresa 123",
  "city": "Novi Sad",
  "capacity": 2000
}
```

#### PUT `/warehouses/:id`
Ažuriranje magacina

#### DELETE `/warehouses/:id`
Brisanje magacina

#### GET `/warehouses/:id/stock`
Stanje zaliha u magacinu

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "articleId": "art-1",
      "articleName": "Laptop Dell XPS 15",
      "quantity": 15,
      "minStock": 5
    }
  ]
}
```

---

### Profakture (Proforma)

#### GET `/proforma`
Lista profaktura

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prof-1",
      "number": "PROF-2024-001",
      "clientId": "1",
      "clientName": "Tech Solutions d.o.o.",
      "date": "2024-03-15",
      "dueDate": "2024-04-15",
      "items": [
        {
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
      "status": "draft"
    }
  ]
}
```

#### GET `/proforma/:id`
Detalji profakture

#### POST `/proforma`
Kreiranje profakture

**Request:**
```json
{
  "clientId": "1",
  "date": "2024-03-15",
  "dueDate": "2024-04-15",
  "items": [
    {
      "name": "Usluga",
      "quantity": 5,
      "unit": "sat",
      "price": 6000,
      "vatRate": 20
    }
  ]
}
```

#### PUT `/proforma/:id`
Ažuriranje profakture

#### DELETE `/proforma/:id`
Brisanje profakture

#### POST `/proforma/:id/convert`
Konverzija profakture u fakturu

**Response:**
```json
{
  "success": true,
  "data": {
    "invoiceId": "inv-new-1",
    "invoiceNumber": "FAK-2024-015"
  },
  "message": "Profaktura konvertovana u fakturu"
}
```

#### POST `/proforma/:id/send`
Slanje profakture klijentu

---

### Primljene fakture (Received Invoices)

#### GET `/received-invoices`
Lista primljenih faktura

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ri-1",
      "number": "ULAZ-2024-001",
      "supplierId": "supplier-1",
      "supplierName": "Dobavljač d.o.o.",
      "date": "2024-03-10",
      "dueDate": "2024-04-10",
      "subtotal": 80000,
      "vat": 16000,
      "total": 96000,
      "status": "pending"
    }
  ]
}
```

#### GET `/received-invoices/:id`
Detalji primljene fakture

#### POST `/received-invoices`
Unos primljene fakture

**Request:**
```json
{
  "supplierId": "supplier-1",
  "number": "ULAZ-2024-002",
  "date": "2024-03-15",
  "dueDate": "2024-04-15",
  "items": [
    {
      "name": "Kancelarijski materijal",
      "quantity": 100,
      "price": 200,
      "vatRate": 20
    }
  ]
}
```

#### PUT `/received-invoices/:id`
Ažuriranje primljene fakture

#### DELETE `/received-invoices/:id`
Brisanje primljene fakture

#### PUT `/received-invoices/:id/approve`
Odobrenje primljene fakture

---

### Ponavljajuće fakture (Recurring Invoices)

#### GET `/recurring-invoices`
Lista ponavljajućih faktura

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rec-1",
      "clientId": "1",
      "clientName": "Tech Solutions d.o.o.",
      "frequency": "monthly",
      "nextDate": "2024-04-01",
      "items": [
        {
          "name": "Mesečno održavanje",
          "quantity": 1,
          "price": 30000,
          "vatRate": 20
        }
      ],
      "total": 36000,
      "isActive": true
    }
  ]
}
```

#### POST `/recurring-invoices`
Kreiranje ponavljajuće fakture

**Request:**
```json
{
  "clientId": "1",
  "frequency": "monthly",
  "startDate": "2024-04-01",
  "items": [
    {
      "name": "Mesečno održavanje",
      "quantity": 1,
      "price": 30000,
      "vatRate": 20
    }
  ]
}
```

#### PUT `/recurring-invoices/:id`
Ažuriranje ponavljajuće fakture

#### DELETE `/recurring-invoices/:id`
Brisanje ponavljajuće fakture

#### PUT `/recurring-invoices/:id/toggle`
Aktivacija/deaktivacija ponavljajuće fakture

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rec-1",
    "isActive": false
  }
}
```

---

### Knjiga evidencije (Ledger)

#### GET `/ledger`
Lista stavki knjige evidencije

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ledger-1",
      "date": "2024-03-15",
      "account": "4110",
      "description": "Prihod od usluga",
      "debit": 0,
      "credit": 60000,
      "reference": "FAK-2024-001"
    }
  ]
}
```

#### GET `/ledger/:id`
Detalji stavke

#### POST `/ledger`
Kreiranje stavke

**Request:**
```json
{
  "date": "2024-03-15",
  "account": "4110",
  "description": "Prihod od usluga",
  "debit": 0,
  "credit": 60000,
  "reference": "FAK-2024-001"
}
```

#### GET `/ledger/summary`
Sumarni pregled knjige evidencije

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDebit": 5000000,
    "totalCredit": 5000000,
    "balance": 0,
    "accountSummary": [
      {
        "account": "4110",
        "name": "Prihod od usluga",
        "debit": 0,
        "credit": 3000000
      }
    ]
  }
}
```

#### GET `/ledger/export`
Izvoz knjige evidencije (CSV/PDF)

---

### Izveštaji po klijentima (Client Reports)

#### GET `/reports/clients`
Lista izveštaja po klijentima

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "clientId": "1",
      "clientName": "Tech Solutions d.o.o.",
      "totalInvoiced": 500000,
      "totalPaid": 400000,
      "outstanding": 100000,
      "invoiceCount": 5
    }
  ]
}
```

#### GET `/reports/clients/:clientId`
Detaljan izveštaj za klijenta

#### GET `/reports/clients/export`
Izvoz izveštaja po klijentima

---

### Plaćanja dobavljačima (Supplier Payments)

#### GET `/supplier-payments`
Lista plaćanja dobavljačima

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sp-1",
      "supplierId": "supplier-1",
      "supplierName": "Dobavljač d.o.o.",
      "invoiceNumber": "ULAZ-2024-001",
      "amount": 96000,
      "date": "2024-03-15",
      "status": "pending"
    }
  ]
}
```

#### POST `/supplier-payments`
Kreiranje plaćanja

**Request:**
```json
{
  "supplierId": "supplier-1",
  "invoiceId": "ri-1",
  "amount": 96000,
  "date": "2024-03-15"
}
```

#### GET `/supplier-payments/:id`
Detalji plaćanja

#### PUT `/supplier-payments/:id/approve`
Odobrenje plaćanja

---

### PDV evidencija (VAT Records)

#### GET `/vat-records`
Lista PDV zapisa

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "vat-1",
      "period": "2024-03",
      "type": "output",
      "invoiceId": "inv-1",
      "baseAmount": 50000,
      "vatRate": 20,
      "vatAmount": 10000,
      "date": "2024-03-15"
    }
  ]
}
```

#### POST `/vat-records`
Kreiranje PDV zapisa

**Request:**
```json
{
  "period": "2024-03",
  "type": "output",
  "invoiceId": "inv-1",
  "baseAmount": 50000,
  "vatRate": 20,
  "vatAmount": 10000
}
```

#### GET `/vat-records/:id`
Detalji PDV zapisa

#### GET `/vat-records/export`
Izvoz PDV evidencije

---

### PPPDV (Prethodna prijava PDV-a)

#### GET `/pppdv`
Lista PPPDV prijava

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pppdv-1",
      "period": "2024-03",
      "outputVat": 1000000,
      "inputVat": 700000,
      "netVat": 300000,
      "status": "draft",
      "createdAt": "2024-04-01"
    }
  ]
}
```

#### POST `/pppdv/generate`
Generisanje PPPDV prijave

**Request:**
```json
{
  "period": "2024-03"
}
```

#### GET `/pppdv/:id`
Detalji PPPDV prijave

#### PUT `/pppdv/:id/submit`
Podnošenje PPPDV prijave

#### GET `/pppdv/:id/export`
Izvoz PPPDV prijave (PDF)

---

### Zalihe (Stock)

#### GET `/stock`
Lista zaliha

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "stock-1",
      "articleId": "art-1",
      "articleName": "Laptop Dell XPS 15",
      "warehouseId": "wh-1",
      "warehouseName": "Glavni magacin",
      "quantity": 15,
      "minStock": 5,
      "status": "ok"
    }
  ]
}
```

#### GET `/stock/:id`
Detalji zalihe

#### PUT `/stock/:id/adjust`
Korekcija zalihe

**Request:**
```json
{
  "quantity": 20,
  "reason": "Inventura - korekcija"
}
```

#### POST `/stock/transfer`
Transfer između magacina

**Request:**
```json
{
  "articleId": "art-1",
  "fromWarehouseId": "wh-1",
  "toWarehouseId": "wh-2",
  "quantity": 5
}
```

#### GET `/stock/low-stock`
Lista artikala sa niskim zalihama

---

### Kampanje (Campaigns)

#### GET `/campaigns`
Lista marketinških kampanja

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "camp-1",
      "name": "Prolećna kampanja",
      "description": "Promotivna kampanja za proleće",
      "startDate": "2024-03-01",
      "endDate": "2024-05-31",
      "budget": 500000,
      "spent": 200000,
      "status": "active"
    }
  ]
}
```

#### GET `/campaigns/:id`
Detalji kampanje

#### POST `/campaigns`
Kreiranje kampanje

**Request:**
```json
{
  "name": "Letnja kampanja",
  "description": "Opis kampanje",
  "startDate": "2024-06-01",
  "endDate": "2024-08-31",
  "budget": 300000
}
```

#### PUT `/campaigns/:id`
Ažuriranje kampanje

#### DELETE `/campaigns/:id`
Brisanje kampanje

#### GET `/campaigns/:id/stats`
Statistike kampanje

**Response:**
```json
{
  "success": true,
  "data": {
    "impressions": 50000,
    "clicks": 5000,
    "conversions": 500,
    "revenue": 2500000,
    "roi": 400
  }
}
```

---

### Projekti (Projects)

#### GET `/projects`
Lista projekata

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "proj-1",
      "name": "ERP Implementacija",
      "description": "Implementacija ERP sistema",
      "clientId": "1",
      "clientName": "Tech Solutions d.o.o.",
      "startDate": "2024-01-15",
      "endDate": "2024-06-30",
      "budget": 2000000,
      "status": "active",
      "progress": 45
    }
  ]
}
```

#### GET `/projects/:id`
Detalji projekta

#### POST `/projects`
Kreiranje projekta

**Request:**
```json
{
  "name": "Novi projekat",
  "description": "Opis projekta",
  "clientId": "1",
  "startDate": "2024-04-01",
  "endDate": "2024-09-30",
  "budget": 1500000
}
```

#### PUT `/projects/:id`
Ažuriranje projekta

#### DELETE `/projects/:id`
Brisanje projekta

---

### Zadaci (Tasks)

#### GET `/tasks`
Lista zadataka

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "task-1",
      "title": "Dizajn baze podataka",
      "description": "Kreirati šemu baze",
      "projectId": "proj-1",
      "assigneeId": "emp-1",
      "assigneeName": "Marko Marković",
      "priority": "high",
      "dueDate": "2024-04-15",
      "status": "in_progress"
    }
  ]
}
```

#### GET `/tasks/:id`
Detalji zadatka

#### POST `/tasks`
Kreiranje zadatka

**Request:**
```json
{
  "title": "Novi zadatak",
  "description": "Opis zadatka",
  "projectId": "proj-1",
  "assigneeId": "emp-1",
  "priority": "medium",
  "dueDate": "2024-04-30"
}
```

#### PUT `/tasks/:id`
Ažuriranje zadatka

#### DELETE `/tasks/:id`
Brisanje zadatka

#### PUT `/tasks/:id/status`
Ažuriranje statusa zadatka

**Request:**
```json
{
  "status": "completed"
}
```

#### GET `/projects/:projectId/tasks`
Zadaci po projektu

---

### HR - Godišnja obrada (Yearly Processing)

#### GET `/yearly-processing`
Lista godišnjih obrada

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "yp-1",
      "year": 2024,
      "type": "annual_leave_carryover",
      "description": "Prenos godišnjeg odmora",
      "status": "pending",
      "createdAt": "2024-01-05"
    }
  ]
}
```

#### POST `/yearly-processing`
Kreiranje godišnje obrade

#### GET `/yearly-processing/:id`
Detalji obrade

#### PUT `/yearly-processing/:id/execute`
Izvršavanje obrade

---

### Automatizacija (Automation)

#### GET `/automation/rules`
Lista pravila automatizacije

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rule-1",
      "name": "Automatsko slanje faktura",
      "trigger": "invoice_created",
      "action": "send_email",
      "conditions": {
        "clientType": "premium"
      },
      "isActive": true,
      "createdAt": "2024-01-15"
    }
  ]
}
```

#### GET `/automation/rules/:id`
Detalji pravila

#### POST `/automation/rules`
Kreiranje pravila

**Request:**
```json
{
  "name": "Podsetnik za plaćanje",
  "trigger": "invoice_overdue",
  "action": "send_reminder",
  "conditions": {
    "daysOverdue": 7
  }
}
```

#### PUT `/automation/rules/:id`
Ažuriranje pravila

#### DELETE `/automation/rules/:id`
Brisanje pravila

#### PUT `/automation/rules/:id/toggle`
Aktivacija/deaktivacija pravila

#### GET `/automation/logs`
Logovi izvršavanja automatizacije

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "alog-1",
      "ruleId": "rule-1",
      "ruleName": "Automatsko slanje faktura",
      "executedAt": "2024-03-15T10:00:00Z",
      "status": "success",
      "details": "Email poslat na info@techsolutions.rs"
    }
  ]
}
```

---

### Profil korisnika (Profile)

#### GET `/profile`
Podaci o profilu prijavljenog korisnika

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-1",
    "email": "admin@vertex.com",
    "name": "Admin Korisnik",
    "role": "admin",
    "phone": "+381 64 123 4567",
    "avatar": "https://api.vertex.com/avatars/user-1.jpg"
  }
}
```

#### PUT `/profile`
Ažuriranje profila

**Request:**
```json
{
  "name": "Novo Ime",
  "phone": "+381 64 999 9999"
}
```

#### PUT `/profile/change-password`
Promena lozinke

**Request:**
```json
{
  "currentPassword": "stara_lozinka",
  "newPassword": "nova_lozinka_123"
}
```

#### GET `/profile/notifications`
Podešavanja notifikacija

#### PUT `/profile/notifications`
Ažuriranje podešavanja notifikacija

**Request:**
```json
{
  "emailNotifications": true,
  "invoiceReminders": true,
  "paymentAlerts": true,
  "systemUpdates": false
}
```

---

### Podešavanja sistema (Settings)

#### GET `/settings`
Sistemska podešavanja

**Response:**
```json
{
  "success": true,
  "data": {
    "currency": "RSD",
    "language": "sr",
    "dateFormat": "DD.MM.YYYY",
    "vatRate": 20,
    "invoicePrefix": "FAK",
    "autoBackup": true
  }
}
```

#### PUT `/settings`
Ažuriranje podešavanja

#### GET `/settings/company`
Podaci o kompaniji

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Vertex d.o.o.",
    "pib": "123456789",
    "maticniBroj": "12345678",
    "address": "Bulevar Kralja Aleksandra 73",
    "city": "Beograd",
    "email": "info@vertex.com",
    "phone": "+381 11 123 4567",
    "bankAccount": "265-1234567890-12"
  }
}
```

#### PUT `/settings/company`
Ažuriranje podataka kompanije

---

### Sistemski logovi (System Logs)

#### GET `/logs`
Lista svih sistemskih logova

**Query parametri:**
- `from` - od datuma (YYYY-MM-DD)
- `to` - do datuma (YYYY-MM-DD)
- `action` - tip akcije
- `userId` - ID korisnika

#### GET `/logs/:id`
Detalji loga

#### DELETE `/logs/clear`
Brisanje logova

#### GET `/logs/export`
Izvoz logova

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
