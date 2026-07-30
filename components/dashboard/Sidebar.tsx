"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bot,
  Brain,
  CalendarDays,
  ChartNoAxesCombined,
  CreditCard,
  Gauge,
  Link2,
  MessageCircle,
  Settings,
  Users,
  X,
  Building2,
  Zap,
} from "lucide-react"

import {
  normalizePlan,
  planIncludesFeature,
  PLAN_LABELS,
  type PlanFeature,
} from "@/lib/plans"


type SidebarProps = {
  open: boolean
  setOpen: (open: boolean) => void
  subscriptionPlan?: string
}


type NavigationItem = {
  label: string
  href: string
  icon: React.ReactNode
  requiredFeature?: PlanFeature
}


const navItems: NavigationItem[] = [
  {
    label:"Dashboard",
    href:"/dashboard",
    icon:<Gauge size={20}/>
  },
  {
    label:"Conversations",
    href:"/dashboard/conversations",
    icon:<MessageCircle size={20}/>
  },
  {
    label:"Customers",
    href:"/dashboard/customers",
    icon:<Users size={20}/>
  },
  {
    label:"Bookings",
    href:"/dashboard/bookings",
    icon:<CalendarDays size={20}/>,
    requiredFeature:"appointment_bookings"
  },
  {
    label:"Business",
    href:"/dashboard/business",
    icon:<Building2 size={20}/>
  },
  {
    label:"AI Knowledge",
    href:"/dashboard/ai/knowledge",
    icon:<Brain size={20}/>,
    requiredFeature:"business_knowledge"
  },
  {
    label:"AI Personality",
    href:"/dashboard/ai/personality",
    icon:<Bot size={20}/>
  },
  {
    label:"AI Actions",
    href:"/dashboard/ai/actions",
    icon:<Zap size={20}/>,
    requiredFeature:"advanced_automation"
  },
  {
    label:"Analytics",
    href:"/dashboard/analytics",
    icon:<ChartNoAxesCombined size={20}/>
  },
  {
    label:"Integrations",
    href:"/dashboard/integrations",
    icon:<Link2 size={20}/>
  },
  {
    label:"Billing",
    href:"/dashboard/billing",
    icon:<CreditCard size={20}/>
  },
  {
    label:"Settings",
    href:"/dashboard/settings",
    icon:<Settings size={20}/>
  },
]


export function Sidebar({
  open,
  setOpen,
  subscriptionPlan="free",
}:SidebarProps){

  const pathname =
    usePathname()

  const plan =
    normalizePlan(subscriptionPlan)


  function allowed(
    feature?:PlanFeature
  ){
    if(!feature)
      return true

    return planIncludesFeature(
      plan,
      feature
    )
  }


  return (
    <>
      {/* mobile overlay */}
      {open && (
        <button
          aria-label="Close sidebar"
          onClick={()=>setOpen(false)}
          className="
          fixed inset-0 z-40
          bg-black/60
          backdrop-blur-sm
          lg:hidden
          "
        />
      )}


      <aside
        className={`
        fixed
        left-0
        top-0
        z-50
        h-screen
        w-72
        border-r
        border-slate-800
        bg-[#070b18]
        shadow-2xl

        transition-transform
        duration-300

        ${
          open
          ? "translate-x-0"
          : "-translate-x-full"
        }

        lg:translate-x-0
        `}
      >


        <div className="
        flex
        h-full
        flex-col
        ">


          {/* Logo */}
          <div className="
          border-b
          border-slate-800
          p-6
          ">

            <div className="
            flex
            items-center
            justify-between
            ">

              <div className="
              flex
              items-center
              gap-3
              ">

                <div className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-white
                text-black
                font-black
                text-xl
                shadow-lg
                ">
                  J
                </div>


                <div>
                  <h1 className="
                  text-xl
                  font-bold
                  ">
                    Jhyro AI
                  </h1>

                  <p className="
                  text-xs
                  text-slate-500
                  ">
                    Business Intelligence
                  </p>
                </div>

              </div>


              <button
                onClick={()=>setOpen(false)}
                className="
                rounded-xl
                p-2
                text-slate-400
                hover:bg-slate-800
                lg:hidden
                "
              >
                <X size={20}/>
              </button>

            </div>

          </div>



          {/* Navigation */}

          <nav className="
          flex-1
          overflow-y-auto
          px-4
          py-5
          space-y-2
          ">


            {navItems.map(item=>{

              const active =
                pathname === item.href ||
                pathname.startsWith(
                  item.href + "/"
                )

              const available =
                allowed(
                  item.requiredFeature
                )


              return (

                <Link
                  key={item.href}
                  href={item.href}
                  onClick={()=>{
                    if(
                      window.innerWidth < 1024
                    ){
                      setOpen(false)
                    }
                  }}

                  className={`
                  group
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  px-4
                  py-3
                  text-sm
                  transition-all

                  ${
                    active
                    ?
                    "bg-white text-black shadow-lg"
                    :
                    "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }
                  `}
                >

                  <span>
                    {item.icon}
                  </span>


                  <span className="
                  flex-1
                  ">
                    {item.label}
                  </span>


                  {!available && (
                    <span className="
                    rounded-full
                    bg-purple-500/20
                    px-2
                    py-1
                    text-[10px]
                    font-bold
                    text-purple-300
                    ">
                      PRO
                    </span>
                  )}

                </Link>

              )

            })}


          </nav>



          {/* Bottom card */}

          <div className="
          border-t
          border-slate-800
          p-4
          ">

            <Link
              href="/dashboard/billing"
              className="
              block
              rounded-2xl
              border
              border-slate-800
              bg-slate-900
              p-4
              hover:border-slate-600
              transition
              "
            >

              <p className="
              text-sm
              font-semibold
              ">
                Workspace
              </p>


              <p className="
              mt-1
              text-xs
              text-slate-500
              ">
                Current plan
              </p>


              <span className="
              mt-3
              inline-flex
              rounded-full
              bg-cyan-500/10
              px-3
              py-1
              text-xs
              font-bold
              text-cyan-300
              ">
                {PLAN_LABELS[plan]}
              </span>

            </Link>

          </div>


        </div>


      </aside>

    </>
  )
}