
import PropertyInsertForm from "@/components/property/PropertyInsertForm";

const AddProperty = () => {
  return (
    <div className="min-h-screen relative">
      {/* Background with 60% transparency */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/60 via-purple-50/60 to-pink-50/60 backdrop-blur-sm -z-10"></div>
      
      {/* Header Section */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Tambah Properti</h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Form Listing
              </span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <span className="hidden sm:inline">Lengkapi data properti Anda</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Informasi Dasar</span>
              </div>
              <div className="w-8 border-t border-gray-300"></div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span>Lokasi</span>
              </div>
              <div className="w-8 border-t border-gray-300"></div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span>Detail</span>
              </div>
              <div className="w-8 border-t border-gray-300"></div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span>Media</span>
              </div>
            </div>
          </div>

          {/* Form with enhanced styling */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <PropertyInsertForm />
          </div>
        </div>
      </div>

      {/* Floating Action Helper */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white/90 backdrop-blur-md rounded-full p-3 shadow-lg border border-white/20">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-gray-700">Form Aktif</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;
