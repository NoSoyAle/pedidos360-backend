package com.pedidos360.productos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.pedidos360.productos", "com.pedidos360.security"})
public class ProductosServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProductosServiceApplication.class, args);
    }
}