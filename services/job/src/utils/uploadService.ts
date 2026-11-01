export function uploadServiceUrl() {
  const configured = process.env.UPLOAD_SERVICE || "http://localhost:3001";
  const origin = /^https?:\/\//i.test(configured) ? configured : `http://${configured}`;
  return `${origin.replace(/\/+$/, "")}/api/utils/upload`;
}

// utils only accepts uploads from services that present this key
export function uploadServiceConfig() {
  return { headers: { "x-internal-key": process.env.INTERNAL_API_KEY ?? "" } };
}
