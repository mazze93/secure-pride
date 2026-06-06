/**
 * Tests for package-lock.json changes introduced in this PR.
 *
 * This PR adds vitest@2.1.9 and its dependency graph to the lockfile.
 * These tests validate that the lockfile contains the expected new entries
 * with correct versions, resolved URLs, integrity hashes, and metadata.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const lockfilePath = resolve(import.meta.dirname, "../../package-lock.json");
const lockfile = JSON.parse(readFileSync(lockfilePath, "utf-8")) as {
  name: string;
  version: string;
  lockfileVersion: number;
  requires: boolean;
  packages: Record<
    string,
    {
      version?: string;
      resolved?: string;
      integrity?: string;
      dev?: boolean;
      optional?: boolean;
      license?: string;
      engines?: Record<string, string>;
      dependencies?: Record<string, string>;
      bin?: Record<string, string>;
      funding?: unknown;
      os?: string[];
      cpu?: string[];
    }
  >;
};

// ─── Lockfile Structure ─────────────────────────────────────────────────────

describe("package-lock.json structure", () => {
  it("is lockfileVersion 3", () => {
    expect(lockfile.lockfileVersion).toBe(3);
  });

  it("has correct package name", () => {
    expect(lockfile.name).toBe("securepride-site");
  });

  it("has requires: true", () => {
    expect(lockfile.requires).toBe(true);
  });

  it("contains a packages object", () => {
    expect(lockfile.packages).toBeDefined();
    expect(typeof lockfile.packages).toBe("object");
  });
});

// ─── Root package devDependencies ───────────────────────────────────────────

describe("root package devDependencies", () => {
  const root = lockfile.packages[""];

  it("has vitest in devDependencies", () => {
    expect(root?.devDependencies?.["vitest"]).toBeDefined();
  });

  it("vitest devDependency uses ^ range", () => {
    expect(root?.devDependencies?.["vitest"]).toMatch(/^\^/);
  });
});

// ─── vitest@2.1.9 ───────────────────────────────────────────────────────────

describe("node_modules/vitest", () => {
  const pkg = lockfile.packages["node_modules/vitest"];

  it("is present in lockfile", () => {
    expect(pkg).toBeDefined();
  });

  it("has version 2.1.9", () => {
    expect(pkg?.version).toBe("2.1.9");
  });

  it("is a dev dependency", () => {
    expect(pkg?.dev).toBe(true);
  });

  it("has MIT license", () => {
    expect(pkg?.license).toBe("MIT");
  });

  it("has resolved URL pointing to npm registry", () => {
    expect(pkg?.resolved).toMatch(/^https:\/\/registry\.npmjs\.org\/vitest\//);
  });

  it("has a non-empty integrity hash", () => {
    expect(pkg?.integrity).toBeTruthy();
    expect(pkg?.integrity).toMatch(/^sha512-/);
  });

  it("requires Node >=18 or >=20", () => {
    expect(pkg?.engines?.node).toBe("^18.0.0 || >=20.0.0");
  });

  it("has vitest binary", () => {
    expect(pkg?.bin?.["vitest"]).toBeDefined();
  });

  it("depends on vite-node 2.1.9", () => {
    expect(pkg?.dependencies?.["vite-node"]).toBe("2.1.9");
  });

  it("depends on chai ^5.1.2", () => {
    expect(pkg?.dependencies?.["chai"]).toMatch(/^\^5/);
  });

  it("depends on vite ^5.0.0", () => {
    expect(pkg?.dependencies?.["vite"]).toMatch(/^\^5/);
  });

  it("depends on @vitest/expect 2.1.9", () => {
    expect(pkg?.dependencies?.["@vitest/expect"]).toBe("2.1.9");
  });

  it("depends on @vitest/runner 2.1.9", () => {
    expect(pkg?.dependencies?.["@vitest/runner"]).toBe("2.1.9");
  });

  it("has a funding URL", () => {
    expect(pkg?.funding).toBeDefined();
  });
});

// ─── vite-node@2.1.9 ────────────────────────────────────────────────────────

describe("node_modules/vite-node", () => {
  const pkg = lockfile.packages["node_modules/vite-node"];

  it("is present in lockfile", () => {
    expect(pkg).toBeDefined();
  });

  it("has version 2.1.9", () => {
    expect(pkg?.version).toBe("2.1.9");
  });

  it("is a dev dependency", () => {
    expect(pkg?.dev).toBe(true);
  });

  it("has MIT license", () => {
    expect(pkg?.license).toBe("MIT");
  });

  it("has resolved URL pointing to npm registry", () => {
    expect(pkg?.resolved).toMatch(/^https:\/\/registry\.npmjs\.org\/vite-node\//);
  });

  it("has sha512 integrity hash", () => {
    expect(pkg?.integrity).toMatch(/^sha512-/);
  });

  it("requires Node ^18.0.0 || >=20.0.0", () => {
    expect(pkg?.engines?.node).toBe("^18.0.0 || >=20.0.0");
  });

  it("has vite-node binary", () => {
    expect(pkg?.bin?.["vite-node"]).toBeDefined();
  });

  it("depends on cac ^6.7.14", () => {
    expect(pkg?.dependencies?.["cac"]).toMatch(/^\^6\.7/);
  });

  it("depends on debug ^4.x", () => {
    expect(pkg?.dependencies?.["debug"]).toMatch(/^\^4/);
  });

  it("depends on pathe ^1.x", () => {
    expect(pkg?.dependencies?.["pathe"]).toMatch(/^\^1/);
  });

  it("depends on vite ^5.0.0", () => {
    expect(pkg?.dependencies?.["vite"]).toMatch(/^\^5/);
  });

  it("has a funding URL", () => {
    expect(pkg?.funding).toBeDefined();
  });
});

// ─── cac@6.7.14 ─────────────────────────────────────────────────────────────

describe("node_modules/cac", () => {
  const pkg = lockfile.packages["node_modules/cac"];

  it("is present in lockfile (newly added by this PR)", () => {
    expect(pkg).toBeDefined();
  });

  it("has version 6.7.14", () => {
    expect(pkg?.version).toBe("6.7.14");
  });

  it("is a dev dependency", () => {
    expect(pkg?.dev).toBe(true);
  });

  it("has MIT license", () => {
    expect(pkg?.license).toBe("MIT");
  });

  it("has resolved URL pointing to npm registry", () => {
    expect(pkg?.resolved).toMatch(/^https:\/\/registry\.npmjs\.org\/cac\//);
  });

  it("has sha512 integrity hash", () => {
    expect(pkg?.integrity).toMatch(/^sha512-/);
  });

  it("requires Node >=8", () => {
    expect(pkg?.engines?.node).toBe(">=8");
  });
});

// ─── check-error@2.1.3 ──────────────────────────────────────────────────────

describe("node_modules/check-error", () => {
  const pkg = lockfile.packages["node_modules/check-error"];

  it("is present in lockfile (newly added by this PR)", () => {
    expect(pkg).toBeDefined();
  });

  it("has version 2.1.3", () => {
    expect(pkg?.version).toBe("2.1.3");
  });

  it("is a dev dependency", () => {
    expect(pkg?.dev).toBe(true);
  });

  it("has MIT license", () => {
    expect(pkg?.license).toBe("MIT");
  });

  it("has resolved URL pointing to npm registry", () => {
    expect(pkg?.resolved).toMatch(/^https:\/\/registry\.npmjs\.org\/check-error\//);
  });

  it("has sha512 integrity hash", () => {
    expect(pkg?.integrity).toMatch(/^sha512-/);
  });

  it("requires Node >= 16", () => {
    expect(pkg?.engines?.node).toBe(">= 16");
  });
});

// ─── deep-eql@5.0.2 ─────────────────────────────────────────────────────────

describe("node_modules/deep-eql", () => {
  const pkg = lockfile.packages["node_modules/deep-eql"];

  it("is present in lockfile (newly added by this PR)", () => {
    expect(pkg).toBeDefined();
  });

  it("has version 5.0.2", () => {
    expect(pkg?.version).toBe("5.0.2");
  });

  it("is a dev dependency", () => {
    expect(pkg?.dev).toBe(true);
  });

  it("has MIT license", () => {
    expect(pkg?.license).toBe("MIT");
  });

  it("has resolved URL pointing to npm registry", () => {
    expect(pkg?.resolved).toMatch(/^https:\/\/registry\.npmjs\.org\/deep-eql\//);
  });

  it("has sha512 integrity hash", () => {
    expect(pkg?.integrity).toMatch(/^sha512-/);
  });

  it("requires Node >=6", () => {
    expect(pkg?.engines?.node).toBe(">=6");
  });
});

// ─── loupe@3.2.1 ────────────────────────────────────────────────────────────

describe("node_modules/loupe", () => {
  const pkg = lockfile.packages["node_modules/loupe"];

  it("is present in lockfile (newly added by this PR)", () => {
    expect(pkg).toBeDefined();
  });

  it("has version 3.2.1", () => {
    expect(pkg?.version).toBe("3.2.1");
  });

  it("is a dev dependency", () => {
    expect(pkg?.dev).toBe(true);
  });

  it("has MIT license", () => {
    expect(pkg?.license).toBe("MIT");
  });

  it("has resolved URL pointing to npm registry", () => {
    expect(pkg?.resolved).toMatch(/^https:\/\/registry\.npmjs\.org\/loupe\//);
  });

  it("has sha512 integrity hash", () => {
    expect(pkg?.integrity).toMatch(/^sha512-/);
  });
});

// ─── why-is-node-running@2.3.0 ──────────────────────────────────────────────

describe("node_modules/why-is-node-running", () => {
  const pkg = lockfile.packages["node_modules/why-is-node-running"];

  it("is present in lockfile (newly added by this PR)", () => {
    expect(pkg).toBeDefined();
  });

  it("has version 2.3.0", () => {
    expect(pkg?.version).toBe("2.3.0");
  });

  it("is a dev dependency", () => {
    expect(pkg?.dev).toBe(true);
  });

  it("has MIT license", () => {
    expect(pkg?.license).toBe("MIT");
  });

  it("has resolved URL pointing to npm registry", () => {
    expect(pkg?.resolved).toMatch(/^https:\/\/registry\.npmjs\.org\/why-is-node-running\//);
  });

  it("has sha512 integrity hash", () => {
    expect(pkg?.integrity).toMatch(/^sha512-/);
  });

  it("requires Node >=8", () => {
    expect(pkg?.engines?.node).toBe(">=8");
  });

  it("depends on siginfo and stackback", () => {
    expect(pkg?.dependencies?.["siginfo"]).toBeDefined();
    expect(pkg?.dependencies?.["stackback"]).toBeDefined();
  });

  it("has why-is-node-running binary", () => {
    expect(pkg?.bin?.["why-is-node-running"]).toBeDefined();
  });
});

// ─── vitefu@1.1.3 (restructured) ────────────────────────────────────────────

describe("node_modules/vitefu", () => {
  const pkg = lockfile.packages["node_modules/vitefu"];

  it("is still present after restructuring", () => {
    expect(pkg).toBeDefined();
  });

  it("remains at version 1.1.3", () => {
    expect(pkg?.version).toBe("1.1.3");
  });

  it("is no longer a dev-only dependency (dev flag removed)", () => {
    // This PR removed 'dev: true' from vitefu, making it a non-dev dep
    expect(pkg?.dev).toBeFalsy();
  });

  it("has MIT license", () => {
    expect(pkg?.license).toBe("MIT");
  });
});

// ─── vite-node nested esbuild@0.21.5 ────────────────────────────────────────

describe("node_modules/vite-node/node_modules/esbuild", () => {
  const pkg = lockfile.packages["node_modules/vite-node/node_modules/esbuild"];

  it("is present as a nested dep of vite-node", () => {
    expect(pkg).toBeDefined();
  });

  it("has version 0.21.5", () => {
    expect(pkg?.version).toBe("0.21.5");
  });

  it("is a dev dependency", () => {
    expect(pkg?.dev).toBe(true);
  });

  it("requires Node >=12", () => {
    expect(pkg?.engines?.node).toBe(">=12");
  });

  it("has esbuild binary", () => {
    expect(pkg?.bin?.["esbuild"]).toBeDefined();
  });
});

// ─── vite-node/node_modules/vite@5.4.21 ─────────────────────────────────────

describe("node_modules/vite-node/node_modules/vite", () => {
  const pkg = lockfile.packages["node_modules/vite-node/node_modules/vite"];

  it("is present as a nested dep of vite-node", () => {
    expect(pkg).toBeDefined();
  });

  it("has version 5.4.21", () => {
    expect(pkg?.version).toBe("5.4.21");
  });

  it("is a dev dependency", () => {
    expect(pkg?.dev).toBe(true);
  });

  it("requires Node ^18.0.0 || >=20.0.0", () => {
    expect(pkg?.engines?.node).toBe("^18.0.0 || >=20.0.0");
  });

  it("depends on esbuild ^0.21.3", () => {
    expect(pkg?.dependencies?.["esbuild"]).toMatch(/^\^0\.21/);
  });
});

// ─── vitest nested esbuild@0.21.5 ───────────────────────────────────────────

describe("node_modules/vitest/node_modules/esbuild", () => {
  const pkg = lockfile.packages["node_modules/vitest/node_modules/esbuild"];

  it("is present as a nested dep of vitest", () => {
    expect(pkg).toBeDefined();
  });

  it("has version 0.21.5", () => {
    expect(pkg?.version).toBe("0.21.5");
  });

  it("is a dev dependency", () => {
    expect(pkg?.dev).toBe(true);
  });

  it("shares the same integrity as vite-node's nested esbuild", () => {
    const viteNodeEsbuild =
      lockfile.packages["node_modules/vite-node/node_modules/esbuild"];
    expect(pkg?.integrity).toBe(viteNodeEsbuild?.integrity);
  });
});

// ─── vitest/node_modules/vite@5.4.21 ────────────────────────────────────────

describe("node_modules/vitest/node_modules/vite", () => {
  const pkg = lockfile.packages["node_modules/vitest/node_modules/vite"];

  it("is present as a nested dep of vitest", () => {
    expect(pkg).toBeDefined();
  });

  it("has version 5.4.21", () => {
    expect(pkg?.version).toBe("5.4.21");
  });

  it("shares resolved URL with vite-node/node_modules/vite", () => {
    const viteNodeVite =
      lockfile.packages["node_modules/vite-node/node_modules/vite"];
    expect(pkg?.resolved).toBe(viteNodeVite?.resolved);
  });

  it("shares integrity hash with vite-node/node_modules/vite", () => {
    const viteNodeVite =
      lockfile.packages["node_modules/vite-node/node_modules/vite"];
    expect(pkg?.integrity).toBe(viteNodeVite?.integrity);
  });
});

// ─── Platform-specific esbuild binaries under vite-node ─────────────────────

describe("vite-node nested platform esbuild binaries", () => {
  const platforms = [
    "node_modules/vite-node/node_modules/@esbuild/android-arm",
    "node_modules/vite-node/node_modules/@esbuild/android-arm64",
    "node_modules/vite-node/node_modules/@esbuild/android-x64",
    "node_modules/vite-node/node_modules/@esbuild/darwin-arm64",
    "node_modules/vite-node/node_modules/@esbuild/darwin-x64",
    "node_modules/vite-node/node_modules/@esbuild/linux-x64",
    "node_modules/vite-node/node_modules/@esbuild/win32-x64",
  ] as const;

  for (const platform of platforms) {
    it(`${platform} is present, optional, dev, version 0.21.5`, () => {
      const pkg = lockfile.packages[platform];
      expect(pkg).toBeDefined();
      expect(pkg?.version).toBe("0.21.5");
      expect(pkg?.dev).toBe(true);
      expect(pkg?.optional).toBe(true);
      expect(pkg?.license).toBe("MIT");
    });
  }
});

// ─── Platform-specific esbuild binaries under vitest ────────────────────────

describe("vitest nested platform esbuild binaries", () => {
  const platforms = [
    "node_modules/vitest/node_modules/@esbuild/android-arm",
    "node_modules/vitest/node_modules/@esbuild/linux-x64",
    "node_modules/vitest/node_modules/@esbuild/darwin-arm64",
    "node_modules/vitest/node_modules/@esbuild/win32-x64",
  ] as const;

  for (const platform of platforms) {
    it(`${platform} is present, optional, dev, version 0.21.5`, () => {
      const pkg = lockfile.packages[platform];
      expect(pkg).toBeDefined();
      expect(pkg?.version).toBe("0.21.5");
      expect(pkg?.dev).toBe(true);
      expect(pkg?.optional).toBe(true);
    });
  }
});

// ─── License compliance: all newly added packages are MIT ───────────────────

describe("license compliance for new dependencies", () => {
  const newPackages = [
    "node_modules/cac",
    "node_modules/check-error",
    "node_modules/deep-eql",
    "node_modules/loupe",
    "node_modules/vite-node",
    "node_modules/vitest",
    "node_modules/why-is-node-running",
  ] as const;

  for (const pkgName of newPackages) {
    it(`${pkgName} is MIT licensed`, () => {
      expect(lockfile.packages[pkgName]?.license).toBe("MIT");
    });
  }
});

// ─── Integrity hash uniqueness ───────────────────────────────────────────────

describe("integrity hash uniqueness for new direct dependencies", () => {
  const topLevelPackages = [
    "node_modules/cac",
    "node_modules/check-error",
    "node_modules/deep-eql",
    "node_modules/loupe",
    "node_modules/vite-node",
    "node_modules/vitest",
    "node_modules/why-is-node-running",
  ] as const;

  it("each new top-level dependency has a unique integrity hash", () => {
    const hashes = topLevelPackages.map(
      (p) => lockfile.packages[p]?.integrity
    );
    const unique = new Set(hashes);
    // All hashes must be defined and all must be distinct
    hashes.forEach((h) => expect(h).toBeTruthy());
    expect(unique.size).toBe(topLevelPackages.length);
  });
});

// ─── Regression: existing packages not removed ──────────────────────────────

describe("regression: pre-existing dependencies still present", () => {
  it("node_modules/web-namespaces is still present", () => {
    expect(lockfile.packages["node_modules/web-namespaces"]).toBeDefined();
  });

  it("node_modules/webidl-conversions is still present", () => {
    expect(lockfile.packages["node_modules/webidl-conversions"]).toBeDefined();
  });

  it("node_modules/whatwg-url is still present", () => {
    expect(lockfile.packages["node_modules/whatwg-url"]).toBeDefined();
  });

  it("node_modules/which-pm-runs is still present", () => {
    expect(lockfile.packages["node_modules/which-pm-runs"]).toBeDefined();
  });

  it("node_modules/vitefu is still present", () => {
    expect(lockfile.packages["node_modules/vitefu"]).toBeDefined();
  });
});

// ─── Boundary: absent packages ───────────────────────────────────────────────

describe("packages that should NOT be present at top level", () => {
  it("cac is not a nested dep of vitest (it lives at top level only)", () => {
    // cac is pulled in by vite-node which vitest depends on; the top-level
    // entry is the canonical one — no vitest-scoped cac should exist
    expect(
      lockfile.packages["node_modules/vitest/node_modules/cac"]
    ).toBeUndefined();
  });
});