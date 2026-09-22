const MODULE_ID = "lipatos-player-currency-lock";
const CURRENCY_KEYS = ["pp", "gp", "ep", "sp", "cp"];
const MESSAGE = "Изменять валюту вручную может только ГМ.";

function isCurrencyField(el) {
  if (!(el instanceof HTMLElement)) return false;

  const name = String(el.getAttribute?.("name") ?? "").toLowerCase();
  const dataPath = String(el.dataset?.path ?? "").toLowerCase();
  const dataProperty = String(el.dataset?.property ?? "").toLowerCase();
  const dataCurrency = String(el.dataset?.currency ?? "").toLowerCase();

  return (
    name.includes("system.currency.") ||
    dataPath.includes("system.currency.") ||
    dataProperty.includes("system.currency.") ||
    CURRENCY_KEYS.includes(dataCurrency)
  );
}

function blockCurrencyEdit(event) {
  if (game.user.isGM) return;
  if (!isCurrencyField(event.target)) return;

  event.preventDefault();
  event.stopImmediatePropagation();

  if (event.type !== "wheel") {
    ui.notifications.warn(MESSAGE);
  }
}

Hooks.once("ready", () => {
  if (game.system.id !== "dnd5e" || game.user.isGM) return;

  // Не используем readonly/disabled: D&D5e визуально затемняет такие поля.
  // Вместо этого блокируется только ручное взаимодействие игрока в браузере.
  // Штатные обновления документов, получение и передача валюты продолжают работать.
  document.addEventListener("beforeinput", blockCurrencyEdit, true);
  document.addEventListener("input", blockCurrencyEdit, true);
  document.addEventListener("change", blockCurrencyEdit, true);
  document.addEventListener("paste", blockCurrencyEdit, true);
  document.addEventListener("drop", blockCurrencyEdit, true);
  document.addEventListener("wheel", blockCurrencyEdit, { capture: true, passive: false });

  document.addEventListener("keydown", event => {
    if (game.user.isGM || !isCurrencyField(event.target)) return;

    const allowed = [
      "Tab", "Shift", "Control", "Alt", "Meta",
      "ArrowLeft", "ArrowRight", "Home", "End"
    ];

    if (!allowed.includes(event.key)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      ui.notifications.warn(MESSAGE);
    }
  }, true);

  console.log(`${MODULE_ID} | Manual currency editing locked without readonly/disabled styling.`);
});
