import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

interface GenerateOptions {
  rootDir: string;
  format: boolean;
}

export function validatePageName(name: string): string[] {
  const errors: string[] = [];
  if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
    errors.push(
      `"${name}" is not a valid PascalCase page name (e.g. "TodoList")`,
    );
  }
  return errors;
}

export function toKebabCase(name: string): string {
  return name
    .replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)
    .replace(/^-/, "");
}

const pageComponentTemplate = (
  name: string,
): string => `import React from "react";
import Layout from "../../components/Layout";
import type { ${name}RouteData } from "../../../shared/types";

const ${name}: React.FC<{ data: ${name}RouteData }> = ({ data }) => {
  return (
    <Layout title="${name}" currentPath={data?.currentPath}>
      <p className="text-sm text-slate-600">Hello from ${name}!</p>
    </Layout>
  );
};

export default ${name};
`;

const clientEntryTemplate = (
  name: string,
): string => `import { createApp } from "../../../lib/client/createApp";
import ${name} from "./${name}";

createApp({ Page: ${name} });
`;

const sharedTypeTemplate = (name: string): string => `
export interface ${name}RouteData {
  currentPath?: string;
}
`;

const routeRegistrationTemplate = (name: string): string => `
app.use(
  createDynamicRoute<${name}RouteData>({
    path: "/${toKebabCase(name)}",
    id: "${name}",
    component: ${name},
    generateMetatag: () => ({ title: "${name}", description: "${name} page" }),
  }),
);
`;

export function generatePage(name: string, options: GenerateOptions): void {
  const { rootDir } = options;
  const errors = validatePageName(name);
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  const pageDir = path.join(rootDir, "src/client/pages", name);
  if (fs.existsSync(pageDir)) {
    throw new Error(`Page "${name}" already exists at ${pageDir}`);
  }

  fs.mkdirSync(pageDir, { recursive: true });
  fs.writeFileSync(
    path.join(pageDir, `${name}.tsx`),
    pageComponentTemplate(name),
  );
  fs.writeFileSync(path.join(pageDir, "client.ts"), clientEntryTemplate(name));

  const typesPath = path.join(rootDir, "src/shared/types.ts");
  insertAtMarker(typesPath, "// GENERATE:TYPE", sharedTypeTemplate(name));

  const serverPath = path.join(rootDir, "src/server/server.tsx");
  insertAtMarker(
    serverPath,
    "// GENERATE:IMPORT",
    `import ${name} from "../client/pages/${name}/${name}";\nimport type { ${name}RouteData } from "../shared/types";\n`,
  );
  insertAtMarker(
    serverPath,
    "// GENERATE:ROUTE",
    routeRegistrationTemplate(name),
  );

  if (options.format) {
    execSync(
      `yarn prettier --write "${pageDir}" "${typesPath}" "${serverPath}"`,
      {
        cwd: rootDir,
        stdio: "inherit",
      },
    );
  }
}

function insertAtMarker(
  filePath: string,
  marker: string,
  content: string,
): void {
  const source = fs.readFileSync(filePath, "utf8");
  if (!source.includes(marker)) {
    throw new Error(`Marker "${marker}" not found in ${filePath}`);
  }
  fs.writeFileSync(filePath, source.replace(marker, `${content}\n${marker}`));
}

function main(): void {
  const name = process.argv[2];
  if (!name) {
    console.error(
      "Usage: yarn generate:page <Name>\nExample: yarn generate:page TodoList",
    );
    process.exit(1);
  }
  try {
    generatePage(name, { rootDir: process.cwd(), format: true });
    console.log(`Page "${name}" created.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
