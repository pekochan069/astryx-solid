import { VisuallyHiddenDocs } from "./routes/components.visually-hidden";
import { CoreSubstrate } from "./routes/core-substrate";
import { RouteComponent as Index } from "./routes/index";

export const prerenderRoutes = [
  { path: "/", Component: Index },
  { path: "/components/visually-hidden", Component: VisuallyHiddenDocs },
  { path: "/core-substrate", Component: CoreSubstrate },
] as const;
