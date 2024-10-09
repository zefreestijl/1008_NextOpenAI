import DashboardSkeleton from '@/app/ui/skeletons';



export default function Loading() {
  return <>
    <div className='relative opacity-50'>
        <DashboardSkeleton />
        <p className='absolute top-0  '>Loading...</p>
    </div>
    </>;
}