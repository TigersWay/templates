function getDebugInfo() {
  device = "Mobile";
  if (window.innerWidth >=  560) device = "Phones (SM)";
  if (window.innerWidth >=  768) device = "Tablet (MD)";
  if (window.innerWidth >=  992) device = "Desktop (LG)";
  if (window.innerWidth >= 1140) device = "Wide (XL)";

  document.getElementById("debug").innerHTML =
    device + " : " + window.innerWidth + "x" + window.innerHeight;
}
window.addEventListener("resize", function() {
    getDebugInfo();
  },
  false
);

getDebugInfo();
