import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/BottomNav'
import SideNav from '@/components/SideNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY_NUMBER ?? '15556660581'

  return (
    <>
      <style>{`
        .app-shell         { min-height: 100dvh; }
        .app-sidenav       { display: none; }
        .app-main          { display: flex; flex-direction: column; min-height: 100dvh; }
        .app-main-content  { flex: 1; padding-bottom: 5rem; }
        .app-bottomnav     { display: block; }
        @media (min-width: 768px) {
          .app-sidenav     { display: block; }
          .app-main        { margin-left: 240px; }
          .app-main-content{ padding-bottom: 2.5rem; }
          .app-bottomnav   { display: none; }
        }
      `}</style>

      <div className="flowi-bg app-shell">
        <div className="app-sidenav">
          <SideNav waNumber={waNumber} />
        </div>
        <div className="app-main">
          <main className="app-main-content">
            {children}
          </main>
          <div className="app-bottomnav">
            <BottomNav />
          </div>
        </div>
      </div>
    </>
  )
}
