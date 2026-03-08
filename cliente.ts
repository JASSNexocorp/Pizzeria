import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, BN, Program, web3 } from "@coral-xyz/anchor";

// Conectamos a devnet (red de pruebas de Solana, tokens sin valor real)
const connection = new web3.Connection(
  "https://api.devnet.solana.com",
  "confirmed",
);

// Generamos una wallet de prueba (keypair = par de claves pública/privada)
// En producción cargarías esto desde un archivo o variable de entorno
const wallet = web3.Keypair.generate();

// El Provider conecta wallet + red y firma las transacciones
const provider = new AnchorProvider(connection, new anchor.Wallet(wallet), {
  commitment: "confirmed",
});

// ID del programa — debe coincidir con `declare_id!` en lib.rs
const PROGRAM_ID = new web3.PublicKey(
  "TuProgramIDAquiCuandoHagasAnchorBuild11111111",
);

// ── FUNCIÓN PARA DERIVAR LA PDA ───────────────────────────────────────
// Esta función recrea la misma dirección PDA que el programa usa on-chain.
// Las semillas deben ser EXACTAMENTE las mismas que en `seeds = [...]` de lib.rs.
async function getPizzeriaPDA(
  duenoPubkey: web3.PublicKey,
): Promise<[web3.PublicKey, number]> {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("pizzeria"), // seed fija: el string "pizzeria" como bytes
      duenoPubkey.toBuffer(), // seed dinámica: la clave pública del dueño
    ],
    PROGRAM_ID,
  );
}

// ── FUNCIONES CRUD ────────────────────────────────────────────────────

// CREATE — Crear la pizzería
async function crearPizzeria(
  program: any,
  dueno: web3.Keypair,
  nombre: string,
) {
  const [pizzeriaPDA] = await getPizzeriaPDA(dueno.publicKey);

  console.log(`\n🏗️  Creando pizzería "${nombre}"...`);
  console.log(`   PDA: ${pizzeriaPDA.toBase58()}`);

  const tx = await program.methods
    .crearPizzeria(nombre) // llama a la instrucción `crear_pizzeria` de lib.rs
    .accounts({
      dueno: dueno.publicKey,
      pizzeria: pizzeriaPDA,
      systemProgram: web3.SystemProgram.programId,
    })
    .signers([dueno]) // el dueño firma la transacción
    .rpc(); // .rpc() envía la tx a la red y devuelve el hash

  console.log(`   ✅ TX: ${tx}`);
  return pizzeriaPDA;
}

// CREATE — Agregar una pizza al menú
async function agregarPizza(
  program: any,
  dueno: web3.Keypair,
  pizzeriaPDA: web3.PublicKey,
  nombre: string,
  ingredientes: string[],
  precio: number,
) {
  console.log(`\n🍕 Agregando pizza "${nombre}"...`);

  const tx = await program.methods
    .agregarPizza(
      nombre,
      ingredientes,
      new BN(precio), // `BN` = Big Number, necesario para u64 en el cliente TS
    )
    .accounts({
      dueno: dueno.publicKey,
      pizzeria: pizzeriaPDA,
    })
    .signers([dueno])
    .rpc();

  console.log(`   ✅ TX: ${tx}`);
}

// UPDATE — Actualizar una pizza existente
async function actualizarPizza(
  program: any,
  dueno: web3.Keypair,
  pizzeriaPDA: web3.PublicKey,
  nombre: string,
  nuevoPrecio: number,
  nuevosIngredientes: string[],
  disponible: boolean,
) {
  console.log(`\n✏️  Actualizando pizza "${nombre}"...`);

  const tx = await program.methods
    .actualizarPizza(
      nombre,
      new BN(nuevoPrecio),
      nuevosIngredientes,
      disponible,
    )
    .accounts({
      dueno: dueno.publicKey,
      pizzeria: pizzeriaPDA,
    })
    .signers([dueno])
    .rpc();

  console.log(`   ✅ TX: ${tx}`);
}

// DELETE — Eliminar una pizza del menú
async function eliminarPizza(
  program: any,
  dueno: web3.Keypair,
  pizzeriaPDA: web3.PublicKey,
  nombre: string,
) {
  console.log(`\n🗑️  Eliminando pizza "${nombre}"...`);

  const tx = await program.methods
    .eliminarPizza(nombre)
    .accounts({
      dueno: dueno.publicKey,
      pizzeria: pizzeriaPDA,
    })
    .signers([dueno])
    .rpc();

  console.log(`   ✅ TX: ${tx}`);
}

// READ — Leer el estado de la cuenta directamente (sin gastar SOL)
// Esta es la forma real de "leer" datos on-chain: simplemente fetch de la cuenta.
async function verMenu(program: any, pizzeriaPDA: web3.PublicKey) {
  console.log(`\n📋 Leyendo menú desde la cuenta...`);

  // `fetch` lee y deserializa automáticamente la cuenta Pizzeria
  const cuenta = await program.account.pizzeria.fetch(pizzeriaPDA);

  console.log(`\n   🏠 Pizzería: ${cuenta.nombre}`);
  console.log(`   👤 Dueño: ${cuenta.dueno.toBase58()}`);
  console.log(`   🍕 Pizzas en el menú (${cuenta.pizzas.length}):`);

  cuenta.pizzas.forEach((pizza: any, i: number) => {
    const estado = pizza.disponible ? "✅ disponible" : "❌ no disponible";
    console.log(
      `\n   [${i + 1}] ${pizza.nombre} — $${pizza.precio.toString()}`,
    );
    console.log(`       Ingredientes: ${pizza.ingredientes.join(", ")}`);
    console.log(`       Estado: ${estado}`);
  });
}

// ── FLUJO PRINCIPAL ───────────────────────────────────────────────────
async function main() {
  console.log("=======================================================");
  console.log("  🍕 PIZZERÍA SOLANA — Cliente de Pruebas");
  console.log("=======================================================");

  // 1. Airdrop: pedimos SOL de prueba en devnet para pagar transacciones
  console.log("\n💸 Solicitando airdrop de 2 SOL en devnet...");
  const airdropTx = await connection.requestAirdrop(
    wallet.publicKey,
    2 * web3.LAMPORTS_PER_SOL, // 1 SOL = 1_000_000_000 lamports
  );
  await connection.confirmTransaction(airdropTx);
  console.log("   ✅ Airdrop recibido");

  // 2. Cargamos el IDL (Interface Definition Language)
  // El IDL es el "ABI" del programa — describe sus instrucciones, cuentas y tipos.
  // Se genera automáticamente con `anchor build` en `target/idl/pizzeria.json`
  const idl = require("./target/idl/pizzeria.json");
  const program = new Program(idl, PROGRAM_ID, provider);

  // 3. Ejecutamos el CRUD completo
  try {
    // CREATE: crear la pizzería
    const pizzeriaPDA = await crearPizzeria(program, wallet, "La Napolitana");

    // CREATE: agregar pizzas
    await agregarPizza(
      program,
      wallet,
      pizzeriaPDA,
      "Margherita",
      ["tomate", "mozzarella", "albahaca"],
      1200,
    );

    await agregarPizza(
      program,
      wallet,
      pizzeriaPDA,
      "Cuatro Quesos",
      ["mozzarella", "parmesano", "roquefort", "brie"],
      1500,
    );

    await agregarPizza(
      program,
      wallet,
      pizzeriaPDA,
      "Napolitana",
      ["tomate", "mozzarella", "anchoas", "aceitunas"],
      1400,
    );

    // READ: ver el menú después de agregar
    await verMenu(program, pizzeriaPDA);

    // UPDATE: actualizar la Margherita
    await actualizarPizza(
      program,
      wallet,
      pizzeriaPDA,
      "Margherita",
      1350, // nuevo precio
      ["tomate cherry", "mozzarella", "albahaca"], // nuevos ingredientes
      true, // sigue disponible
    );

    // DELETE: eliminar la Napolitana
    await eliminarPizza(program, wallet, pizzeriaPDA, "Napolitana");

    // READ: ver el menú final
    await verMenu(program, pizzeriaPDA);

    console.log("\n\n🎉 ¡CRUD completo ejecutado con éxito!");
    console.log(
      "   Podés ver las transacciones en: https://explorer.solana.com/?cluster=devnet",
    );
  } catch (err: any) {
    console.error("\n❌ Error:", err.message ?? err);
    // Si el error viene del programa, Anchor incluye el mensaje del #[error_code]
    if (err.logs) {
      console.error("   Logs del programa:");
      err.logs.forEach((log: string) => console.error("  ", log));
    }
  }
}

main();
