
       'use client'
import dynamic from 'next/dynamic'
const CoreVR = dynamic(() => import('./CoreVR'), { ssr: false })
export default function Page(){ return <CoreVR /> }   
