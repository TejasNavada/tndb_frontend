import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("login", "routes/login.page.tsx"),
  route("register", "routes/register.page.tsx"),

  route(
    "dashboard",
    "routes/dashboard.layout.tsx", // Your main DashboardLayout (Header, main area with an Outlet)
    [
      index("routes/dashboard._index.tsx"), // Default page for /dashboard

      // The "instances" route now becomes a parent.
      // Its component, InstancesPage, will display the table AND an <Outlet />
      // for its children (like the :dbId detail page).
      route(
        "instances",                         // Path: /dashboard/instances
        "routes/dashboard.instances.page.tsx", // This component needs an <Outlet />
        [
          // Child route for a specific instance's details
          // This will render inside the <Outlet /> of InstancesPage
          route(
            ":dbId",                       // Path: /dashboard/instances/:dbId
            "routes/dashboard.instance-detail.page.tsx", // Shows details for :dbId AND has an <Outlet /> for "restore"
            [
              // Child route for restoring the instance
              // This will render inside the <Outlet /> of InstanceDetailPage
              route(
                "restore",                 // Path: /dashboard/instances/:dbId/restore
                "routes/dashboard.restore.page.tsx"
              )
              // You could have an index route for :dbId here if InstanceDetailPage
              // is just a layout and another component shows the main content.
              // index("routes/dashboard.instance-detail-main.page.tsx")
            ]
          )
        ]
      )
      // Remove any previous flat route like "instances/:dbId/restore/" as it's now handled by nesting.
    ]
  ),
] satisfies RouteConfig;