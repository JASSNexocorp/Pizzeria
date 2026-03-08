# 🍕 Pizzería Solana — CRUD con Anchor

Programa on-chain para gestionar el menú de una pizzería usando **Anchor Framework**.

---

## 📁 Estructura

```
solana-crud/
├── lib.rs        ← Contrato Solana (va en programs/pizzeria/src/lib.rs)
├── cliente.ts    ← Cliente TypeScript para probar el CRUD
└── README.md
```

---

## 🚀 Setup desde cero

### 1. Instalar dependencias
```bash
# Instalar Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Instalar Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"

# Instalar Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest && avm use latest
```

### 2. Crear el proyecto Anchor
```bash
anchor init pizzeria
cd pizzeria

# Reemplazá el contenido de programs/pizzeria/src/lib.rs con lib.rs de este repo
```

### 3. Build y obtener el Program ID
```bash
anchor build
# Copiá el ID que aparece en target/idl/pizzeria.json
# Pegalo en declare_id!(...) de lib.rs Y en cliente.ts
```

### 4. Configurar wallet de pruebas
```bash
solana config set --url devnet
solana-keygen new --outfile ~/.config/solana/id.json
solana airdrop 2
```

### 5. Deploy
```bash
anchor deploy
```

### 6. Ejecutar el cliente
```bash
npm install @coral-xyz/anchor @solana/web3.js ts-node typescript
npx ts-node cliente.ts
```

---

## 📖 Operaciones CRUD

| Operación | Instrucción          | Descripción                              |
|-----------|----------------------|------------------------------------------|
| Create    | `crear_pizzeria`     | Inicializa la cuenta PDA del local       |
| Create    | `agregar_pizza`      | Agrega una pizza al Vec interno          |
| Read      | `ver_menu`           | Imprime el menú en los logs de la TX     |
| Read      | `program.account.pizzeria.fetch()` | Lee la cuenta directamente (cliente) |
| Update    | `actualizar_pizza`   | Modifica precio, ingredientes, estado    |
| Delete    | `eliminar_pizza`     | Remueve una pizza del Vec por nombre     |

---

## 🧠 Conceptos clave

| Concepto | Qué es |
|----------|--------|
| **PDA** | Dirección única sin clave privada, derivada de seeds. Permite que el programa "posea" cuentas. |
| **Rent** | SOL que se paga para mantener datos on-chain. Se devuelve al cerrar la cuenta. |
| **IDL** | Archivo JSON generado por Anchor que describe el programa (como un ABI en EVM). |
| **BN** | Big Number — necesario en el cliente JS para manejar u64 de Rust sin pérdida de precisión. |
| **Discriminator** | 8 bytes que Anchor agrega al inicio de cada cuenta para identificar su tipo. Por eso `INIT_SPACE + 8`. |

---

## 🔍 Ver transacciones

Una vez deployado en devnet, podés explorar las transacciones en:
```
https://explorer.solana.com/?cluster=devnet
```
