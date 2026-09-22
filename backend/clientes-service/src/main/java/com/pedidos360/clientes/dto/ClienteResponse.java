package com.pedidos360.clientes.dto;

import com.pedidos360.clientes.model.Cliente;

import java.time.LocalDateTime;

public record ClienteResponse(
        Long id,
        String nombre,
        String email,
        String telefono,
        String direccion,
        String azureOid,
        LocalDateTime fechaCreacion
) {
    public static ClienteResponse from(Cliente c) {
        return new ClienteResponse(
                c.getId(),
                c.getNombre(),
                c.getEmail(),
                c.getTelefono(),
                c.getDireccion(),
                c.getAzureOid(),
                c.getFechaCreacion()
        );
    }
}