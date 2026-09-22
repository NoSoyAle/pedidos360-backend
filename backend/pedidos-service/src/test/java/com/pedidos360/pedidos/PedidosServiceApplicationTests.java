package com.pedidos360.pedidos;

import com.pedidos360.pedidos.controller.PedidoController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@ActiveProfiles("test")
class PedidosServiceApplicationTests {

    @Autowired
    private PedidoController controller;

    @Test
    void contextLoads() {
        assertNotNull(controller);
    }
}