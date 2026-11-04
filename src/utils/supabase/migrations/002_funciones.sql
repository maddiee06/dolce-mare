-- ---------------------------------------------------------------------
-- verificar_login: valida usuario y contraseña, y devuelve los datos
-- del usuario. Si la contraseña es incorrecta o no existe, no devuelve filas.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verificar_login(
    p_usuario  VARCHAR,
    p_password TEXT
)
RETURNS TABLE (
    id_usuario INTEGER,
    id_rol     INTEGER,
    nombres    VARCHAR,
    apellidos  VARCHAR,
    usuario    VARCHAR,
    rol        VARCHAR
)
LANGUAGE plpgsql
SET search_path = public, extensions  -- para encontrar crypt() de pgcrypto
AS $$
DECLARE
    v_user public.usuarios%ROWTYPE;
BEGIN
    -- Buscar al usuario activo
    SELECT * INTO v_user
    FROM public.usuarios u
    WHERE u.usuario = p_usuario
      AND u.estado = true;

    -- Si no existe, abortar (0 filas)
    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Validar el hash y actualizar
    IF v_user.contrasena_hash = crypt(p_password, v_user.contrasena_hash) THEN

        -- Actualizamos el último acceso
        UPDATE public.usuarios
        SET ultimo_acceso = now()
        WHERE public.usuarios.id_usuario = v_user.id_usuario;

        -- Asignamos los valores de salida
        id_usuario := v_user.id_usuario;
        id_rol := v_user.id_rol;
        nombres := v_user.nombres;
        apellidos := v_user.apellidos;
        usuario := v_user.usuario;

        -- Obtenemos el nombre del rol
        SELECT nombre INTO rol
        FROM public.roles
        WHERE public.roles.id_rol = v_user.id_rol;

        RETURN NEXT;
        RETURN;
    END IF;

    -- Si la contraseña es incorrecta, no retornamos filas
    RETURN;
END;
$$;

-- ---------------------------------------------------------------------
-- registrar_movimiento: calcula el nuevo stock, lo actualiza, escribe
-- el kardex y registra la merma si corresponde. Todo en una transacción.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.registrar_movimiento(
    p_id_producto         INTEGER,
    p_id_sede             INTEGER,
    p_id_tipo_movimiento  INTEGER,
    p_id_usuario          INTEGER,
    p_cantidad            NUMERIC,
    p_motivo              VARCHAR DEFAULT NULL,
    p_es_merma            BOOLEAN DEFAULT false
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_stock_anterior NUMERIC;
    v_stock_resultante NUMERIC;
    v_afecta_stock VARCHAR;
    v_id_movimiento INT;
BEGIN
    -- Obtiene la dirección del movimiento (suma, resta, ninguno)
    SELECT afecta_stock INTO v_afecta_stock
    FROM tipos_movimiento_inventario
    WHERE id_tipo_movimiento = p_id_tipo_movimiento;

    -- Bloquea la fila para que otra actualización simultánea no se cruce
    SELECT stock_actual INTO v_stock_anterior
    FROM producto_sede
    WHERE id_sede = p_id_sede AND id_producto = p_id_producto
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto no encontrado en esta sede';
    END IF;

    -- Se calcula el nuevo Stock
    IF v_afecta_stock = 'suma' THEN
        v_stock_resultante := v_stock_anterior + p_cantidad;
    ELSIF v_afecta_stock = 'resta' THEN
        v_stock_resultante := v_stock_anterior - p_cantidad;
    ELSE
        v_stock_resultante := v_stock_anterior;
    END IF;

    IF v_stock_resultante < 0 THEN
        RAISE EXCEPTION 'Stock insuficiente. Actual: %, Solicitado: %', v_stock_anterior, p_cantidad;
    END IF;

    -- Actualizar stock en la sede
    UPDATE producto_sede
    SET stock_actual = v_stock_resultante
    WHERE id_sede = p_id_sede AND id_producto = p_id_producto;

    -- Registrar el movimiento en el Kardex
    INSERT INTO movimientos_inventario (
        id_producto, id_sede, id_tipo_movimiento, id_usuario,
        cantidad, stock_anterior, stock_resultante, motivo
    ) VALUES (
        p_id_producto, p_id_sede, p_id_tipo_movimiento, p_id_usuario,
        p_cantidad, v_stock_anterior, v_stock_resultante, p_motivo
    ) RETURNING id_movimiento INTO v_id_movimiento;

    -- Registrar Merma (si aplica)
    IF p_es_merma THEN
        INSERT INTO mermas (
            id_producto, id_sede, id_usuario, cantidad, motivo
        ) VALUES (
            p_id_producto, p_id_sede, p_id_usuario, p_cantidad, COALESCE(p_motivo, 'Merma desde inventario')
        );
    END IF;

    -- Devolver la respuesta
    RETURN json_build_object(
        'idMovimiento', v_id_movimiento,
        'stockAnterior', v_stock_anterior,
        'stockResultante', v_stock_resultante
    );
END;
$$;

-- ---------------------------------------------------------------------
-- obtener_correo_por_usuario: devuelve el correo de un nombre de usuario.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.obtener_correo_por_usuario(p_usuario VARCHAR)
RETURNS VARCHAR
LANGUAGE sql
AS $$
    SELECT correo FROM public.usuarios WHERE usuario = p_usuario LIMIT 1;
$$;
