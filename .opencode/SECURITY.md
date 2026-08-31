# Security Rules - Pringmoni

## Critical Rules

### DILARANG Mengosongkan Database
- **DILARANG** mengosongkan (DELETE/DROP) tabel database secara otomatis
- **DILARANG** menjalankan script seed yang menghapus data
- Selalu tanya user dulu sebelum operasi `DELETE FROM` atau `prisma.*.deleteMany()`
- Gunakan **mock data** daripada menghapus data asli

### DILARANG Run Dev Server
- `npm run dev` tidak boleh dijalankan oleh AI
- Hanya `npm run build` dan `npm run lint` yang diizinkan

### Sensitive Files
Plugin `security-scan` akan memblokir edit ke:
- `.env`, `.env.*`
- `*credentials*`, `*secrets*`
- `*.pem`, `*.key`, `id_rsa`, `id_ed25519`

## Security Best Practices

### Authentication
- NextAuth v5 beta - ikut API resmi
- Jangan hardcode credentials
- Gunakan environment variables

### Authorization
- Setiap Server Action harus cek session
- Role-based access control (OWNER, CASHIER, WAITER)
- Customer tidak perlu login (public access via token)

### Data Validation
- Validasi input di Server Action
- Gunakan zod atau manual validation
- Sanitize user input

### API Security
- Rate limiting di API routes
- CSRF protection via NextAuth
- SQL injection protection via Prisma ORM

### Environment Variables
- Jangan commit `.env` ke repository
- Gunakan `.env.example` sebagai template
- Minimal permissions untuk database credentials

## Audit Checklist

- [ ] Tidak ada hardcoded secrets
- [ ] Semua input divalidasi
- [ ] Authorization check di setiap action
- [ ] Error messages tidak bocor info sensitif
- [ ] Dependencies updated (npm audit)
