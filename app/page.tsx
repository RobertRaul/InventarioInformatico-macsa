import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-gold-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-600 mb-4">
              Sistema de Inventario
            </h1>
            <p className="text-xl text-gray-600">
              Clínica MacSalud - Gestión de Equipos Informáticos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Link
              href="/dashboard"
              className="group bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-primary-500"
            >
              <div className="text-primary-600 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Ver Inventario</h2>
              <p className="text-sm text-gray-600">Consulta y gestiona el inventario completo</p>
            </Link>

            <Link
              href="/registro"
              className="group bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-gold-500"
            >
              <div className="text-gold-600 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Registrar Equipo</h2>
              <p className="text-sm text-gray-600">Añade un nuevo equipo al inventario</p>
            </Link>

            <Link
              href="/registro-multiple"
              className="group bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-primary-500"
            >
              <div className="text-primary-600 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Registro Múltiple</h2>
              <p className="text-sm text-gray-600">Registra varios equipos de una vez</p>
            </Link>

            <Link
              href="/reportes"
              className="group bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-gold-500"
            >
              <div className="text-gold-600 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Reportes</h2>
              <p className="text-sm text-gray-600">Genera reportes en PDF y Excel</p>
            </Link>

            <Link
              href="/admin"
              className="group bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-primary-500"
            >
              <div className="text-primary-600 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Administración</h2>
              <p className="text-sm text-gray-600">Gestiona pisos, áreas y usuarios</p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
