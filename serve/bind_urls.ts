const enum Family {
  IPv4 = "IPv4",
}

const enum AllInterfaces {
  IPv4 = "0.0.0.0",
  IPv6 = "::",
}

interface BindInterface {
  family: string;
  address: string;
}

export function bindUrls(
  hostname: string,
  port: number,
  interfaces: readonly BindInterface[],
): string[] {
  if (hostname !== AllInterfaces.IPv4 && hostname !== AllInterfaces.IPv6) {
    return [`http://${hostname}:${port}`];
  }
  const urls = [`http://localhost:${port}`];
  const seen = new Set<string>();
  for (const iface of interfaces) {
    if (iface.family !== Family.IPv4) {
      continue;
    }
    const { address } = iface;
    if (
      address.startsWith("127.") || address.startsWith("169.254.") ||
      seen.has(address)
    ) {
      continue;
    }
    seen.add(address);
    urls.push(`http://${address}:${port}`);
  }
  return urls;
}

export function grantedNetworkInterfaces(): BindInterface[] {
  try {
    if (
      Deno.permissions.querySync({
        name: "sys",
        kind: "networkInterfaces",
      }).state !== "granted"
    ) {
      return [];
    }
    return Deno.networkInterfaces();
  } catch {
    return [];
  }
}
