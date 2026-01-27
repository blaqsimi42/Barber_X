export function getApiBase() {
  const base =
    import.meta.env.VITE_API_URL ||
    window.location.origin ||
    "http://localhost:5000";

  const isDev = import.meta.env.MODE === "development";
  const isProd = import.meta.env.MODE === "production";

  if (isDev) {
    console.log(
      `%c🌐 [DEV MODE] → API Base: ${base || "via proxy (/api)"}`,
      "color:#22d3ee; font-weight:bold;",
    );
  } else if (isProd) {
    console.log(
      `%c🚀 [PRODUCTION] → API Base: ${base}`,
      "color:#16a34a; font-weight:bold;",
    );
  }

  return base;
}
