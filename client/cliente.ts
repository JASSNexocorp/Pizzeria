// ── DERIVAR LA PDA ────────────────────────────────────────────────────
// Recrea la misma dirección que el contrato usa on-chain.
// Las seeds deben ser IDÉNTICAS a las del lib.rs: [b"pizzeria", dueno]
async function getPizzeriaPDA() {
  const [pda] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("pizzeria"), // seed fija — igual que en lib.rs
      pg.wallet.publicKey.toBuffer(), // seed dinámica — tu wallet
    ],
    pg.program.programId, // ID del programa deployado
  );
  return pda;
}

// ── CREATE — Crear la pizzería ─────────────────────────────────────────
async function crearPizzeria(nombre: string) {
  const pizzeriaPDA = await getPizzeriaPDA();
  console.log(`\n🏗️  Creando pizzería "${nombre}"...`);

  const tx = await pg.program.methods
    .crearPizzeria(nombre)
    .accounts({
      dueno: pg.wallet.publicKey,
      pizzeria: pizzeriaPDA,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc(); // Playground firma automáticamente con pg.wallet

  console.log(`✅ Pizzería creada! TX: ${tx}`);
}

// ── CREATE — Agregar pizza ─────────────────────────────────────────────
async function agregarPizza(
  nombre: string,
  ingredientes: string[],
  precio: number,
) {
  const pizzeriaPDA = await getPizzeriaPDA();
  console.log(`\n🍕 Agregando pizza "${nombre}"...`);

  const tx = await pg.program.methods
    .agregarPizza(nombre, ingredientes, new BN(precio))
    .accounts({
      dueno: pg.wallet.publicKey,
      pizzeria: pizzeriaPDA,
    })
    .rpc();

  console.log(`✅ Pizza agregada! TX: ${tx}`);
}

// ── UPDATE — Actualizar pizza ──────────────────────────────────────────
async function actualizarPizza(
  nombre: string,
  nuevoPrecio: number,
  nuevosIngredientes: string[],
  disponible: boolean,
) {
  const pizzeriaPDA = await getPizzeriaPDA();
  console.log(`\n✏️  Actualizando pizza "${nombre}"...`);

  const tx = await pg.program.methods
    .actualizarPizza(
      nombre,
      new BN(nuevoPrecio),
      nuevosIngredientes,
      disponible,
    )
    .accounts({
      dueno: pg.wallet.publicKey,
      pizzeria: pizzeriaPDA,
    })
    .rpc();

  console.log(`✅ Pizza actualizada! TX: ${tx}`);
}

// ── DELETE — Eliminar pizza ────────────────────────────────────────────
async function eliminarPizza(nombre: string) {
  const pizzeriaPDA = await getPizzeriaPDA();
  console.log(`\n🗑️  Eliminando pizza "${nombre}"...`);

  const tx = await pg.program.methods
    .eliminarPizza(nombre)
    .accounts({
      dueno: pg.wallet.publicKey,
      pizzeria: pizzeriaPDA,
    })
    .rpc();

  console.log(`✅ Pizza eliminada! TX: ${tx}`);
}

// ── READ — Ver el menú ─────────────────────────────────────────────────
async function verMenu() {
  const pizzeriaPDA = await getPizzeriaPDA();
  console.log(`\n📋 Leyendo menú...`);

  // fetch() lee y deserializa la cuenta directamente — NO gasta SOL
  const cuenta = await pg.program.account.pizzeria.fetch(pizzeriaPDA);

  console.log(`\n🏠 Pizzería: "${cuenta.nombre}"`);
  console.log(`👤 Dueño: ${cuenta.dueno.toBase58()}`);
  console.log(`🍕 Pizzas (${cuenta.pizzas.length}):`);

  cuenta.pizzas.forEach((pizza: any, i: number) => {
    console.log(`\n  [${i + 1}] ${pizza.nombre} — $${pizza.precio.toString()}`);
    console.log(`      Ingredientes: ${pizza.ingredientes.join(", ")}`);
    console.log(
      `      ${pizza.disponible ? "✅ disponible" : "❌ no disponible"}`,
    );
  });
}

// =====================================================================
//  FLUJO PRINCIPAL — corre todo el CRUD de una vez
// =====================================================================
async function main() {
  console.log("=======================================================");
  console.log("  🍕 PIZZERÍA SOLANA — Solana Playground");
  console.log("=======================================================");
  console.log(`\n👛 Wallet: ${pg.wallet.publicKey.toBase58()}`);

  // PASO 1 — Crear la pizzería (solo la primera vez)
  // Si ya la creaste antes, comentá esta línea para no tirar error
  await crearPizzeria("La Napolitana");

  // PASO 2 — Agregar pizzas
  await agregarPizza("Margherita", ["tomate", "mozzarella", "albahaca"], 1200);
  await agregarPizza(
    "Cuatro Quesos",
    ["mozzarella", "parmesano", "roquefort", "brie"],
    1500,
  );
  await agregarPizza(
    "Napolitana",
    ["tomate", "mozzarella", "anchoas", "aceitunas"],
    1400,
  );

  // PASO 3 — Leer el menú
  await verMenu();

  // PASO 4 — Actualizar la Margherita
  await actualizarPizza(
    "Margherita",
    1350,
    ["tomate cherry", "mozzarella", "albahaca"],
    true,
  );

  // PASO 5 — Eliminar la Napolitana
  await eliminarPizza("Napolitana");

  // PASO 6 — Ver el menú final
  await verMenu();

  console.log("\n\n🎉 ¡CRUD completo!");
  console.log(`🔍 Ver TXs: https://explorer.solana.com/?cluster=devnet`);
}

main();
