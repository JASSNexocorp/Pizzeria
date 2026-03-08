# 🍕 Pizzería Solana — CRUD con Anchor

Programa on-chain para gestionar el menú de una pizzería. Construido con Anchor en Solana devnet.

🔗 Repositorio: https://github.com/JASSNexocorp/Pizzeria

---

## ▶️ Probarlo ahora

1. Abrí **[beta.solpg.io](https://beta.solpg.io)** y creá una wallet (botón abajo a la izquierda)
2. Pegá `lib.rs` en `src/lib.rs`
3. Clic **Build** → **Deploy** (pedí airdrop si no tenés SOL de devnet)
4. Pestaña **Client** → pegá `cliente_playground.ts` → **Run**

> ⚠️ `crearPizzeria()` solo se llama **una vez** por wallet. En ejecuciones siguientes, comentá esa línea.

---

## 📁 Archivos

| Archivo                 | Para qué                                               |
| ----------------------- | ------------------------------------------------------ |
| `lib.rs`                | El contrato — va en `src/lib.rs` de Playground         |
| `cliente_playground.ts` | El cliente — va en la pestaña **Client** de Playground |
| `cliente.ts`            | Versión alternativa para correr local con Node.js      |

---

## 📖 CRUD

|        | Instrucción        | Qué hace                                          |
| ------ | ------------------ | ------------------------------------------------- |
| Create | `crear_pizzeria`   | Crea la cuenta de la pizzería — 1 vez por wallet  |
| Create | `agregar_pizza`    | Agrega una pizza al menú                          |
| Read   | `ver_menu`         | Lee la cuenta y muestra las pizzas (no gasta SOL) |
| Update | `actualizar_pizza` | Modifica precio, ingredientes o disponibilidad    |
| Delete | `eliminar_pizza`   | Elimina una pizza por nombre                      |
