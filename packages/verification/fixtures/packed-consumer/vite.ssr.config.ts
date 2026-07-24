import solid from "vite-plugin-solid";

export default { plugins: [solid({ ssr: true, solid: { hydratable: true } })] };
