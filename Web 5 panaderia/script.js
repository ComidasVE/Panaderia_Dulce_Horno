const carrito = JSON.parse(
    localStorage.getItem("carritoDulceHorno")
) || [];

const botonesAgregar = document.querySelectorAll(".boton-agregar");
const filtros = document.querySelectorAll(".filtro");
const productos = document.querySelectorAll(".producto");

const buscadorProductos = document.getElementById("buscadorProductos");
const sinResultados = document.getElementById("sinResultados");

const abrirCarrito = document.getElementById("abrirCarrito");
const botonVerCarrito = document.getElementById("botonVerCarrito");
const cerrarCarrito = document.getElementById("cerrarCarrito");
const fondoCarrito = document.getElementById("fondoCarrito");
const panelCarrito = document.getElementById("panelCarrito");

const contadorCarrito = document.getElementById("contadorCarrito");
const listaCarrito = document.getElementById("listaCarrito");
const subtotalCarrito = document.getElementById("subtotalCarrito");
const totalCarrito = document.getElementById("totalCarrito");

const finalizarPedido = document.getElementById("finalizarPedido");
const vaciarCarrito = document.getElementById("vaciarCarrito");

const agregarCajaDulce = document.getElementById("agregarCajaDulce");
const botonWhatsAppContacto = document.getElementById(
    "botonWhatsAppContacto"
);

const toast = document.getElementById("toast");

const NUMERO_WHATSAPP = "584121234567";
const MONEDA = "USD";

let categoriaActiva = "todos";
let textoBusqueda = "";

/* Formato de precios */

function formatoMoneda(valor) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: MONEDA
    }).format(valor);
}

/* Notificación breve */

function mostrarToast(mensaje) {
    toast.textContent = mensaje;
    toast.classList.add("visible");

    setTimeout(() => {
        toast.classList.remove("visible");
    }, 2600);
}

/* Guardar y leer carrito */

function guardarCarrito() {
    localStorage.setItem(
        "carritoDulceHorno",
        JSON.stringify(carrito)
    );
}

function obtenerCantidadTotal() {
    return carrito.reduce((total, producto) => {
        return total + producto.cantidad;
    }, 0);
}

function obtenerSubtotal() {
    return carrito.reduce((total, producto) => {
        return total + producto.precio * producto.cantidad;
    }, 0);
}

/* Carrito visible */

function abrirPanelCarrito() {
    panelCarrito.classList.add("abierto");
    fondoCarrito.classList.add("visible");
    panelCarrito.setAttribute("aria-hidden", "false");
    document.body.classList.add("sin-scroll");
}

function cerrarPanelCarrito() {
    panelCarrito.classList.remove("abierto");
    fondoCarrito.classList.remove("visible");
    panelCarrito.setAttribute("aria-hidden", "true");
    document.body.classList.remove("sin-scroll");
}

/* Manejo de productos */

function agregarProducto(productoNuevo) {
    const productoExistente = carrito.find((producto) => {
        return producto.nombre === productoNuevo.nombre;
    });

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push(productoNuevo);
    }

    guardarCarrito();
    renderizarCarrito();
    mostrarToast(`${productoNuevo.nombre} fue agregado al carrito`);
}

function cambiarCantidad(nombreProducto, cambio) {
    const producto = carrito.find((item) => {
        return item.nombre === nombreProducto;
    });

    if (!producto) {
        return;
    }

    producto.cantidad += cambio;

    if (producto.cantidad <= 0) {
        eliminarProducto(nombreProducto);
        return;
    }

    guardarCarrito();
    renderizarCarrito();
}

function eliminarProducto(nombreProducto) {
    const indice = carrito.findIndex((producto) => {
        return producto.nombre === nombreProducto;
    });

    if (indice === -1) {
        return;
    }

    const productoEliminado = carrito[indice];

    carrito.splice(indice, 1);

    guardarCarrito();
    renderizarCarrito();
    mostrarToast(`${productoEliminado.nombre} fue eliminado`);
}

function vaciarTodosLosProductos() {
    if (carrito.length === 0) {
        mostrarToast("Tu carrito ya está vacío");
        return;
    }

    const confirmar = window.confirm(
        "¿Seguro que deseas vaciar todos los productos del carrito?"
    );

    if (!confirmar) {
        return;
    }

    carrito.length = 0;

    guardarCarrito();
    renderizarCarrito();
    mostrarToast("Carrito vaciado");
}

/* Renderizar el contenido del carrito */

function renderizarCarrito() {
    const cantidadTotal = obtenerCantidadTotal();
    const subtotal = obtenerSubtotal();

    contadorCarrito.textContent = cantidadTotal;
    subtotalCarrito.textContent = formatoMoneda(subtotal);
    totalCarrito.textContent = formatoMoneda(subtotal);

    if (carrito.length === 0) {
        listaCarrito.innerHTML = `
            <div class="carrito-vacio">
                <span>🥐</span>
                <h3>Tu carrito está vacío</h3>
                <p>
                    Agrega panes, dulces, postres o bebidas para comenzar
                    tu pedido.
                </p>
            </div>
        `;

        finalizarPedido.disabled = true;

        return;
    }

    finalizarPedido.disabled = false;

    listaCarrito.innerHTML = carrito.map((producto) => {
        const totalProducto = producto.precio * producto.cantidad;

        return `
            <article class="item-carrito">
                <img
                    src="${producto.imagen}"
                    alt="${producto.nombre}"
                >

                <div class="item-carrito-info">
                    <div class="item-carrito-superior">
                        <h3>${producto.nombre}</h3>

                        <button
                            type="button"
                            class="boton-eliminar"
                            data-nombre="${producto.nombre}"
                            aria-label="Eliminar ${producto.nombre}"
                        >
                            ×
                        </button>
                    </div>

                    <p>${formatoMoneda(producto.precio)} cada uno</p>

                    <div class="item-carrito-inferior">
                        <div class="control-cantidad">
                            <button
                                type="button"
                                class="boton-cantidad"
                                data-accion="restar"
                                data-nombre="${producto.nombre}"
                                aria-label="Restar una unidad de ${producto.nombre}"
                            >
                                −
                            </button>

                            <span>${producto.cantidad}</span>

                            <button
                                type="button"
                                class="boton-cantidad"
                                data-accion="sumar"
                                data-nombre="${producto.nombre}"
                                aria-label="Sumar una unidad de ${producto.nombre}"
                            >
                                +
                            </button>
                        </div>

                        <strong>${formatoMoneda(totalProducto)}</strong>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    agregarEventosCarrito();
}

/* Eventos de botones creados dentro del carrito */

function agregarEventosCarrito() {
    const botonesEliminar = document.querySelectorAll(".boton-eliminar");
    const botonesCantidad = document.querySelectorAll(".boton-cantidad");

    botonesEliminar.forEach((boton) => {
        boton.addEventListener("click", () => {
            eliminarProducto(boton.dataset.nombre);
        });
    });

    botonesCantidad.forEach((boton) => {
        boton.addEventListener("click", () => {
            const cambio = boton.dataset.accion === "sumar" ? 1 : -1;

            cambiarCantidad(
                boton.dataset.nombre,
                cambio
            );
        });
    });
}

/* Obtener datos de las tarjetas de productos */

botonesAgregar.forEach((boton) => {
    boton.addEventListener("click", () => {
        const tarjeta = boton.closest(".producto");

        const nombre = tarjeta.querySelector("h3").textContent.trim();

        const precioTexto = tarjeta
            .querySelector(".titulo-precio strong")
            .textContent
            .trim();

        const precio = Number(
            precioTexto
                .replace("$", "")
                .replace(",", "")
        );

        const imagen = tarjeta.querySelector("img").src;

        agregarProducto({
            nombre: nombre,
            precio: precio,
            imagen: imagen,
            cantidad: 1
        });

        boton.classList.add("producto-agregado");
        boton.textContent = "✓";

        setTimeout(() => {
            boton.classList.remove("producto-agregado");
            boton.textContent = "+";
        }, 850);
    });
});

/* Caja de promoción */

agregarCajaDulce.addEventListener("click", () => {
    agregarProducto({
        nombre: "Caja Dulce Surtida",
        precio: 12.99,
        imagen: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85",
        cantidad: 1
    });

    abrirPanelCarrito();
});

/* Abrir y cerrar carrito */

abrirCarrito.addEventListener("click", abrirPanelCarrito);
botonVerCarrito.addEventListener("click", abrirPanelCarrito);
cerrarCarrito.addEventListener("click", cerrarPanelCarrito);
fondoCarrito.addEventListener("click", cerrarPanelCarrito);
vaciarCarrito.addEventListener("click", vaciarTodosLosProductos);

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
        cerrarPanelCarrito();
    }
});

/* Filtros y buscador */

function filtrarProductos() {
    let productosVisibles = 0;

    productos.forEach((producto) => {
        const categoria = producto.dataset.categoria;
        const textoProducto = producto.textContent.toLowerCase();

        const coincideCategoria =
            categoriaActiva === "todos" ||
            categoria === categoriaActiva;

        const coincideBusqueda = textoProducto.includes(textoBusqueda);

        const mostrarProducto =
            coincideCategoria &&
            coincideBusqueda;

        producto.classList.toggle("oculto", !mostrarProducto);

        if (mostrarProducto) {
            productosVisibles += 1;
        }
    });

    sinResultados.classList.toggle(
        "visible",
        productosVisibles === 0
    );
}

filtros.forEach((filtro) => {
    filtro.addEventListener("click", () => {
        filtros.forEach((item) => {
            item.classList.remove("activo");
        });

        filtro.classList.add("activo");

        categoriaActiva = filtro.dataset.categoria;

        filtrarProductos();
    });
});

buscadorProductos.addEventListener("input", (evento) => {
    textoBusqueda = evento.target.value
        .toLowerCase()
        .trim();

    filtrarProductos();
});

/* Crear mensaje y abrir WhatsApp */

function enviarPedidoWhatsApp() {
    if (carrito.length === 0) {
        mostrarToast("Agrega productos antes de enviar tu pedido");
        return;
    }

    const subtotal = obtenerSubtotal();

    const listaProductos = carrito.map((producto) => {
        const totalProducto = producto.precio * producto.cantidad;

        return `• ${producto.cantidad}x ${producto.nombre} — ${formatoMoneda(totalProducto)}`;
    }).join("\n");

    const mensaje = [
        "¡Hola, Dulce Horno! 🍞",
        "Quiero realizar el siguiente pedido:",
        "",
        listaProductos,
        "",
        `Total de productos: ${formatoMoneda(subtotal)}`,
        "Entrega: por confirmar",
        "",
        "Por favor, confirmen disponibilidad, métodos de pago y costo de envío. ¡Gracias!"
    ].join("\n");

    const enlaceWhatsApp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

    window.open(enlaceWhatsApp, "_blank");
}

finalizarPedido.addEventListener("click", enviarPedidoWhatsApp);

/* Botón de contacto por WhatsApp */

botonWhatsAppContacto.href = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(
    "¡Hola! Me gustaría consultar sobre un pedido especial para Dulce Horno."
)}`;

/* Cargar carrito guardado */

renderizarCarrito();