package com.pedidos360.pedidos.controller;

import com.pedidos360.pedidos.dto.PedidoRequest;
import com.pedidos360.pedidos.dto.PedidoResponse;
import com.pedidos360.pedidos.model.ItemPedido;
import com.pedidos360.pedidos.model.Pedido;
import com.pedidos360.pedidos.repository.PedidoRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoRepository repository;

    public PedidoController(PedidoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<PedidoResponse> listar(@RequestParam(required = false) Long clienteId) {
        List<Pedido> pedidos = (clienteId == null)
                ? repository.findAll()
                : repository.findByClienteId(clienteId);
        return pedidos.stream().map(PedidoResponse::from).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponse> obtener(@PathVariable Long id) {
        return repository.findById(id)
                .map(PedidoResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PedidoResponse> crear(@Valid @RequestBody PedidoRequest request) {
        Pedido pedido = new Pedido(
                request.clienteId(),
                request.clienteEmail(),
                Pedido.EstadoPedido.PENDIENTE,
                null
        );

        double total = 0;
        for (PedidoRequest.ItemRequest item : request.items()) {
            ItemPedido entity = new ItemPedido(
                    item.productoId(),
                    item.nombreProducto(),
                    item.cantidad(),
                    item.precioUnitario()
            );
            pedido.addItem(entity);
            total += entity.getSubtotal();
        }
        pedido.setTotal(total);

        Pedido guardado = repository.save(pedido);
        return ResponseEntity.status(HttpStatus.CREATED).body(PedidoResponse.from(guardado));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<PedidoResponse> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String nuevoEstado = body.get("estado");
        if (nuevoEstado == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Pedido.EstadoPedido estado = Pedido.EstadoPedido.valueOf(nuevoEstado.toUpperCase());
            return repository.findById(id).map(pedido -> {
                pedido.setEstado(estado);
                return ResponseEntity.ok(PedidoResponse.from(repository.save(pedido)));
            }).orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}