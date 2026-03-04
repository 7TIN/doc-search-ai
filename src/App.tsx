// import { Toaster } from "sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import {
//   createRootRoute,
//   createRoute,
//   createRouter,
//   RouterProvider,
// } from "@tanstack/react-router";
// import Home from "./pages/Home";


// const queryClient = new QueryClient();

// // Define root route
// const rootRoute = createRootRoute({
//   component: () => (
//     <QueryClientProvider client={queryClient}>
//       <TooltipProvider>
//         <Toaster richColors position="top-right" />
//         <RouterProvider router={router} />
//       </TooltipProvider>
//     </QueryClientProvider>
//   ),
// });

// // Define child routes
// const indexRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: "/",
//   component: Home,
// });

// // const notFoundRoute = createRoute({
// //   getParentRoute: () => rootRoute,
// //   path: "*",
// //   component: NotFound,
// // });

// // Build route tree
// const routeTree = rootRoute.addChildren([indexRoute]);

// // Create router
// const router = createRouter({ routeTree });

// export default function App() {
//   return <RouterProvider router={router} />;
// }


export default function App() {
  return (
    <div>
      Hello
    </div>
  )
}