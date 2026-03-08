# 🍕 Pizzería Solana — CRUD con Anchor

Programa on-chain para gestionar el menú de una pizzería. Construido con Anchor en Solana devnet.

🔗 Repositorio: https://github.com/JASSNexocorp/Pizzeria
🔗 Contrato deployado: https://explorer.solana.com/tx/63Fo6aqrvLA1VdtGc4NBNXxZ8Srqtvq6hfECFhXEcwamrxanHGbNG2z6txE5yTVHxScaAttkTmYyBoYEgeeeuUT3?cluster=devnet

---

## ▶️ Probarlo en Solana Playground

1. Abrí **[beta.solpg.io](https://beta.solpg.io)**
2. Clic en el ícono de GitHub (panel izquierdo) → pegá `https://github.com/JASSNexocorp/Pizzeria` → Import
3. Clic **Build** → **Deploy**
4. Pestaña **Client** → abrí `cliente_playground.ts` → **Run**

> ⚠️ `crearPizzeria()` solo se llama **una vez** por wallet. En ejecuciones siguientes, comentá esa línea.

---

## 📖 CRUD

|        | Instrucción        | Qué hace                                         |
| ------ | ------------------ | ------------------------------------------------ |
| Create | `crear_pizzeria`   | Crea la cuenta de la pizzería — 1 vez por wallet |
| Create | `agregar_pizza`    | Agrega una pizza al menú                         |
| Read   | `ver_menu`         | Muestra las pizzas (no gasta SOL)                |
| Update | `actualizar_pizza` | Modifica precio, ingredientes o disponibilidad   |
| Delete | `eliminar_pizza`   | Elimina una pizza por nombre                     |
