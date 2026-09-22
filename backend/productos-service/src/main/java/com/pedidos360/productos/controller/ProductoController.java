package com.pedidos360.productos.controller;

import com.pedidos360.productos.dto.ProductoRequest;
import com.pedidos360.productos.dto.ProductoResponse;
import com.pedidos360.productos.model.Producto;
import com.pedidos360.productos.repository.ProductoRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoRepository repository;

    public ProductoController(ProductoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ProductoResponse> listar(@RequestParam(required = false) String q) {
        List<Producto> productos = (q == null || q.isBlank())
                ? repository.findAll()
                : repository.findByNombreContainingIgnoreCase(q);
        return productos.stream().map(ProductoResponse::from).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponse> obtener(@PathVariable Long id) {
        return repository.findById(id)
                .map(ProductoResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody ProductoRequest request) {
        Producto producto = new Producto(
                request.nombre(),
                request.descripcion(),
                request.precio(),
                request.stock()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(ProductoResponse.from(repository.save(producto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoResponse> actualizar(@PathVariable Long id, @Valid @RequestBody ProductoRequest request) {
        return repository.findById(id).map(existente -> {
            existente.setNombre(request.nombre());
            existente.setDescripcion(request.descripcion());
            existente.setPrecio(request.precio());
            existente.setStock(request.stock());
            return ResponseEntity.ok(ProductoResponse.from(repository.save(existente)));
        }).orElse(ResponseEntity.notFound().build());
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