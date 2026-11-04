-- =====================================================================
-- Migración 001: esquema inicial de Dolce Mare
-- Crea la extensión de cifrado, la función de triggers, las 27 tablas,
-- sus índices y los triggers de actualizado_en.
-- =====================================================================

-- Necesaria para crypt() (usada por verificar_login en la migración 002).
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Función usada por los triggers para actualizar automáticamente la fecha
-- de modificación cuando se cambia un registro.
CREATE OR REPLACE FUNCTION set_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = now(); -- Guarda la fecha y hora de la actualización.
    RETURN NEW;                 -- Permite que se guarde el registro modificado.
END;
$$ LANGUAGE plpgsql;


-- Roles del sistema (admin, cajero)
CREATE TABLE roles (
    id_rol        SERIAL PRIMARY KEY,
    nombre        VARCHAR(50) NOT NULL UNIQUE,
    descripcion   VARCHAR(255),
    estado        BOOLEAN NOT NULL DEFAULT true,
    creado_en     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Locales/sucursales de la heladería
CREATE TABLE sedes (
    id_sede       SERIAL PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    direccion     VARCHAR(255) NOT NULL,
    distrito      VARCHAR(100),
    telefono      VARCHAR(20),
    ruc_emision   VARCHAR(11),
    estado        BOOLEAN NOT NULL DEFAULT true,
    creado_en     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_sedes_ruc CHECK (ruc_emision IS NULL OR ruc_emision ~ '^\d{11}$')
);

-- Categorías de productos (helados, postres, bebidas, etc.)
CREATE TABLE categorias (
    id_categoria  SERIAL PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL UNIQUE,
    descripcion   VARCHAR(255),
    estado        BOOLEAN NOT NULL DEFAULT true
);

-- Clientes identificados por nombre al momento del pedido
CREATE TABLE clientes (
    id_cliente    SERIAL PRIMARY KEY,
    nombres       VARCHAR(150) NOT NULL,
    direccion     VARCHAR(255),
    telefono      VARCHAR(20)
);

-- Catálogo: tipos de movimiento de inventario (ingreso, salida, ajuste)
CREATE TABLE tipos_movimiento_inventario (
    id_tipo_movimiento  SERIAL PRIMARY KEY,
    nombre              VARCHAR(50) NOT NULL UNIQUE,
    afecta_stock        VARCHAR(10) NOT NULL,
    CONSTRAINT chk_tmi_afecta CHECK (afecta_stock IN ('suma', 'resta', 'ninguno'))
);

-- Catálogo: tipos de movimiento de caja (ingreso, egreso)
CREATE TABLE tipos_movimiento_caja (
    id_tipo_mov_caja  SERIAL PRIMARY KEY,
    nombre            VARCHAR(50) NOT NULL UNIQUE,
    naturaleza        VARCHAR(10) NOT NULL,
    CONSTRAINT chk_tmc_naturaleza CHECK (naturaleza IN ('ingreso', 'egreso'))
);

-- Catálogo: tipos de comprobante (boleta, factura, nota de crédito)
CREATE TABLE tipos_comprobante (
    id_tipo_comprobante  SERIAL PRIMARY KEY,
    nombre               VARCHAR(50) NOT NULL UNIQUE,
    serie_prefijo        VARCHAR(10)
);

-- Catálogo: estados de un pedido (abierto, facturado, cancelado)
CREATE TABLE estados_pedido (
    id_estado_pedido  SERIAL PRIMARY KEY,
    nombre            VARCHAR(50) NOT NULL UNIQUE
);

-- Catálogo: estados de una caja (abierta, cerrada)
CREATE TABLE estados_caja (
    id_estado_caja  SERIAL PRIMARY KEY,
    nombre          VARCHAR(50) NOT NULL UNIQUE
);

-- Catálogo: estados de una venta (completada, anulada)
CREATE TABLE estados_venta (
    id_estado_venta  SERIAL PRIMARY KEY,
    nombre           VARCHAR(50) NOT NULL UNIQUE
);

-- Catálogo: estados de una transferencia entre sedes
CREATE TABLE estados_transferencia (
    id_estado_transferencia  SERIAL PRIMARY KEY,
    nombre                   VARCHAR(50) NOT NULL UNIQUE
);

-- Catálogo: tipos de entrega del pedido (local, delivery)
CREATE TABLE tipos_entrega (
    id_tipo_entrega  SERIAL PRIMARY KEY,
    nombre           VARCHAR(50) NOT NULL UNIQUE
);

-- Catálogo: métodos de pago aceptados
CREATE TABLE metodos_pago (
    id_metodo_pago  SERIAL PRIMARY KEY,
    nombre          VARCHAR(50) NOT NULL UNIQUE
);

-- Catálogo: estados SUNAT de un comprobante electrónico
CREATE TABLE estados_sunat (
    id_estado_sunat  SERIAL PRIMARY KEY,
    nombre           VARCHAR(50) NOT NULL UNIQUE
);


-- Usuarios del sistema (cajeros y admins), con login propio (contraseña cifrada en contrasena_hash)
CREATE TABLE usuarios (
    id_usuario        SERIAL PRIMARY KEY,
    id_rol            INTEGER NOT NULL REFERENCES roles(id_rol),
    nombres           VARCHAR(100) NOT NULL,
    apellidos         VARCHAR(100) NOT NULL,
    dni               VARCHAR(8),
    correo            VARCHAR(150) NOT NULL UNIQUE,
    usuario           VARCHAR(50) NOT NULL UNIQUE,
    contrasena_hash   text not null,
    telefono          VARCHAR(20),
    estado            BOOLEAN NOT NULL DEFAULT true,
    ultimo_acceso     TIMESTAMPTZ,
    eliminado_en      TIMESTAMPTZ,
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_usuarios_dni CHECK (dni IS NULL OR dni ~ '^\d{8}$'),
    CONSTRAINT chk_usuarios_correo CHECK (correo ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);
-- Evita repetir el DNI, pero permite que varios usuarios lo tengan vacío (NULL).
CREATE UNIQUE INDEX uq_usuarios_dni ON usuarios(dni) WHERE dni IS NOT NULL;

-- Antes de actualizar un usuario, ejecuta la función que renueva actualizado_en.
CREATE TRIGGER trg_usuarios_actualizado
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION set_actualizado_en();


-- Productos del catálogo (helados, postres, etc.)
CREATE TABLE productos (
    id_producto      SERIAL PRIMARY KEY,
    id_categoria     INTEGER NOT NULL REFERENCES categorias(id_categoria),
    codigo           VARCHAR(50) UNIQUE,
    nombre           VARCHAR(150) NOT NULL,
    descripcion      TEXT,
    unidad_medida    VARCHAR(20) NOT NULL,
    precio_venta     NUMERIC(10,2) NOT NULL,
    costo_unitario   NUMERIC(10,2) NOT NULL DEFAULT 0,
    imagen_url       VARCHAR(255),
    afecto_igv       BOOLEAN NOT NULL DEFAULT true,
    estado           BOOLEAN NOT NULL DEFAULT true,
    eliminado_en     TIMESTAMPTZ,
    creado_en        TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_productos_precio CHECK (precio_venta >= 0),
    CONSTRAINT chk_productos_costo CHECK (costo_unitario >= 0)
);
CREATE INDEX idx_productos_categoria ON productos(id_categoria);

-- Actualiza automáticamente la fecha de modificación de un producto.
CREATE TRIGGER trg_productos_actualizado
    BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION set_actualizado_en();

-- Stock de cada producto por sede
CREATE TABLE producto_sede (
    id_producto_sede  SERIAL PRIMARY KEY,
    id_producto       INTEGER NOT NULL REFERENCES productos(id_producto),
    id_sede           INTEGER NOT NULL REFERENCES sedes(id_sede),
    stock_actual      NUMERIC(10,2) NOT NULL DEFAULT 0,
    stock_minimo      NUMERIC(10,2) NOT NULL DEFAULT 0,
    disponible        BOOLEAN NOT NULL DEFAULT true,
    actualizado_en    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_producto_sede UNIQUE (id_producto, id_sede),
    CONSTRAINT chk_ps_stock_actual CHECK (stock_actual >= 0),
    CONSTRAINT chk_ps_stock_minimo CHECK (stock_minimo >= 0)
);
CREATE INDEX idx_ps_producto ON producto_sede(id_producto);
CREATE INDEX idx_ps_sede ON producto_sede(id_sede);

-- Actualiza la fecha cuando cambia el stock o algún dato del producto en una sede.
CREATE TRIGGER trg_ps_actualizado
    BEFORE UPDATE ON producto_sede
    FOR EACH ROW EXECUTE FUNCTION set_actualizado_en();


-- Aperturas y cierres de caja por sede
CREATE TABLE cajas (
    id_caja                SERIAL PRIMARY KEY,
    id_sede                INTEGER NOT NULL REFERENCES sedes(id_sede),
    id_usuario_apertura    INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    id_usuario_cierre      INTEGER REFERENCES usuarios(id_usuario),
    id_estado_caja         INTEGER NOT NULL REFERENCES estados_caja(id_estado_caja),
    monto_apertura         NUMERIC(10,2) NOT NULL,
    monto_cierre_sistema   NUMERIC(10,2),
    monto_cierre_real      NUMERIC(10,2),
    -- Diferencia calculada automáticamente entre el cierre real y el del sistema.
    diferencia             NUMERIC(10,2) GENERATED ALWAYS AS (monto_cierre_real - monto_cierre_sistema) STORED,
    fecha_apertura         TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_cierre           TIMESTAMPTZ,
    CONSTRAINT chk_cajas_monto_apertura CHECK (monto_apertura >= 0)
);
CREATE INDEX idx_cajas_sede ON cajas(id_sede);
CREATE INDEX idx_cajas_usuario_apertura ON cajas(id_usuario_apertura);
CREATE INDEX idx_cajas_usuario_cierre ON cajas(id_usuario_cierre);
CREATE INDEX idx_cajas_estado ON cajas(id_estado_caja);


-- Cuenta del cliente: se abre al primer pedido y acumula ítems hasta facturarse
CREATE TABLE pedidos (
    id_pedido             SERIAL PRIMARY KEY,
    id_sede               INTEGER NOT NULL REFERENCES sedes(id_sede),
    id_cliente            INTEGER REFERENCES clientes(id_cliente),
    id_estado_pedido      INTEGER NOT NULL REFERENCES estados_pedido(id_estado_pedido),
    id_tipo_entrega       INTEGER NOT NULL REFERENCES tipos_entrega(id_tipo_entrega),
    id_usuario_registra   INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    direccion_entrega     VARCHAR(255),
    fecha_pedido          TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_entrega         TIMESTAMPTZ,
    total                 NUMERIC(10,2) NOT NULL DEFAULT 0,
    observaciones         VARCHAR(255),
    CONSTRAINT chk_pedidos_total CHECK (total >= 0)
);
CREATE INDEX idx_pedidos_sede ON pedidos(id_sede);
CREATE INDEX idx_pedidos_cliente ON pedidos(id_cliente);
CREATE INDEX idx_pedidos_estado ON pedidos(id_estado_pedido);
CREATE INDEX idx_pedidos_tipo_entrega ON pedidos(id_tipo_entrega);
CREATE INDEX idx_pedidos_usuario ON pedidos(id_usuario_registra);

-- Ítems que componen cada pedido
CREATE TABLE detalle_pedido (
    id_detalle_pedido  SERIAL PRIMARY KEY,
    id_pedido          INTEGER NOT NULL REFERENCES pedidos(id_pedido),
    id_producto        INTEGER NOT NULL REFERENCES productos(id_producto),
    cantidad           NUMERIC(10,2) NOT NULL,
    precio_unitario    NUMERIC(10,2) NOT NULL,
    subtotal           NUMERIC(10,2) NOT NULL,
    CONSTRAINT chk_dp_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_dp_precio CHECK (precio_unitario >= 0),
    CONSTRAINT chk_dp_subtotal CHECK (subtotal >= 0)
);
CREATE INDEX idx_dp_pedido ON detalle_pedido(id_pedido);
CREATE INDEX idx_dp_producto ON detalle_pedido(id_producto);


-- Venta cerrada: se genera al facturar un pedido o al cobrar directo
CREATE TABLE ventas (
    id_venta         SERIAL PRIMARY KEY,
    id_sede          INTEGER NOT NULL REFERENCES sedes(id_sede),
    id_pedido        INTEGER REFERENCES pedidos(id_pedido),
    id_cliente       INTEGER REFERENCES clientes(id_cliente),
    id_usuario       INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    id_estado_venta  INTEGER NOT NULL REFERENCES estados_venta(id_estado_venta),
    id_metodo_pago   INTEGER NOT NULL REFERENCES metodos_pago(id_metodo_pago),
    fecha_venta      TIMESTAMPTZ NOT NULL DEFAULT now(),
    subtotal         NUMERIC(10,2) NOT NULL,
    igv              NUMERIC(10,2) NOT NULL,
    total            NUMERIC(10,2) NOT NULL,
    eliminado_en     TIMESTAMPTZ,
    creado_en        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_ventas_subtotal CHECK (subtotal >= 0),
    CONSTRAINT chk_ventas_igv CHECK (igv >= 0),
    CONSTRAINT chk_ventas_total CHECK (total >= 0)
);
CREATE INDEX idx_ventas_sede ON ventas(id_sede);
CREATE INDEX idx_ventas_pedido ON ventas(id_pedido);
CREATE INDEX idx_ventas_cliente ON ventas(id_cliente);
CREATE INDEX idx_ventas_usuario ON ventas(id_usuario);
CREATE INDEX idx_ventas_estado ON ventas(id_estado_venta);
CREATE INDEX idx_ventas_metodo_pago ON ventas(id_metodo_pago);

-- Ítems que componen cada venta
CREATE TABLE detalle_venta (
    id_detalle_venta  SERIAL PRIMARY KEY,
    id_venta          INTEGER NOT NULL REFERENCES ventas(id_venta),
    id_producto       INTEGER NOT NULL REFERENCES productos(id_producto),
    cantidad          NUMERIC(10,2) NOT NULL,
    precio_unitario   NUMERIC(10,2) NOT NULL,
    descuento         NUMERIC(10,2) NOT NULL DEFAULT 0,
    subtotal          NUMERIC(10,2) NOT NULL,
    CONSTRAINT chk_dv_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_dv_precio CHECK (precio_unitario >= 0),
    CONSTRAINT chk_dv_descuento CHECK (descuento >= 0 AND descuento <= precio_unitario * cantidad),
    CONSTRAINT chk_dv_subtotal CHECK (subtotal >= 0)
);
CREATE INDEX idx_dv_venta ON detalle_venta(id_venta);
CREATE INDEX idx_dv_producto ON detalle_venta(id_producto);

-- Boletas, facturas y notas emitidas por cada venta (para SUNAT)
CREATE TABLE comprobantes (
    id_comprobante              SERIAL PRIMARY KEY,
    id_venta                    INTEGER NOT NULL REFERENCES ventas(id_venta),
    id_tipo_comprobante         INTEGER NOT NULL REFERENCES tipos_comprobante(id_tipo_comprobante),
    serie                       VARCHAR(10) NOT NULL,
    numero                      INTEGER NOT NULL,
    id_comprobante_referencia   INTEGER REFERENCES comprobantes(id_comprobante),
    motivo_nota                 VARCHAR(150),
    id_estado_sunat             INTEGER NOT NULL REFERENCES estados_sunat(id_estado_sunat),
    hash_cpe                    VARCHAR(255),
    xml_url                     VARCHAR(255),
    pdf_url                     VARCHAR(255),
    eliminado_en                TIMESTAMPTZ,
    fecha_emision               TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_comprobante_serie_numero UNIQUE (id_tipo_comprobante, serie, numero)
);
CREATE INDEX idx_comp_venta ON comprobantes(id_venta);
CREATE INDEX idx_comp_tipo ON comprobantes(id_tipo_comprobante);
CREATE INDEX idx_comp_referencia ON comprobantes(id_comprobante_referencia);
CREATE INDEX idx_comp_estado_sunat ON comprobantes(id_estado_sunat);


-- Entradas y salidas de dinero en una caja (vueltos, retiros, pagos)
CREATE TABLE movimientos_caja (
    id_movimiento_caja  SERIAL PRIMARY KEY,
    id_caja             INTEGER NOT NULL REFERENCES cajas(id_caja),
    id_tipo_mov_caja    INTEGER NOT NULL REFERENCES tipos_movimiento_caja(id_tipo_mov_caja),
    id_venta            INTEGER REFERENCES ventas(id_venta),
    id_usuario          INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    monto               NUMERIC(10,2) NOT NULL,
    descripcion         VARCHAR(255),
    eliminado_en        TIMESTAMPTZ,
    fecha_movimiento    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_mc_monto CHECK (monto >= 0)
);
CREATE INDEX idx_mc_caja ON movimientos_caja(id_caja);
CREATE INDEX idx_mc_tipo ON movimientos_caja(id_tipo_mov_caja);
CREATE INDEX idx_mc_venta ON movimientos_caja(id_venta);
CREATE INDEX idx_mc_usuario ON movimientos_caja(id_usuario);


-- Productos dados de baja por pérdida, daño o vencimiento
CREATE TABLE mermas (
    id_merma         SERIAL PRIMARY KEY,
    id_producto      INTEGER NOT NULL REFERENCES productos(id_producto),
    id_sede          INTEGER NOT NULL REFERENCES sedes(id_sede),
    id_usuario       INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    cantidad         NUMERIC(10,2) NOT NULL,
    motivo           VARCHAR(100) NOT NULL,
    observaciones    VARCHAR(255),
    fecha_registro   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_mermas_cantidad CHECK (cantidad > 0)
);
CREATE INDEX idx_mermas_producto ON mermas(id_producto);
CREATE INDEX idx_mermas_sede ON mermas(id_sede);
CREATE INDEX idx_mermas_usuario ON mermas(id_usuario);

-- Envío de productos de una sede a otra
CREATE TABLE transferencias (
    id_transferencia         SERIAL PRIMARY KEY,
    id_producto              INTEGER NOT NULL REFERENCES productos(id_producto),
    id_sede_origen           INTEGER NOT NULL REFERENCES sedes(id_sede),
    id_sede_destino          INTEGER NOT NULL REFERENCES sedes(id_sede),
    cantidad                 NUMERIC(10,2) NOT NULL,
    id_usuario_envia         INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    id_usuario_recibe        INTEGER REFERENCES usuarios(id_usuario),
    id_estado_transferencia  INTEGER NOT NULL REFERENCES estados_transferencia(id_estado_transferencia),
    fecha_envio              TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_recepcion          TIMESTAMPTZ,
    observaciones            VARCHAR(255),
    CONSTRAINT chk_transf_sedes_distintas CHECK (id_sede_origen <> id_sede_destino),
    CONSTRAINT chk_transf_cantidad CHECK (cantidad > 0)
);
CREATE INDEX idx_transf_producto ON transferencias(id_producto);
CREATE INDEX idx_transf_sede_origen ON transferencias(id_sede_origen);
CREATE INDEX idx_transf_sede_destino ON transferencias(id_sede_destino);
CREATE INDEX idx_transf_usuario_envia ON transferencias(id_usuario_envia);
CREATE INDEX idx_transf_usuario_recibe ON transferencias(id_usuario_recibe);
CREATE INDEX idx_transf_estado ON transferencias(id_estado_transferencia);

-- Historial de todo movimiento que afecta el stock de un producto
CREATE TABLE movimientos_inventario (
    id_movimiento        SERIAL PRIMARY KEY,
    id_producto          INTEGER NOT NULL REFERENCES productos(id_producto),
    id_sede              INTEGER NOT NULL REFERENCES sedes(id_sede),
    id_tipo_movimiento   INTEGER NOT NULL REFERENCES tipos_movimiento_inventario(id_tipo_movimiento),
    id_usuario           INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    cantidad             NUMERIC(10,2) NOT NULL,
    stock_anterior       NUMERIC(10,2) NOT NULL,
    stock_resultante     NUMERIC(10,2) NOT NULL,
    id_referencia_venta  INTEGER REFERENCES ventas(id_venta),
    id_transferencia     INTEGER REFERENCES transferencias(id_transferencia),
    motivo               VARCHAR(255),
    fecha_movimiento     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_mi_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_mi_stock_anterior CHECK (stock_anterior >= 0),
    CONSTRAINT chk_mi_stock_resultante CHECK (stock_resultante >= 0)
);
CREATE INDEX idx_mi_producto ON movimientos_inventario(id_producto);
CREATE INDEX idx_mi_sede ON movimientos_inventario(id_sede);
CREATE INDEX idx_mi_tipo ON movimientos_inventario(id_tipo_movimiento);
CREATE INDEX idx_mi_usuario ON movimientos_inventario(id_usuario);
CREATE INDEX idx_mi_venta ON movimientos_inventario(id_referencia_venta);
CREATE INDEX idx_mi_transferencia ON movimientos_inventario(id_transferencia);
