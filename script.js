const CONFIG = {
  discordInvite: "https://discord.gg/SEU-LINK"
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

let cart = JSON.parse(localStorage.getItem("gamamc-cart-v2") || "[]");

const el = id => document.getElementById(id);
const overlay = el("overlay");
const cartDrawer = el("cart");
const cartList = el("cartList");
const cartEmpty = el("cartEmpty");
const cartTotal = el("cartTotal");
const cartCount = el("cartCount");
const checkout = el("checkout");
const orderBox = el("orderBox");
const toast = el("toast");

function hasDiscordConfigured() {
  return CONFIG.discordInvite && !CONFIG.discordInvite.includes("SEU-LINK");
}

document.querySelectorAll("[data-discord]").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    if (!hasDiscordConfigured()) {
      showToast("Configure o link oficial do Discord em script.js.");
      return;
    }
    window.open(CONFIG.discordInvite, "_blank", "noopener");
  });
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.gamaToast);
  window.gamaToast = setTimeout(() => toast.classList.remove("show"), 2400);
}

function saveCart() {
  localStorage.setItem("gamamc-cart-v2", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  cartList.innerHTML = "";
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  cartCount.textContent = cart.length;
  cartTotal.textContent = currency.format(total);
  cartEmpty.style.display = cart.length ? "none" : "block";
  el("checkoutOpen").disabled = !cart.length;
  el("checkoutOpen").style.opacity = cart.length ? "1" : ".45";

  cart.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div>
        <b>${item.name}</b>
        <small>${item.cycle}</small>
      </div>
      <div class="right">
        <b>${currency.format(item.price)}</b>
        <button type="button" data-remove="${item.id}">REMOVER</button>
      </div>
    `;
    cartList.appendChild(div);
  });

  cartList.querySelectorAll("[data-remove]").forEach(button => {
    button.addEventListener("click", () => {
      cart = cart.filter(item => item.id !== button.dataset.remove);
      saveCart();
    });
  });

  updateOrderBox();
}

document.querySelectorAll(".add-product").forEach(button => {
  button.addEventListener("click", () => {
    const item = {
      id: button.dataset.id,
      name: button.dataset.name,
      price: Number(button.dataset.price),
      cycle: button.dataset.cycle
    };

    const exists = cart.some(current => current.id === item.id);
    if (!exists) {
      cart.push(item);
      saveCart();
      showToast(`${item.name} (${item.cycle}) adicionado.`);
    } else {
      showToast("Esta opção já está no carrinho.");
    }
    openCart();
  });
});

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  overlay.classList.add("show");
  document.body.classList.add("lock");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  if (!checkout.classList.contains("show")) {
    overlay.classList.remove("show");
    document.body.classList.remove("lock");
  }
}

function openCheckout() {
  if (!cart.length) return;
  closeCart();
  checkout.classList.add("show");
  checkout.setAttribute("aria-hidden", "false");
  overlay.classList.add("show");
  document.body.classList.add("lock");
  updateOrderBox();
}

function closeCheckout() {
  checkout.classList.remove("show");
  checkout.setAttribute("aria-hidden", "true");
  if (!cartDrawer.classList.contains("open")) {
    overlay.classList.remove("show");
    document.body.classList.remove("lock");
  }
}

el("cartOpen").addEventListener("click", openCart);
el("cartClose").addEventListener("click", closeCart);
el("checkoutOpen").addEventListener("click", openCheckout);
el("checkoutClose").addEventListener("click", closeCheckout);
overlay.addEventListener("click", () => {
  closeCart();
  closeCheckout();
});

function updateOrderBox() {
  if (!orderBox) return;
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  orderBox.innerHTML = cart.length
    ? cart.map(item => `<div><b>${item.name}</b> • ${item.cycle} — ${currency.format(item.price)}</div>`).join("")
      + `<div style="border-top:1px solid rgba(255,255,255,.09);margin-top:8px;padding-top:8px"><b>Total: ${currency.format(total)}</b></div>`
    : "Carrinho vazio.";
}

function orderCode() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `GAMA-${date}-${random}`;
}

el("checkoutForm").addEventListener("submit", async event => {
  event.preventDefault();
  if (!cart.length) return;

  const nick = el("minecraftNick").value.trim();
  const discord = el("discordUser").value.trim();
  const email = el("email").value.trim();
  const code = orderCode();
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const lines = cart.map(item =>
    `• ${item.name} — ${item.cycle} — ${currency.format(item.price)}`
  ).join("\n");

  const text = [
    "🟧 NOVO PEDIDO — LOJA GAMAMC",
    `Código: ${code}`,
    "",
    `Minecraft: ${nick}`,
    `Discord: ${discord}`,
    email ? `E-mail: ${email}` : null,
    "",
    "Itens:",
    lines,
    "",
    `TOTAL: ${currency.format(total)}`,
    "",
    "Pedido gerado pelo site GamaMC. Finalização e pagamento devem ocorrer no ticket oficial."
  ].filter(Boolean).join("\n");

  try {
    await navigator.clipboard.writeText(text);
    showToast(`Pedido ${code} copiado.`);
  } catch {
    showToast(`Pedido ${code} gerado.`);
  }

  localStorage.setItem("gamamc-last-order", JSON.stringify({
    code,
    nick,
    discord,
    email,
    items: cart,
    total,
    createdAt: new Date().toISOString()
  }));

  if (hasDiscordConfigured()) {
    setTimeout(() => window.open(CONFIG.discordInvite, "_blank", "noopener"), 450);
  } else {
    setTimeout(() => showToast("Pedido copiado. Configure o link do Discord em script.js."), 500);
  }
});

const menuBtn = el("menuBtn");
const nav = el("nav");
menuBtn.addEventListener("click", () => nav.classList.toggle("open"));
nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

renderCart();
