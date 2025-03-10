import { Loader2 } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-black text-white">
      <Loader2 className="w-12 h-12 animate-spin mb-4" />
      <h1 className="text-2xl font-bold mb-2">Loading 3D Resources</h1>
      <p className="text-gray-400">Preparing rendering pipeline demo...</p>
    </div>
  )
}

