import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("login", "routes/login.page.tsx"),
  route("register", "routes/register.page.tsx"),

  route(
    "dashboard",
    "routes/dashboard.layout.tsx", 
    [
      index("routes/dashboard._index.tsx"), 

      route(
        "instances",  
        "routes/dashboard.instances.page.tsx", 
        [
          route(
            ":dbId",   
            "routes/dashboard.instance-detail.page.tsx", 
            [
              route(
                "restore",          
                "routes/dashboard.restore.page.tsx"
              )
            ]
          )
        ]
      ),
      route(
        "roles", 
        "routes/dashboard.roles.page.tsx", 
        [
          route(
            ":dbId",     
            "routes/dashboard.role-detail.page.tsx"
          )
        ]
      )
     
    ]
  ),
] satisfies RouteConfig;