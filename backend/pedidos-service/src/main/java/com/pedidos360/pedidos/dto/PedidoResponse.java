package com.pedidos360.pedidos.dto;

import com.pedidos360.pedidos.model.ItemPedido;
import com.pedidos360.pedidos.model.Pedido;

import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponse(
        Long id,
        Long clienteId,
        String clienteEmail,
        Pedido.EstadoPedido estado,
        Double total,
        LocalDateTime fechaCreacion,
        List<ItemResponse> items
) {
    public static PedidoResponse from(Pedido p) {
        return new PedidoResponse(
                p.getId(),
                p.getClienteId(),
                p.getClienteEmail(),
                p.getEstado(),
                p.getTotal(),
                p.getFechaCreacion(),
                p.getItems().stream().map(ItemResponse::from).toList()
        );
    }

    public record ItemResponse(
            Long id,
            Long productoId,
            String nombreProducto,
            Integer cantidad,
            Double precioUnitario,
            Double subtotal
    ) {
        public static ItemResponse from(ItemPedido i) {
            return new ItemResponse(
                    i.getId(),
                    i.getProductoId(),
                    i.getNombreProducto(),
                    i.getCantidad(),
                    i.getPrecioUnitario(),
                    i.getSubtotal()
            );
        }
    }
}