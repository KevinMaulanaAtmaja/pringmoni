import { connection } from "next/server"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileCode2,
  FlaskConical,
  MinusCircle,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  bacaCoverage,
  bacaLaporanTest,
  faseWhitebox,
  type DetailTest,
  type LaporanFile,
  type StatusFase,
  type StatusTest,
} from "./report"

function formatDurasi(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`
  const detik = ms / 1000
  if (detik < 60) return `${detik.toFixed(1)} s`
  const menit = Math.floor(detik / 60)
  return `${menit} m ${Math.round(detik % 60)} s`
}

function formatWaktu(iso: string | null): string {
  if (!iso) return "belum pernah"
  const tanggal = new Date(iso)
  if (Number.isNaN(tanggal.getTime())) return "tidak diketahui"
  return tanggal.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

const gayaStatusTest: Record<StatusTest, string> = {
  passed: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  skipped: "bg-amber-100 text-amber-700",
}

const labelStatusTest: Record<StatusTest, string> = {
  passed: "Lulus",
  failed: "Gagal",
  skipped: "Dilewati",
}

const gayaStatusFase: Record<StatusFase, string> = {
  selesai: "bg-emerald-100 text-emerald-700",
  sebagian: "bg-amber-100 text-amber-700",
  belum: "bg-red-100 text-red-700",
}

const labelStatusFase: Record<StatusFase, string> = {
  selesai: "Selesai",
  sebagian: "Sebagian",
  belum: "Belum",
}

function BadgeStatusTest({ status }: { status: StatusTest }) {
  return (
    <Badge className={gayaStatusTest[status]}>{labelStatusTest[status]}</Badge>
  )
}

function IkonStatus({ status }: { status: StatusTest }) {
  if (status === "failed") {
    return <XCircle className="size-4 shrink-0 text-red-600" />
  }
  if (status === "skipped") {
    return <MinusCircle className="size-4 shrink-0 text-amber-600" />
  }
  return <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
}

function KartuRingkasan({
  judul,
  nilai,
  ikon: Ikon,
  warna,
}: {
  judul: string
  nilai: string | number
  ikon: typeof CheckCircle2
  warna: string
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3">
        <div className={`rounded-xl p-2.5 ${warna}`}>
          <Ikon className="size-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{judul}</p>
          <p className="text-2xl font-bold">{nilai}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function BarisTest({ test }: { test: DetailTest }) {
  return (
    <li className="flex items-start gap-3 rounded-xl px-3 py-2 odd:bg-muted/40">
      <span className="mt-0.5">
        <IkonStatus status={test.status} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium break-words">{test.nama}</p>
        <p className="text-xs text-muted-foreground">{test.grup}</p>
        {test.error ? (
          <p className="mt-1 rounded-lg bg-red-50 px-2.5 py-1.5 font-mono text-xs text-red-700">
            {test.error.ringkasan}
          </p>
        ) : null}
      </div>
      <span className="mt-0.5 shrink-0 text-xs text-muted-foreground">
        {formatDurasi(test.durasiMs)}
      </span>
    </li>
  )
}

function KartuFile({ file }: { file: LaporanFile }) {
  const daftarTest = [...file.tests].sort((a, b) => {
    if (a.status === b.status) return 0
    if (a.status === "failed") return -1
    if (b.status === "failed") return 1
    return 0
  })

  return (
    <Card size="sm" className={file.gagal > 0 ? "ring-red-200" : undefined}>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileCode2 className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{file.nama}</span>
          </CardTitle>
          <p className="truncate text-xs text-muted-foreground">{file.path}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <BadgeStatusTest status={file.status} />
          <span className="text-xs text-muted-foreground">
            {file.lulus}/{file.total} lulus
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {file.gagal > 0 ? (
          <ul className="space-y-1">
            {daftarTest.map((test) => (
              <BarisTest key={`${file.path}-${test.grup}-${test.nama}`} test={test} />
            ))}
          </ul>
        ) : (
          <details className="group">
            <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
              Lihat {file.total} test yang lulus
            </summary>
            <ul className="mt-2 space-y-1">
              {daftarTest.map((test) => (
                <BarisTest key={`${file.path}-${test.grup}-${test.nama}`} test={test} />
              ))}
            </ul>
          </details>
        )}
      </CardContent>
    </Card>
  )
}

export default async function TestingPage() {
  await connection()

  const session = await auth()
  if (!session) redirect("/login")
  if (session.user.role !== "owner") redirect("/dashboard")

  const [laporan, coverage] = await Promise.all([bacaLaporanTest(), bacaCoverage()])

  if (!laporan) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold">Whitebox Testing</h1>
        <Card size="sm">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <FlaskConical className="size-10 text-muted-foreground" />
            <p className="font-medium">Belum ada laporan test.</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Jalankan <code className="rounded bg-muted px-1.5 py-0.5">npm run test:report</code>{" "}
              terlebih dahulu untuk membuat <code className="rounded bg-muted px-1.5 py-0.5">test-results.xml</code>{" "}
              dan laporan coverage.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const fase = faseWhitebox(laporan.gagal)
  const fileGagal = laporan.files.filter((file) => file.gagal > 0)
  const fileLulus = laporan.files.filter((file) => file.gagal === 0)
  const fileUrut = [...fileGagal, ...fileLulus]
  const kegagalan = fileGagal.flatMap((file) =>
    file.tests
      .filter((test) => test.status === "failed")
      .map((test) => ({ file: file.nama, path: file.path, test }))
  )
  const coverageRendah = coverage
    ? [...coverage.files].sort((a, b) => a.statements - b.statements).slice(0, 8)
    : []

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Whitebox Testing</h1>
          <p className="text-sm text-muted-foreground">
            Laporan unit test Server Actions & library, diperbarui{" "}
            {formatWaktu(laporan.dibuatPada)}.
          </p>
        </div>
        <Badge
          className={
            laporan.sukses
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }
        >
          {laporan.sukses ? "Semua test lulus" : `${laporan.gagal} test gagal`}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KartuRingkasan
          judul="Total test"
          nilai={laporan.total}
          ikon={FlaskConical}
          warna="bg-slate-100 text-slate-700"
        />
        <KartuRingkasan
          judul="Lulus"
          nilai={laporan.lulus}
          ikon={CheckCircle2}
          warna="bg-emerald-100 text-emerald-700"
        />
        <KartuRingkasan
          judul="Gagal"
          nilai={laporan.gagal}
          ikon={XCircle}
          warna="bg-red-100 text-red-700"
        />
        <KartuRingkasan
          judul="Dilewati"
          nilai={laporan.dilewati}
          ikon={MinusCircle}
          warna="bg-amber-100 text-amber-700"
        />
        <KartuRingkasan
          judul="Durasi"
          nilai={formatDurasi(laporan.durasiMs)}
          ikon={Clock}
          warna="bg-sky-100 text-sky-700"
        />
      </div>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FlaskConical className="size-4 text-muted-foreground" />
            Status Fase Whitebox
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {fase.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border/60 p-3"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">
                  {item.id} · {item.nama}
                </p>
                <Badge className={gayaStatusFase[item.status]}>
                  {labelStatusFase[item.status]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{item.catatan}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {kegagalan.length > 0 ? (
        <Card size="sm" className="ring-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-red-700">
              <AlertTriangle className="size-4" />
              Ringkasan Kegagalan ({kegagalan.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {kegagalan.map(({ file, path, test }) => (
              <div
                key={`${path}-${test.grup}-${test.nama}`}
                className="rounded-xl border border-red-200/70 bg-red-50/60 p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-red-600 text-white">{file}</Badge>
                  <span className="text-sm font-medium">{test.nama}</span>
                </div>
                <p className="mt-1 font-mono text-xs text-red-700">
                  {test.error?.ringkasan}
                </p>
                <p className="mt-1 truncate text-[11px] text-muted-foreground">
                  {path} · {test.grup}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {coverage ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-base">Coverage Whitebox</CardTitle>
            <p className="text-xs text-muted-foreground">
              Persentase per metrik dari seluruh file sumber yang diuji.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Statement", nilai: coverage.statements.pct },
                { label: "Branch", nilai: coverage.branches.pct },
                { label: "Function", nilai: coverage.functions.pct },
                { label: "Line", nilai: coverage.lines.pct },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-border/60 p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-semibold">{item.nilai.toFixed(2)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(item.nilai, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                8 file dengan coverage statement terendah
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-muted-foreground">
                    <tr className="border-b">
                      <th className="py-2 pr-3 font-medium">File</th>
                      <th className="py-2 pr-3 font-medium">Stmt</th>
                      <th className="py-2 pr-3 font-medium">Branch</th>
                      <th className="py-2 pr-3 font-medium">Func</th>
                      <th className="py-2 font-medium">Line</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coverageRendah.map((file) => (
                      <tr key={file.path} className="border-b border-border/40 last:border-0">
                        <td className="max-w-[220px] truncate py-2 pr-3 font-medium" title={file.path}>
                          {file.nama}
                        </td>
                        <td className="py-2 pr-3">{file.statements.toFixed(1)}%</td>
                        <td className="py-2 pr-3">{file.branches.toFixed(1)}%</td>
                        <td className="py-2 pr-3">{file.functions.toFixed(1)}%</td>
                        <td className="py-2">{file.lines.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Hasil per File</h2>
        {fileUrut.map((file) => (
          <KartuFile key={file.path} file={file} />
        ))}
      </div>
    </div>
  )
}
