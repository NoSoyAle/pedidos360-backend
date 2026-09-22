package com.pedidos360.productos;

import com.pedidos360.productos.controller.ProductoController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@ActiveProfiles("test")
class ProductosServiceApplicationTests {

    @Autowired
    private ProductoController controller;

    @Test
    void contextLoads() {
        assertNotNull(controller);
    }
}