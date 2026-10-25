import { useMatches } from "@tanstack/react-router"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const APP_TITLE = "KYZN CRM"

export function SiteHeader() {
  const matches = useMatches()
  const pageTitle = matches.reduce<string | undefined>(
    (current, match) => match.staticData?.title ?? current,
    undefined
  )

  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} · ${APP_TITLE}` : APP_TITLE
  }, [pageTitle])

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{pageTitle ?? APP_TITLE}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            render={
              <a
                href="https://github.com/thisisbintang/kyzn-crm-app"
                rel="noopener noreferrer"
                target="_blank"
                className="dark:text-foreground"
              />
            }
            size="sm"
            className="hidden sm:flex"
          >
            GitHub
          </Button>
        </div>
      </div>
    </header>
  )
}
