import Image from "next/image"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block lg:w-1/2 h-screen">
        <Image
          width={500}
          height={500}
          src="/logo-pringmoni.jpeg"
          alt="Logo PringMoni"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">
        {children}
      </div>
    </div>
  )
}