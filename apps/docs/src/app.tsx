import { prerenderRoutes } from "./prerender-routes";

export function createDocsApp(path: string) {
  const Component =
    prerenderRoutes.find((route) => route.path === path)?.Component ?? prerenderRoutes[0].Component;
  return <Component />;
}
