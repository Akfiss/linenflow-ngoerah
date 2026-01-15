# 🏥 LinenFlow – Hospital Linen Management System

> **Product Requirement Document (PRD)**  
> Sistem Manajemen Linen Rumah Sakit berbasis Laravel + Inertia.js + React

---

## 📋 Daftar Isi

-   [Executive Summary](#-executive-summary)
-   [Problem Statement](#-problem-statement)
-   [Tujuan Aplikasi](#-tujuan-aplikasi)
-   [Alur Kerja (Business Logic)](#-alur-kerja-business-logic)
-   [Fitur Utama & Modul](#-fitur-utama--modul)
-   [Tech Stack](#-tech-stack)
-   [Project Structure](#-project-structure)
-   [Database Schema](#-database-schema)
-   [Role & Permission System](#-role--permission-system)
-   [Navigation & Menu Structure](#-navigation--menu-structure)
-   [Project Workflow](#-project-workflow)
-   [Development Roadmap](#-development-roadmap)
-   [Setup & Deployment](#-setup--deployment)
-   [Best Practices](#-best-practices--implementation-notes)

---

## 🎯 Executive Summary

Banyak orang IT fokus ke data medis, padahal **manajemen linen di RS besar** seperti Sanglah itu perputaran uangnya **miliaran rupiah** (pengadaan sprei, selimut, baju OK, jas dokter). Kalau hilang 10% saja per tahun, kerugiannya sangat besar.

**LinenFlow** hadir sebagai solusi untuk:

-   ✅ Mencegah kebocoran aset
-   ✅ Efisiensi operasional
-   ✅ Tracking real-time pergerakan linen

---

## 🔴 Problem Statement

RS tidak tahu posisi linen ada di mana. Pertanyaan yang sering muncul:

| Masalah            | Deskripsi                                          |
| ------------------ | -------------------------------------------------- |
| 📦 **Stok Habis**  | "Apakah stok habis karena masih kotor di laundry?" |
| 🕵️ **Stok Hilang** | "Apakah stok hilang dicuri di ruangan?"            |
| 🧵 **Stok Rusak**  | "Apakah stok rusak/sobek?"                         |

---

## 🎯 Tujuan Aplikasi

**Tracking pergerakan jumlah linen** dari:

```
Laundry (Bersih) → Distribusi ke Ruangan → Pemakaian → Pengembalian (Kotor) → Cuci
```

---

## 🔄 Alur Kerja (Business Logic)

Siklus pergerakan linen di rumah sakit:

```mermaid
flowchart LR
    subgraph LAUNDRY["🧺 LAUNDRY"]
        A[Clean Stock\nReady to Ship]
        E[Dirty Stock\nAwaiting Wash]
        F[In Washing\nProcess]
    end

    subgraph WARD["🏥 RUANGAN"]
        B[Stock at Ward\nDalam Pemakaian]
    end

    A -->|"1. Distribusi\n(Clean Out)"| B
    B -->|"2. Pengembalian\n(Dirty In)"| E
    E -->|"3. Cuci\n(Wash Start)"| F
    F -->|"4. Selesai\n(Wash Finish)"| A

    style A fill:#10b981,stroke:#059669,color:#fff
    style B fill:#3b82f6,stroke:#2563eb,color:#fff
    style E fill:#ef4444,stroke:#dc2626,color:#fff
    style F fill:#f59e0b,stroke:#d97706,color:#fff
```

### Detail Alur:

| Step | Nama                        | Deskripsi                                                       | Efek pada Stok       |
| ---- | --------------------------- | --------------------------------------------------------------- | -------------------- |
| 1️⃣   | **Distribusi (Clean Out)**  | Petugas Laundry mencatat pengiriman linen bersih ke Ruang Rawat | Gudang ⬇️ Ruangan ⬆️ |
| 2️⃣   | **Pemakaian**               | Ruangan menyimpan stok tersebut (Stock at Ward)                 | -                    |
| 3️⃣   | **Pengembalian (Dirty In)** | Petugas mengambil linen kotor dari Ruangan ke Laundry           | Ruangan ⬇️ Kotor ⬆️  |
| 4️⃣   | **Pencucian (Process)**     | Linen dicuci (Status: In Washing)                               | Kotor ⬇️ Washing ⬆️  |
| 5️⃣   | **Restock (Clean In)**      | Selesai cuci, setrika, lipat → Gudang Laundry                   | Washing ⬇️ Bersih ⬆️ |

---

## 🧩 Fitur Utama & Modul

### A. Modul Master Data

#### 1. Jenis Linen

| Field           | Deskripsi                             | Contoh                                    |
| --------------- | ------------------------------------- | ----------------------------------------- |
| Nama            | Nama jenis linen                      | Sprei Besar, Sarung Bantal, Selimut Lurik |
| Standar Berat   | Berat dalam gram                      | Penting untuk kapasitas mesin cuci        |
| SKU Code        | Kode unik item                        | LIN-SPR-001                               |
| Lifespan Cycles | Estimasi umur cuci (referensi pabrik) | 100 kali cuci                             |

> [!NOTE] > **Catatan tentang Lifespan Cycles**: Karena sistem ini menggunakan **Bulk Tracking** (jumlah) dan bukan **Item Tracking** (per lembar pakai RFID/Barcode unik), tidak dapat melacak umur sprei secara spesifik. Kolom `lifespan_cycles` disimpan sebagai data referensi untuk estimasi turnover rate.

#### 2. Ruangan (Unit)

| Field                     | Deskripsi            | Contoh                |
| ------------------------- | -------------------- | --------------------- |
| Nama Ruangan              | Lokasi di RS         | IGD, ICU, Mawar       |
| Tipe                      | Kategori ruangan     | WARD, ICU, OT, OFFICE |
| Kuota Standar (Par Stock) | Jumlah wajib standby | ICU: 100 sprei        |

---

### B. Modul Transaksi (The Heart) ❤️

#### 1. Distribusi Linen Bersih

```
📝 Form Input Bulk (Multiple Items) - React Component
├── Pilih Ruangan → List Item & Jumlah
├── Effect: Stok Gudang Laundry ⬇️
└── Effect: Stok Ruangan ⬆️
```

#### 2. Penerimaan Linen Kotor

```
📝 Form Input
├── Pilih Ruangan → List Item & Jumlah (atau Berat total)
├── Effect: Stok Ruangan ⬇️
└── Effect: Stok Kotor Laundry ⬆️
```

#### 3. Afkir (Pemusnahan/Disposal)

```
📝 Mencatat linen rusak
├── Linen sobek/bernoda permanen
├── Membutuhkan approval dari Manager
└── Effect: Mengurangi total aset RS
```

---

### C. Modul Monitoring (Dashboard)

#### 1. Lost & Found Tracker

Selisih antara **"Dikirim Bersih"** vs **"Diterima Kotor"**

```
📊 Logic Example:
├── Kirim bulan ini: 1000 sprei ke IGD
├── Kembali kotor: 950 sprei
├── Sisa di lemari IGD: 20 sprei
└── ⚠️ HILANG: 30 sprei
```

#### 2. Par Level Alert

🔔 Notifikasi jika stok bersih di bawah batas aman

---

## 🛠️ Tech Stack

Teknologi **modern SPA** untuk UI/UX premium dan interaktivitas tinggi:

```mermaid
graph TB
    subgraph BACKEND["⚙️ BACKEND (Laravel)"]
        PHP["PHP 8.3+"]
        Laravel["Laravel 12"]
        Inertia["Inertia.js v2"]
        Spatie["Spatie Permission"]
        Ziggy["Ziggy Routes"]
    end

    subgraph FRONTEND["⚛️ FRONTEND (React)"]
        React["React 18"]
        TypeScript["TypeScript"]
        ShadcnUI["shadcn/ui"]
        Tailwind["Tailwind CSS v4"]
        Lucide["Lucide Icons"]
    end

    subgraph DATABASE["🗄️ DATABASE"]
        MySQL["MySQL 8.0"]
    end

    subgraph DEVOPS["🐳 DEVOPS"]
        Docker["Docker"]
        Nginx["Nginx"]
        Vite["Vite + SSR"]
    end

    Laravel --> PHP
    Inertia --> Laravel
    Inertia --> React
    Spatie --> Laravel
    Ziggy --> Laravel
    ShadcnUI --> React
    Tailwind --> ShadcnUI
    Lucide --> ShadcnUI
    MySQL --> Laravel
    Docker --> Nginx
    Docker --> Laravel
    Vite --> React

    style PHP fill:#777bb4,stroke:#4f5b93,color:#fff
    style Laravel fill:#ff2d20,stroke:#cc2418,color:#fff
    style React fill:#61dafb,stroke:#21a1c4,color:#000
    style TypeScript fill:#3178c6,stroke:#235a97,color:#fff
    style ShadcnUI fill:#000,stroke:#333,color:#fff
    style Tailwind fill:#38bdf8,stroke:#0ea5e9,color:#fff
    style Docker fill:#2496ed,stroke:#1d7dc3,color:#fff
    style Spatie fill:#14b8a6,stroke:#0d9488,color:#fff
```

### Detail Tech Stack:

| Layer          | Technology        | Version | Kegunaan                              |
| -------------- | ----------------- | ------- | ------------------------------------- |
| **Runtime**    | PHP               | 8.5+    | Native type declarations, performance |
| **Framework**  | Laravel           | 12.47   | Backend API & Authentication          |
| **Bridge**     | Inertia.js        | 2.x     | SPA tanpa API terpisah                |
| **Permission** | Spatie Permission | 6.24    | Dynamic Role & Permission Management  |
| **Frontend**   | React             | 18.x    | Component-based UI                    |
| **Language**   | TypeScript        | 5.x     | Type safety                           |
| **UI Library** | shadcn/ui         | Latest  | Beautiful, accessible components      |
| **Styling**    | Tailwind CSS      | 4.x     | Utility-first CSS                     |
| **Icons**      | Lucide React      | Latest  | Beautiful, consistent icons           |
| **Routing**    | Ziggy             | 2.x     | Laravel routes in JavaScript          |
| **Build**      | Vite              | 6.x     | Fast HMR & SSR support                |
| **Database**   | MySQL / MariaDB   | 8.0+    | Reliable RDBMS                        |
| **Container**  | Docker            | Latest  | Containerization & deployment         |

### Keuntungan Stack Ini:

| Keuntungan                   | Deskripsi                                                 |
| ---------------------------- | --------------------------------------------------------- |
| 🎨 **Native shadcn/ui**      | `npx shadcn add table` langsung jalan tanpa porting       |
| ⚡ **Fast State Management** | Bulk Input array berjalan di client-side React            |
| 📦 **Rich JS Ecosystem**     | react-qr-reader, recharts, chart.js langsung terintegrasi |
| 🚀 **SPA Experience**        | Pindah halaman tanpa reload browser                       |
| 🔒 **Type Safety**           | TypeScript mencegah runtime errors                        |
| 🖥️ **SSR Support**           | SEO-friendly dengan server-side rendering                 |

---

## 📁 Project Structure

```
linenflow-ngoerah/
├── app/                          # Laravel Backend
│   ├── Http/
│   │   ├── Controllers/          # Inertia Controllers
│   │   ├── Middleware/           # Auth, Permission middleware
│   │   └── Requests/             # Form Requests
│   ├── Models/                   # Eloquent Models
│   └── Services/                 # Business Logic Services
│
├── resources/
│   ├── js/                       # React Frontend
│   │   ├── components/           # React Components
│   │   │   ├── ui/               # shadcn/ui components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   └── ...
│   │   │   ├── ApplicationLogo.tsx
│   │   │   └── ...
│   │   ├── Layouts/              # Page Layouts
│   │   │   ├── AuthenticatedLayout.tsx
│   │   │   └── GuestLayout.tsx
│   │   ├── Pages/                # Inertia Pages
│   │   │   ├── Auth/             # Login, Register, etc
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Profile/
│   │   │   ├── Transactions/     # (To be created)
│   │   │   ├── Inventory/        # (To be created)
│   │   │   └── Master/           # (To be created)
│   │   ├── hooks/                # Custom React Hooks
│   │   ├── lib/                  # Utilities (cn, etc)
│   │   ├── types/                # TypeScript Types
│   │   ├── app.tsx               # React Entry Point
│   │   └── ssr.tsx               # SSR Entry Point
│   ├── css/
│   │   └── app.css               # Tailwind + shadcn CSS vars
│   └── views/
│       └── app.blade.php         # Root Blade Template
│
├── routes/
│   ├── web.php                   # Web Routes (Inertia)
│   └── auth.php                  # Auth Routes
│
├── database/
│   ├── migrations/               # Database Migrations
│   └── seeders/                  # Role & Permission Seeders
│
├── config/
│   ├── permission.php            # Spatie Permission config
│   └── ...
│
├── docs/                         # Documentation
│   ├── PRD.md                    # This file
│   └── catatan-revisi.txt
│
├── docker/                       # Docker Configuration
│   ├── nginx/
│   ├── php/
│   └── mysql/
│
├── components.json               # shadcn/ui configuration
├── tailwind.config.js            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── vite.config.js                # Vite configuration
├── .npmrc                        # NPM configuration
├── docker-compose.yml            # Docker Compose
└── ...
```

### Key Directories:

| Directory                     | Purpose                                    |
| ----------------------------- | ------------------------------------------ |
| `resources/js/components/ui/` | shadcn/ui components                       |
| `resources/js/Pages/`         | Inertia page components                    |
| `resources/js/Layouts/`       | Shared layout components                   |
| `app/Services/`               | Business logic (LinenMovementService, etc) |
| `app/Http/Controllers/`       | Inertia controllers                        |

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    %% USER & ROLE MANAGEMENT (Dynamic - Spatie)
    USERS ||--o{ MODEL_HAS_ROLES : assigned
    USERS ||--o{ TRANSACTIONS : creates
    ROLES ||--o{ MODEL_HAS_ROLES : has
    ROLES ||--o{ ROLE_HAS_PERMISSIONS : contains
    PERMISSIONS ||--o{ ROLE_HAS_PERMISSIONS : part_of

    %% MASTER DATA
    LINEN_CATEGORIES ||--o{ LINENS : groups
    LINENS ||--o{ CENTRAL_STOCKS : stored_in
    LINENS ||--o{ ROOM_STOCKS : allocated_to
    LINENS ||--o{ TRANSACTION_DETAILS : includes
    ROOMS ||--o{ ROOM_STOCKS : keeps
    ROOMS ||--o{ TRANSACTIONS : involves

    %% TRANSACTIONS
    TRANSACTIONS ||--o{ TRANSACTION_DETAILS : contains

    USERS {
        bigint id PK
        string name
        string email UK
        string password
        bigint room_id FK "nullable - untuk Head Nurse"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "Soft Deletes"
    }

    ROLES {
        bigint id PK
        string name "super_admin, laundry_manager, laundry_operator, head_nurse"
        string guard_name "web"
        timestamp created_at
        timestamp updated_at
    }

    PERMISSIONS {
        bigint id PK
        string name "view_dashboard, create_distribution_trx, manage_users"
        string guard_name "web"
        timestamp created_at
        timestamp updated_at
    }

    MODEL_HAS_ROLES {
        bigint role_id FK
        string model_type "App-Models-User"
        bigint model_id FK
    }

    ROLE_HAS_PERMISSIONS {
        bigint permission_id FK
        bigint role_id FK
    }

    LINEN_CATEGORIES {
        bigint id PK
        string name "Bedding, Apparel, OK/Surgery"
        string slug UK
        timestamp created_at
        timestamp updated_at
    }

    LINENS {
        bigint id PK
        bigint linen_category_id FK
        string name "Sprei Pasien Dewasa Putih"
        string sku_code UK "LIN-SPR-001"
        int weight_gram "Beban mesin cuci"
        int lifespan_cycles_estimate "Referensi umur pabrik"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "Soft Deletes"
    }

    ROOMS {
        bigint id PK
        string name "Ruang Mawar 1, ICU Central"
        enum type "WARD-ICU-OT-OFFICE"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "Soft Deletes"
    }

    CENTRAL_STOCKS {
        bigint id PK
        bigint linen_id FK
        int clean_qty "Siap distribusi"
        int dirty_qty "Belum dicuci"
        int washing_qty "Sedang di mesin"
        timestamp created_at
        timestamp updated_at
    }

    ROOM_STOCKS {
        bigint id PK
        bigint room_id FK
        bigint linen_id FK
        int current_qty "Stok fisik di ruangan"
        int par_stock "Standar jumlah wajib"
        timestamp created_at
        timestamp updated_at
    }

    TRANSACTIONS {
        bigint id PK
        string trx_code UK "TRX-202410-0001"
        enum type "OUT_DISTRIBUTION-IN_COLLECTION-WASH_START-WASH_FINISH-ADJUSTMENT-DISPOSAL"
        bigint room_id FK "nullable untuk proses internal"
        bigint user_id FK
        date trx_date
        text notes "nullable"
        timestamp created_at
        timestamp updated_at
    }

    TRANSACTION_DETAILS {
        bigint id PK
        bigint transaction_id FK
        bigint linen_id FK
        int qty
        timestamp created_at
        timestamp updated_at
    }
```

### Migration Files

<details>
<summary>📁 Click to expand Migration Code</summary>

#### 1. linen_categories

```php
Schema::create('linen_categories', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('slug')->unique();
    $table->timestamps();
});
```

#### 2. linens (dengan Soft Deletes)

```php
Schema::create('linens', function (Blueprint $table) {
    $table->id();
    $table->foreignId('linen_category_id')->constrained();
    $table->string('name');
    $table->string('sku_code')->unique();
    $table->integer('weight_gram')->default(0);
    $table->integer('lifespan_cycles_estimate')->default(100);
    $table->timestamps();
    $table->softDeletes();
});
```

#### 3. rooms (dengan Soft Deletes)

```php
Schema::create('rooms', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->enum('type', ['WARD', 'ICU', 'OT', 'OFFICE']);
    $table->timestamps();
    $table->softDeletes();
});
```

#### 4. users (Extended)

```php
Schema::table('users', function (Blueprint $table) {
    $table->foreignId('room_id')->nullable()->constrained();
    $table->softDeletes();
});
```

#### 5. central_stocks

```php
Schema::create('central_stocks', function (Blueprint $table) {
    $table->id();
    $table->foreignId('linen_id')->constrained();
    $table->unsignedInteger('clean_qty')->default(0);
    $table->unsignedInteger('dirty_qty')->default(0);
    $table->unsignedInteger('washing_qty')->default(0);
    $table->timestamps();
});
```

#### 6. room_stocks

```php
Schema::create('room_stocks', function (Blueprint $table) {
    $table->id();
    $table->foreignId('room_id')->constrained();
    $table->foreignId('linen_id')->constrained();
    $table->unsignedInteger('current_qty')->default(0);
    $table->unsignedInteger('par_stock')->default(0);
    $table->timestamps();
    $table->unique(['room_id', 'linen_id']);
});
```

#### 7. transactions

```php
Schema::create('transactions', function (Blueprint $table) {
    $table->id();
    $table->string('trx_code')->unique();
    $table->enum('type', [
        'OUT_DISTRIBUTION', 'IN_COLLECTION',
        'WASH_START', 'WASH_FINISH',
        'ADJUSTMENT', 'DISPOSAL'
    ]);
    $table->foreignId('room_id')->nullable()->constrained();
    $table->foreignId('user_id')->constrained();
    $table->date('trx_date');
    $table->text('notes')->nullable();
    $table->timestamps();
});
```

#### 8. transaction_details

```php
Schema::create('transaction_details', function (Blueprint $table) {
    $table->id();
    $table->foreignId('transaction_id')->constrained()->cascadeOnDelete();
    $table->foreignId('linen_id')->constrained();
    $table->integer('qty');
    $table->timestamps();
});
```

</details>

---

## 👥 Role & Permission System

Menggunakan **[spatie/laravel-permission](https://spatie.be/docs/laravel-permission)** untuk Dynamic Role Management.

### 4 Role Utama

```mermaid
graph TB
    subgraph ROLES["👥 ROLE HIERARCHY"]
        SA["🔑 Super Admin\n(IT/Sistem)"]
        LM["📊 Laundry Manager\n(Kepala Instalasi)"]
        LO["👔 Laundry Operator\n(Staf Operasional)"]
        HN["👩‍⚕️ Head Nurse\n(Kepala Ruangan)"]
    end

    subgraph MASTERDATA["📋 Master Data"]
        M1["Kelola User"]
        M2["Assign Roles"]
        M3["Kelola Linen & Room"]
    end

    subgraph OPS["💼 Operasional"]
        O1["Distribusi Bersih"]
        O2["Terima Kotor"]
        O3["Proses Cuci"]
        O4["Afkir/Disposal"]
    end

    subgraph MONITORING["📊 Monitoring"]
        R1["View Dashboard"]
        R2["View Reports"]
        R3["View Financial"]
    end

    SA --> M1
    SA --> M2
    SA -.->|"View Only"| OPS

    LM --> M3
    LM --> O4
    LM --> R1
    LM --> R2
    LM --> R3

    LO --> O1
    LO --> O2
    LO --> O3
    LO --> R1

    HN --> R1
    HN -.->|"Own Room Only"| R2

    style SA fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style LM fill:#f59e0b,stroke:#d97706,color:#fff
    style LO fill:#10b981,stroke:#059669,color:#fff
    style HN fill:#3b82f6,stroke:#2563eb,color:#fff
```

### Detail Role & Permission

| Role                 | Persona          | Key Permissions                                                          |
| -------------------- | ---------------- | ------------------------------------------------------------------------ |
| **Super Admin**      | IT/Sistem        | `manage_users`, `assign_roles`, `view_*_menu` (View Only)                |
| **Laundry Manager**  | Kepala Instalasi | `manage_master_data`, `approve_disposal`, `view_financial_reports`       |
| **Laundry Operator** | Staf Operasional | `create_distribution_trx`, `create_collection_trx`, `create_washing_trx` |
| **Head Nurse**       | Kepala Ruangan   | `view_room_stock` (own room), `create_request`, `confirm_receipt`        |

### Permission Matrix (View vs Action)

| Fitur      | View Permission          | Action Permission         |
| ---------- | ------------------------ | ------------------------- |
| Distribusi | `view_distribution_menu` | `create_distribution_trx` |
| Penerimaan | `view_collection_menu`   | `create_collection_trx`   |
| Cuci       | `view_washing_menu`      | `create_washing_trx`      |
| Afkir      | `view_disposal_menu`     | `approve_disposal`        |

---

## 🧭 Navigation & Menu Structure

Menggunakan **shadcn/ui Sidebar** dengan permission-based rendering.

```mermaid
graph LR
    subgraph MENU["📋 MENU STRUCTURE"]
        A["Dashboard"]
        B["Operasional"]
        C["Inventaris"]
        D["Laporan"]
        E["Data Master"]
        F["System"]
    end

    subgraph SUBMENU_B["Operasional"]
        B1["Distribusi Bersih"]
        B2["Penerimaan Kotor"]
        B3["Proses Cuci"]
        B4["Afkir Barang"]
    end

    subgraph SUBMENU_C["Inventaris"]
        C1["Stok Gudang"]
        C2["Stok Ruangan"]
        C3["Stock Opname"]
    end

    B --> SUBMENU_B
    C --> SUBMENU_C
```

### React Sidebar Implementation

```tsx
// resources/js/components/AppSidebar.tsx
import { Sidebar, SidebarContent, SidebarMenu } from "@/components/ui/sidebar";
import { usePage } from "@inertiajs/react";

export function AppSidebar() {
    const { auth } = usePage().props;

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarMenu>
                    {/* Permission-based menu items */}
                    {auth.permissions.includes("view_dashboard") && (
                        <Link href={route("dashboard")}>Dashboard</Link>
                    )}
                    {/* ... */}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    );
}
```

---

## 📅 Development Roadmap

### Phase Overview

```mermaid
gantt
    title LinenFlow Development Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1
    Environment Setup       :done, p1a, 2024-01-15, 1d
    React + Inertia Setup   :done, p1b, after p1a, 1d
    section Phase 2
    Database Migrations     :p2a, after p1b, 2d
    Role & Permission Setup :p2b, after p2a, 1d
    section Phase 3
    Master Data CRUD        :p3a, after p2b, 4d
    section Phase 4
    Transaction Features    :p4a, after p3a, 5d
    section Phase 5
    Dashboard & Reports     :p5a, after p4a, 4d
    section Phase 6
    Testing & Deployment    :p6a, after p5a, 3d
```

### Detailed Roadmap Checklist

#### 🚀 Phase 1: Foundation ✅ COMPLETED

-   [x] **Environment Setup**

    -   [x] Verify PHP 8.5+, Composer, Node.js
    -   [x] Create Laravel 12 project
    -   [x] Setup Git repository

-   [x] **React + Inertia Setup**
    -   [x] Install Laravel Breeze (React + TypeScript + SSR)
    -   [x] Install shadcn/ui
    -   [x] Install Spatie Permission
    -   [x] Configure Tailwind CSS

---

#### 📦 Phase 2: Database & Permissions

-   [ ] **Database Migrations**

    -   [ ] Create `linen_categories` migration
    -   [ ] Create `linens` migration (with SoftDeletes)
    -   [ ] Create `rooms` migration (with SoftDeletes)
    -   [ ] Create `central_stocks` migration
    -   [ ] Create `room_stocks` migration
    -   [ ] Create `transactions` migration
    -   [ ] Create `transaction_details` migration
    -   [ ] Update `users` migration (room_id, SoftDeletes)

-   [ ] **Role & Permission Setup**
    -   [ ] Create RoleSeeder (4 roles)
    -   [ ] Create PermissionSeeder (all permissions)
    -   [ ] Assign permissions to roles
    -   [ ] Setup middleware

---

#### 📋 Phase 3: Master Data CRUD

-   [ ] **React Components**

    -   [ ] LinenCategoryPage (List, Create, Edit)
    -   [ ] LinenPage (List, Create, Edit)
    -   [ ] RoomPage (List, Create, Edit)
    -   [ ] UserPage (List, Create, Edit, Assign Role)

-   [ ] **Inertia Controllers**
    -   [ ] LinenCategoryController
    -   [ ] LinenController
    -   [ ] RoomController
    -   [ ] UserController

---

#### 💼 Phase 4: Transaction Features

-   [ ] **Distribution (Distribusi Bersih)**

    -   [ ] Bulk input form with React state
    -   [ ] Stock validation
    -   [ ] LinenMovementService

-   [ ] **Collection (Penerimaan Kotor)**

    -   [ ] Room stock display
    -   [ ] Bulk input

-   [ ] **Washing Process**

    -   [ ] Start/Finish wash
    -   [ ] Stock mutation

-   [ ] **Disposal (Afkir)**
    -   [ ] Approval workflow
    -   [ ] Asset reduction

---

#### 📊 Phase 5: Dashboard & Reports

-   [ ] **Dashboard**

    -   [ ] Stock overview widgets
    -   [ ] Charts (recharts)
    -   [ ] Par level alerts

-   [ ] **Reports**
    -   [ ] Transaction log
    -   [ ] Lost & Found analysis
    -   [ ] Export PDF/Excel

---

#### 🧪 Phase 6: Testing & Deployment

-   [ ] **Testing**

    -   [ ] Feature tests
    -   [ ] Permission tests

-   [ ] **Docker Setup**
    -   [ ] Dockerfile
    -   [ ] docker-compose.yml
    -   [ ] Nginx config

---

## 🐳 Setup & Deployment

### Prerequisites

```bash
PHP >= 8.5
Composer >= 2.6
Node.js >= 24
Docker Desktop
MySQL 8.0
Git
```

### Local Development

```bash
# Clone & Install
git clone https://github.com/Akfiss/linenflow-ngoerah.git
cd linenflow-ngoerah
composer install
npm install

# Setup
cp .env.example .env
php artisan key:generate
php artisan migrate

# Development
npm run dev
php artisan serve
```

### Docker Deployment

```yaml
# docker-compose.yml
version: "3.8"
services:
    app:
        build: ./docker/php
        volumes:
            - ./:/var/www
    webserver:
        image: nginx:alpine
        ports:
            - "80:80"
    db:
        image: mysql:8.0
        environment:
            MYSQL_DATABASE: linenflow
```

---

## 💡 Best Practices & Implementation Notes

### 1. Inertia.js Patterns

```tsx
// Controller returns Inertia response
return Inertia::render('Transactions/Distribution', [
    'rooms' => Room::all(),
    'linens' => Linen::with('category')->get(),
]);

// React page receives props with types
interface Props {
  rooms: Room[];
  linens: Linen[];
}

export default function Distribution({ rooms, linens }: Props) {
  // ...
}
```

### 2. Permission Check in React

```tsx
import { usePage } from "@inertiajs/react";

export function ActionButton() {
    const { permissions } = usePage().props.auth;

    if (!permissions.includes("create_distribution_trx")) {
        return <Button disabled>Read Only</Button>;
    }

    return <Button>Submit</Button>;
}
```

### 3. Bulk Input with React State

```tsx
const [items, setItems] = useState<LineItem[]>([{ linen_id: "", qty: 1 }]);

const addRow = () => {
    setItems([...items, { linen_id: "", qty: 1 }]);
};
```

---

## 📝 Notes

> [!IMPORTANT] > **Soft Deletes Wajib**: Data tidak boleh dihapus permanen untuk audit.

> [!TIP]
> Gunakan **shadcn/ui** untuk konsistensi UI: `npx shadcn add [component]`

> [!WARNING]
> Backend permission check tetap wajib meski UI sudah hidden.

---

**Created with ❤️ for RSUP Prof. I.G.N.G. Ngoerah**
