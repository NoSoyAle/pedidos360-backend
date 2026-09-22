import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../api.base';

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
}

export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
}

export interface ItemPedidoDto {
  productoId: number;
  nombreProducto?: string;
  cantidad: number;
  precioUnitario: number;
}

export interface PedidoRequest {
  clienteId: number;
  clienteEmail?: string;
  items: ItemPedidoDto[];
}

export interface Pedido {
  id: number;
  clienteId: number;
  clienteEmail?: string;
  estado: string;
  total: number;
  fechaCreacion: string;
  items: Array<{
    id: number;
    productoId: number;
    nombreProducto?: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }>;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  // PRODUCTOS (productos-service)
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${API_BASE}/api/productos`);
  }

  getProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${API_BASE}/api/productos/${id}`);
  }

  crearProducto(p: Omit<Producto, 'id'>): Observable<Producto> {
    return this.http.post<Producto>(`${API_BASE}/api/productos`, p);
  }

  actualizarProducto(id: number, p: Omit<Producto, 'id'>): Observable<Producto> {
    return this.http.put<Producto>(`${API_BASE}/api/productos/${id}`, p);
  }

  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/api/productos/${id}`);
  }

  // CLIENTES (clientes-service)
  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${API_BASE}/api/clientes`);
  }

  crearCliente(c: Omit<Cliente, 'id'>): Observable<Cliente> {
    return this.http.post<Cliente>(`${API_BASE}/api/clientes`, c);
  }

  eliminarCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/api/clientes/${id}`);
  }

  // PEDIDOS (pedidos-service)
  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${API_BASE}/api/pedidos`);
  }

  crearPedido(p: PedidoRequest): Observable<Pedido> {
    return this.http.post<Pedido>(`${API_BASE}/api/pedidos`, p);
  }

  cambiarEstadoPedido(id: number, estado: string): Observable<Pedido> {
    return this.http.patch<Pedido>(`${API_BASE}/api/pedidos/${id}/estado`, { estado });
  }

  eliminarPedido(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/api/pedidos/${id}`);
  }
}