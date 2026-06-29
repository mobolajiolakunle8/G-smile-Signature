export function getAssetUrl(path: string): string {
  // Removes leading slash to make it relative if needed, 
  // or handles base URL for deployments on subfolders.
  const baseUrl = (import.meta as any).env?.BASE_URL || "/";
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  
  if (baseUrl === "/") return `/${cleanPath}`;
  return `${baseUrl}${cleanPath}`;
}
