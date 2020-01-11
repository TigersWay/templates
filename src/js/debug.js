function getDebugInfo() {
  device = "Mobile";
  if (window.innerWidth >= 640) device = "Tablet (SM)";
  if (window.innerWidth >= 768) device = "Labtop (MD)";
  if (window.innerWidth >= 1024) device = "Desktop (LG)";
  if (window.innerWidth >= 1280) device = "Wide (XL)";

  document.getElementById("debug").innerHTML =
    device + " : " + window.innerWidth + "x" + window.innerHeight;
}
window.addEventListener("resize", function() {
    getDebugInfo();
  },
  false
);

getDebugInfo();
