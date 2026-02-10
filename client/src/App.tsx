import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AboutDialog } from "@/components/about-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import PrdsPage from "@/pages/prds";
import {
  UserStoryGenerator,
  ProblemRefiner,
  FeaturePrioritizer,
  SprintPlanner,
  InterviewPrep,
} from "@/pages/tool-pages";
import ComparePrdsPage from "@/pages/compare-prds";
import SharedPrd from "@/pages/shared-prd";
import SharedToolResult from "@/pages/shared-tool-result";
import TemplatesPage from "@/pages/templates";
import ToolResultsPage from "@/pages/tool-results";
import ToolResultDetail from "@/pages/tool-result-detail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/prds" component={PrdsPage} />
      <Route path="/user-stories" component={UserStoryGenerator} />
      <Route path="/problem-refiner" component={ProblemRefiner} />
      <Route path="/prioritization" component={FeaturePrioritizer} />
      <Route path="/sprint-planning" component={SprintPlanner} />
      <Route path="/interview-prep" component={InterviewPrep} />
      <Route path="/compare" component={ComparePrdsPage} />
      <Route path="/share/:shareId" component={SharedPrd} />
      <Route path="/share/tool/:shareId" component={SharedToolResult} />
      <Route path="/templates" component={TemplatesPage} />
      <Route path="/tool-results" component={ToolResultsPage} />
      <Route path="/tool-results/:id" component={ToolResultDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

const style = {
  "--sidebar-width": "16rem",
  "--sidebar-width-icon": "3rem",
};

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ideaforge-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between gap-4 p-2 border-b sticky top-0 z-50 bg-background">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div className="flex items-center gap-1">
                    <AboutDialog />
                    <ThemeToggle />
                  </div>
                </header>
                <main className="flex-1 overflow-auto">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
