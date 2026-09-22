package com.pedidos360.pedidos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PedidoRequest(

        @NotNull(message = "El clienteId es obligatorio")
        Long clienteId,

        String clienteEmail,

        @Valid
        @Size(min = 1, message = "El pedido debe tener al menos un ítem")
        List<ItemRequest> items
) {
    public record ItemRequest(
            @NotNull(message = "El productoId es obligatorio")
            Long productoId,

            @Size(max = 150)
            String nombreProducto,

            @NotNull(message = "La cantidad es obligatoria")
            Integer cantidad,

            @NotNull(message = "El precio unitario es obligatorio")
            Double precioUnitario
    ) {
    }
}