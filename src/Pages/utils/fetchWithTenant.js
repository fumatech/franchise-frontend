export const fetchWithTenant = (url, options = {}) => {
  const tenantDbName = sessionStorage.getItem("tenantDbName"); // ✅ Now will work
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "X-TenantID": tenantDbName || "fuma_test1", // fallback to default
      "Content-Type": "application/json",
    },
    credentials: "include", // for cookies/session
  });
};
