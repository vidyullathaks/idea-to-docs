import { useLocation, Link } from "wouter";
import {
  FileText,
  BookOpen,
  Target,
  BarChart3,
  Calendar,
  GraduationCap,
  Sparkles,
  ArrowLeftRight,
  FolderOpen,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const tools = [
  { title: "PRD Generator", url: "/", icon: FileText },
  { title: "Your PRDs", url: "/prds", icon: FolderOpen },
  { title: "Compare PRDs", url: "/compare", icon: ArrowLeftRight },
  { title: "User Story Generator", url: "/user-stories", icon: BookOpen },
  { title: "Problem Refiner", url: "/problem-refiner", icon: Target },
  { title: "Feature Prioritizer", url: "/prioritization", icon: BarChart3 },
  { title: "Sprint Planner", url: "/sprint-planning", icon: Calendar },
  { title: "Interview Prep", url: "/interview-prep", icon: GraduationCap },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar data-testid="sidebar-navigation">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-none" data-testid="text-sidebar-title">IdeaForge</h1>
            <p className="text-xs text-muted-foreground">PM Toolkit</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>PM Toolkit</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tools.map((tool) => (
                <SidebarMenuItem key={tool.title}>
                  <SidebarMenuButton asChild isActive={location === tool.url} data-testid={`sidebar-link-${tool.title.toLowerCase().replace(/\s+/g, "-")}`}>
                    <Link href={tool.url}>
                      <tool.icon />
                      <span>{tool.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
