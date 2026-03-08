use anchor_lang::prelude::*;

declare_id!("TuProgramIDAquiCuandoHagasAnchorBuild11111111");

#[program]
pub mod pizzeria {
    use super::*;

    pub fn crear_pizzeria(ctx: Context<NuevaPizzeria>, nombre: String) -> Result<()> {
        require!(!nombre.is_empty(), Errores::NombreVacio);
        require!(nombre.len() <= 32, Errores::NombreDemasiadoLargo);

        let dueno_id = ctx.accounts.dueno.key();

        let nueva_pizzeria = Pizzeria {
            dueno: dueno_id,
            nombre,
            pizzas: Vec::new(),
        };

        let pizzeria = &mut ctx.accounts.pizzeria;
        pizzeria.set_inner(nueva_pizzeria);

        msg!("🍕 Pizzería creada!");
        Ok(())
    }

    pub fn agregar_pizza(
        ctx: Context<ModificarPizzeria>,
        nombre: String,
        ingredientes: Vec<String>,
        precio: u64,
    ) -> Result<()> {
        require!(!nombre.is_empty(), Errores::NombreVacio);
        require!(nombre.len() <= 60, Errores::NombreDemasiadoLargo);
        require!(precio > 0, Errores::PrecioInvalido);
        require!(ingredientes.len() <= 10, Errores::DemasiadosIngredientes);

        let existe = ctx
            .accounts
            .pizzeria
            .pizzas
            .iter()
            .any(|p| p.nombre == nombre);
        require!(!existe, Errores::PizzaYaExiste);

        let nueva_pizza = Pizza {
            nombre,
            ingredientes,
            precio,
            disponible: true,
        };

        ctx.accounts.pizzeria.pizzas.push(nueva_pizza);

        msg!("✅ Pizza agregada al menú");
        Ok(())
    }

    pub fn actualizar_pizza(
        ctx: Context<ModificarPizzeria>,
        nombre: String,
        nuevo_precio: u64,
        nuevos_ingredientes: Vec<String>,
        disponible: bool,
    ) -> Result<()> {
        require!(nuevo_precio > 0, Errores::PrecioInvalido);
        require!(
            nuevos_ingredientes.len() <= 10,
            Errores::DemasiadosIngredientes
        );

        let pizzas = &mut ctx.accounts.pizzeria.pizzas;

        if let Some(pizza) = pizzas.iter_mut().find(|p| p.nombre == nombre) {
            pizza.precio = nuevo_precio;
            pizza.ingredientes = nuevos_ingredientes;
            pizza.disponible = disponible;
            msg!("✏️  Pizza actualizada: {}", nombre);
            Ok(())
        } else {
            Err(Errores::PizzaNoExiste.into())
        }
    }

    pub fn eliminar_pizza(ctx: Context<ModificarPizzeria>, nombre: String) -> Result<()> {
        let pizzas = &mut ctx.accounts.pizzeria.pizzas;

        if let Some(pos) = pizzas.iter().position(|p| p.nombre == nombre) {
            pizzas.remove(pos);
            msg!("🗑️  Pizza eliminada: {}", nombre);
            Ok(())
        } else {
            Err(Errores::PizzaNoExiste.into())
        }
    }

    pub fn ver_menu(ctx: Context<VerMenu>) -> Result<()> {
        let pizzas = &ctx.accounts.pizzeria.pizzas;
        msg!("Menu :3 ({} pizzas):", pizzas.len());
        msg!("{:#?}", pizzas);
        Ok(())
    }
}

#[error_code]
pub enum Errores {
    #[msg("El nombre no puede estar vacío")]
    NombreVacio,

    #[msg("El nombre es demasiado largo (máx 32 chars para pizzería, 60 para pizza)")]
    NombreDemasiadoLargo,

    #[msg("El precio debe ser mayor a cero")]
    PrecioInvalido,

    #[msg("No se puede tener más de 10 ingredientes por pizza")]
    DemasiadosIngredientes,

    #[msg("Ya existe una pizza con ese nombre en el menú")]
    PizzaYaExiste,

    #[msg("No se encontró ninguna pizza con ese nombre")]
    PizzaNoExiste,

    #[msg("Solo el dueño puede modificar esta pizzería")]
    NoEresElDueno,
}

#[account]
#[derive(InitSpace)]
pub struct Pizzeria {
    pub dueno: Pubkey,

    #[max_len(32)]
    pub nombre: String,

    #[max_len(5, 10, 60)]
    pub pizzas: Vec<Pizza>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace, PartialEq, Debug)]
pub struct Pizza {
    #[max_len(60)]
    pub nombre: String,

    #[max_len(10, 30)]
    pub ingredientes: Vec<String>,

    pub precio: u64,

    pub disponible: bool,
}

#[derive(Accounts)]
pub struct NuevaPizzeria<'info> {
    #[account(mut)]
    pub dueno: Signer<'info>,

    #[account(
        init,
        payer = dueno,
        space = Pizzeria::INIT_SPACE + 8,
        seeds = [b"pizzeria", dueno.key().as_ref()],
        bump
    )]
    pub pizzeria: Account<'info, Pizzeria>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ModificarPizzeria<'info> {
    pub dueno: Signer<'info>,

    #[account(
        mut,
        seeds = [b"pizzeria", dueno.key().as_ref()],
        bump,
        has_one = dueno @ Errores::NoEresElDueno
    )]
    pub pizzeria: Account<'info, Pizzeria>,
}

#[derive(Accounts)]
pub struct VerMenu<'info> {
    pub pizzeria: Account<'info, Pizzeria>,
}
