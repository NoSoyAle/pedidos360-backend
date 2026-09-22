package com.pedidos360.clientes.controller;

import com.pedidos360.clientes.dto.ClienteRequest;
import com.pedidos360.clientes.dto.ClienteResponse;
import com.pedidos360.clientes.model.Cliente;
import com.pedidos360.clientes.repository.ClienteRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteRepository repository;

    public ClienteController(ClienteRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ClienteResponse> listar() {
        return repository.findAll().stream().map(ClienteResponse::from).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponse> obtener(@PathVariable Long id) {
        return repository.findById(id)
                .map(ClienteResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ClienteResponse> porEmail(@PathVariable String email) {
        return repository.findByEmailIgnoreCase(email)
                .map(ClienteResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ClienteResponse> crear(@Valid @RequestBody ClienteRequest request) {
        if (repository.findByEmailIgnoreCase(request.email()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        Cliente cliente = new Cliente(
                request.nombre(),
                request.email(),
                request.telefono(),
                request.direccion(),
                request.azureOid()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(ClienteResponse.from(repository.save(cliente)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteResponse> actualizar(@PathVariable Long id, @Valid @RequestBody ClienteRequest request) {
        return repository.findById(id).map(existente -> {
            existente.setNombre(request.nombre());
            existente.setEmail(request.email());
            existente.setTelefono(request.telefono());
            existente.setDireccion(request.direccion());
            if (request.azureOid() != null) {
                existente.setAzureOid(request.azureOid());
            }
            return ResponseEntity.ok(ClienteResponse.from(repository.save(existente)));
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