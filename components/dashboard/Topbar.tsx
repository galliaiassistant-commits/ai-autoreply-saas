"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Bot,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react"

import AccountMenu from "@/components/dashboard/AccountMenu"
import NotificationsMenu from "@/components/dashboard/NotificationsMenu"
import WorkspaceSwitcher from "@/components/dashboard/WorkspaceSwitcher"


type Workspace = {
  id:string
  business_name:string|null
}


type TopbarProps = {
  sidebarOpen:boolean
  setSidebarOpen:(open:boolean)=>void
  businesses?:Workspace[]
  currentBusinessId?:string|null
  canManageWorkspaces?:boolean
}


export function Topbar({
  sidebarOpen,
  setSidebarOpen,
  businesses=[],
  currentBusinessId=null,
  canManageWorkspaces=false,
}:TopbarProps){


  const [isAdmin,setIsAdmin] =
    useState(false)


  useEffect(()=>{

    let mounted=true


    async function checkAdmin(){

      try{

        const res =
          await fetch(
            "/api/admin/status",
            {
              cache:"no-store"
            }
          )


        if(!res.ok)
          return


        const data =
          await res.json()


        if(mounted){
          setIsAdmin(
            data.isAdmin === true
          )
        }


      }catch{

        if(mounted){
          setIsAdmin(false)
        }

      }

    }


    checkAdmin()


    return ()=>{
      mounted=false
    }


  },[])



  return (

    <header
      className="
      sticky
      top-0
      z-30
      border-b
      border-slate-800
      bg-[#050816]/80
      backdrop-blur-xl
      "
    >

      <div
        className="
        flex
        h-20
        items-center
        justify-between
        gap-4
        px-4
        sm:px-6
        lg:px-8
        "
      >


        {/* Left */}

        <div className="
        flex
        items-center
        gap-4
        min-w-0
        ">


          <button
            onClick={()=>
              setSidebarOpen(
                !sidebarOpen
              )
            }
            className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            border
            border-slate-800
            bg-slate-900
            text-slate-300
            hover:bg-slate-800
            transition
            "
          >

            {sidebarOpen
              ?
              <X size={20}/>
              :
              <Menu size={20}/>
            }

          </button>



          <div className="
          hidden
          md:block
          ">

            <p className="
            text-xs
            uppercase
            tracking-[0.3em]
            text-slate-600
            ">
              Jhyro AI
            </p>


            <h1 className="
            text-xl
            font-bold
            text-white
            ">
              Business Dashboard
            </h1>

          </div>


        </div>




        {/* Right */}

        <div className="
        flex
        items-center
        gap-2
        sm:gap-3
        "
        >


          {canManageWorkspaces &&
          businesses.length > 0 && (

            <div className="
            hidden
            lg:block
            ">

              <WorkspaceSwitcher
                businesses={businesses}
                currentBusinessId={
                  currentBusinessId
                }
              />

            </div>

          )}



          <Link
            href="/chat"
            className="
            hidden
            md:flex
            h-11
            items-center
            gap-2
            rounded-xl
            border
            border-cyan-400/20
            bg-cyan-400/10
            px-4
            text-sm
            font-semibold
            text-cyan-200
            hover:bg-cyan-400/20
            transition
            "
          >

            <Bot size={17}/>
            AI Chat

          </Link>



          {isAdmin && (

            <Link
              href="/admin"
              className="
              hidden
              md:flex
              h-11
              items-center
              gap-2
              rounded-xl
              border
              border-purple-400/20
              bg-purple-400/10
              px-4
              text-sm
              font-semibold
              text-purple-200
              "
            >

              <ShieldCheck size={17}/>
              Admin

            </Link>

          )}



          <Link
            href="/dashboard"
            className="
            flex
            md:hidden
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            border
            border-slate-800
            bg-slate-900
            "
          >

            <LayoutDashboard size={18}/>

          </Link>



          <NotificationsMenu />

          <AccountMenu />


        </div>


      </div>



      {/* Mobile workspace */}

      {canManageWorkspaces &&
      businesses.length > 0 && (

        <div className="
        px-4
        pb-4
        lg:hidden
        ">

          <WorkspaceSwitcher
            businesses={businesses}
            currentBusinessId={
              currentBusinessId
            }
          />

        </div>

      )}



      {/* Mobile quick actions */}

      <div className="
      flex
      gap-2
      px-4
      pb-4
      md:hidden
      ">


        <Link
          href="/chat"
          className="
          flex-1
          rounded-xl
          border
          border-cyan-400/20
          bg-cyan-400/10
          py-2
          text-center
          text-xs
          font-bold
          text-cyan-200
          "
        >

          <span className="
          inline-flex
          items-center
          gap-2
          ">
            <Bot size={14}/>
            AI Chat
          </span>

        </Link>



        {isAdmin && (

          <Link
            href="/admin"
            className="
            flex-1
            rounded-xl
            border
            border-purple-400/20
            bg-purple-400/10
            py-2
            text-center
            text-xs
            font-bold
            text-purple-200
            "
          >

            <span className="
            inline-flex
            items-center
            gap-2
            ">
              <ShieldCheck size={14}/>
              Admin
            </span>


          </Link>

        )}


      </div>


    </header>

  )
}