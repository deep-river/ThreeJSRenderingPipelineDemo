"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { LoadingScreen } from "@/components/loading-screen"

// 动态导入RenderingPipelineDemo组件，禁用SSR
const RenderingPipelineDemo = dynamic(
  () => import("@/components/rendering-pipeline-demo").then((mod) => mod.RenderingPipelineDemo),
  { ssr: false },
)

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading resources
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      {isLoading ? <LoadingScreen /> : <RenderingPipelineDemo />}
    </main>
  )
}

