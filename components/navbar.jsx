"use client"

import Link from "next/link"
import { useAuthContext } from "./auth-provider"
import { signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Video, LogOut, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "./theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const { user, profile } = useAuthContext()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = "/"
  }

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-xl">
            <Video className="h-6 w-6 text-primary" />
            <span>VideoMeet</span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar>
                        <AvatarImage src={user.photoURL || "/placeholder.svg"} alt={user.displayName || "User"} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {(user.displayName || user.email || "U")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="flex-col items-start">
                      <div className="font-medium">{user.displayName || "User"}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/login">
                <Button>
                  <User className="mr-2 h-4 w-4" />
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
