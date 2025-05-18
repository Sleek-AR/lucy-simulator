// js/phone-ui/phone-ui.js

export function createPhoneUI({ onCall }) {
  const scene = document.querySelector("a-scene");
  if (document.getElementById("virtualPhone")) return;

  const phone = document.createElement("a-entity");
  phone.setAttribute("id", "virtualPhone");
  phone.setAttribute("visible", false);
  phone.setAttribute("position", "0 0 -2");

  // Display
  const display = document.createElement("a-text");
  display.setAttribute("id", "phoneDisplay");
  display.setAttribute("value", "");
  display.setAttribute("align", "center");
  display.setAttribute("color", "#000");
  display.setAttribute("width", "2");
  display.setAttribute("position", "0 1 0");
  phone.appendChild(display);

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
  let enteredNumber = "";

  function updateDisplay() {
    display.setAttribute("value", enteredNumber);
  }

  digits.forEach((digit, i) => {
    const btn = document.createElement("a-plane");
    btn.setAttribute("width", "0.4");
    btn.setAttribute("height", "0.4");
    btn.setAttribute("color", "#00BFFF");
    btn.setAttribute("class", "clickable");

    const x = (i % 3 - 1) * 0.5;
    const y = -0.5 - Math.floor(i / 3) * 0.5;
    btn.setAttribute("position", `${x} ${y} 0`);

    const txt = document.createElement("a-text");
    txt.setAttribute("value", digit);
    txt.setAttribute("align", "center");
    txt.setAttribute("color", "#fff");
    txt.setAttribute("position", "0 0 0.01");

    btn.appendChild(txt);
    btn.addEventListener("click", () => {
      enteredNumber += digit;
      updateDisplay();
    });

    phone.appendChild(btn);
  });

  // Anruf-Button
  const callBtn = document.createElement("a-plane");
  callBtn.setAttribute("width", "1.4");
  callBtn.setAttribute("height", "0.4");
  callBtn.setAttribute("color", "#28a745");
  callBtn.setAttribute("position", `0 -2.2 0`);
  callBtn.setAttribute("class", "clickable");

  const callText = document.createElement("a-text");
  callText.setAttribute("value", "📞 Anrufen");
  callText.setAttribute("align", "center");
  callText.setAttribute("color", "#fff");
  callText.setAttribute("position", "0 0 0.01");
  callBtn.appendChild(callText);

  callBtn.addEventListener("click", () => {
    if (enteredNumber.length > 0) {
      onCall(enteredNumber);
    }
  });

  phone.appendChild(callBtn);
  scene.appendChild(phone);

  // global verfügbar zum Ein-/Ausblenden
  window.togglePhoneUI = function (show) {
    phone.setAttribute("visible", show);
    if (!show) enteredNumber = "";
    updateDisplay();
  };
}
