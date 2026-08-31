---
description: Start session - interactive PBI selector and role-based workflow for Pringmoni project
agent: orchestrator
---
# Start Command - Pringmoni Interactive Session

Welcome! This is the **Pringmoni Resto POS & Monitoring** project.

## Step 1: Identify Role

Please tell me:
- **Siapa nama kamu?**
- **Role kamu apa?** (FE-1/Customer, FE-2/Admin, BE, Tester Logic, Tester UI)

## Step 2: Select PBI

Based on your role, choose a PBI to work on:

```
══════════════════════════════════════════
Modul 1: User Management
  □ PBI-1.1 Login & Logout
  □ PBI-1.2 CRUD User
  □ PBI-1.3 CRUD Meja
  □ PBI-1.4 CRUD Menu

Modul 2: Pesanan
  □ PBI-2.1 Buat Pesanan
  □ PBI-2.2 Kelola Item Pesanan
  □ PBI-2.3 Status & Pembatalan

Modul 3: Pembayaran
  □ PBI-3.1 Hitung Total
  □ PBI-3.2 Pembayaran
  □ PBI-3.3 Struk & Riwayat

Modul 4: Sistem
  □ PBI-4.1 Logging

Modul 5: Laporan
  □ PBI-5.1 Laporan
  □ PBI-5.2 Analitik
══════════════════════════════════════════
```

## Step 3: Confirm & Execute

After selection, confirm:
```
OK, kerja PBI-[x.x] - [nama fitur]
- Folder: [src/app/xxx]
- File: [xxx.tsx]
- Estimasi: [x] menit

Boleh eksekusi?
```

## Step 4: Post-Generation

After code generation:
1. Run `npm run lint` to check errors
2. Run `npm run build` to verify build
3. Provide instructions for manual verification

## Branch Convention

| Role | Branch Pattern |
|------|---------------|
| FE-1 (Customer) | `feature/fe-customer-{nama}` |
| FE-2 (Admin) | `feature/fe-admin-{nama}` |
| BE | `feature/be-{nama}` |
| Tester Logic | `test/be-logika-{nama}` |
| Tester UI | `test/fe-ui-{nama}` |

All branches fork from `develop`.
