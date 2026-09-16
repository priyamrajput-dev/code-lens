import { useSession, signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SidebarUserButtonProps {
  compact?: boolean;
}

export function SidebarUserButton({ compact = false }: SidebarUserButtonProps) {
  const { data: session } = useSession();
  const navigate = useNavigate();

  if (!session?.user) return null;

  const user = session.user;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full flex items-center justify-start gap-3 p-2 rounded-lg hover:bg-muted/70 transition-colors text-left outline-none cursor-pointer group">
        <Avatar className="size-8 border border-border/80 shrink-0">
          {user.image ? (
            <AvatarImage src={user.image} alt={user.name || "User"} />
          ) : null}
          <AvatarFallback className="text-xs font-semibold bg-muted text-foreground">{initials}</AvatarFallback>
        </Avatar>
        {!compact && (
          <div className="flex flex-col items-start text-left overflow-hidden flex-1">
            <span className="text-xs font-semibold text-foreground leading-none truncate w-full group-hover:text-foreground">
              {user.name}
            </span>
            <span className="text-[11px] text-muted-foreground truncate w-full mt-1">
              {user.email}
            </span>
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/80 shadow-lg">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-foreground">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 size-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
