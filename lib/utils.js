export function cn(...partes) {
  return partes
    .flat(Infinity)
    .filter((parte) => typeof parte === "string" && parte.trim() !== "")
    .join(" ");
}
