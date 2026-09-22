import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService, Cliente, Pedido, Producto } from '../../services/api.service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Pedidos</h2>

    <form [formGroup]="form" (ngSubmit)="crearPedido()" class="card">
      <select formControlName="clienteId" required>
        <option [ngValue]="null" disabled>Selecciona un cliente</option>
        <option *ngFor="let c of clientes" [ngValue]="c.id">{{ c.nombre }} ({{ c.email }})</option>
      </select>

      <div formArrayName="items">
        <div *ngFor="let item of items.controls; let i = index" [formGroupName]="i" class="row">
          <select formControlName="productoId" required>
            <option [ngValue]="null" disabled>Producto</option>
            <option *ngFor="let p of productos" [ngValue]="p.id">{{ p.nombre }} — &#36;{{ p.precio }}</option>
          </select>
          <input formControlName="cantidad" type="number" min="1" value="1" placeholder="Cant." />
          <button type="button" class="danger" (click)="quitarItem(i)">×</button>
        </div>
      </div>

      <div class="row">
        <button type="button" (click)="agregarItem()">+ Agregar ítem</button>
        <button type="submit" class="primary">Crear pedido</button>
      </div>
    </form>

    <table>
      <thead>
        <tr><th>ID</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Fecha</th><th></th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let p of pedidos">
          <td>{{ p.id }}</td>
          <td>{{ p.clienteId }} <span *ngIf="p.clienteEmail">({{ p.clienteEmail }})</span></td>
          <td>&#36;{{ p.total | number: '1.0-0' }}</td>
          <td>
            <select [value]="p.estado" (change)="cambiarEstado(p, $event)">
              <option *ngFor="let e of estados" [value]="e">{{ e }}</option>
            </select>
          </td>
          <td>{{ p.fechaCreacion | date: 'short' }}</td>
          <td><button class="danger" (click)="eliminar(p.id)">Eliminar</button></td>
        </tr>
      </tbody>
    </table>

    <p class="error" *ngIf="error">{{ error }}</p>
  `,
  styles: [`
    .card { display: grid; gap: 8px; padding: 16px; }
    .row { display: flex; gap: 8px; align-items: center; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #eef2f7; }
    button.primary { background: #2563eb; color: #fff; }
    button.danger { background: #dc2626; color: #fff; }
    .error { color: #dc2626; }
  `],
})
export class PedidosPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  pedidos: Pedido[] = [];
  clientes: Cliente[] = [];
  productos: Producto[] = [];
  estados = ['PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];
  error = '';

  form = this.fb.group({
    clienteId: [null as number | null, Validators.required],
    items: this.fb.array([]),
  });

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.api.getPedidos().subscribe((data) => (this.pedidos = data));
    this.api.getClientes().subscribe((data) => (this.clientes = data));
    this.api.getProductos().subscribe((data) => (this.productos = data));
  }

  agregarItem(): void {
    this.items.push(
      this.fb.group({
        productoId: [null as number | null, Validators.required],
        cantidad: [1, [Validators.required, Validators.min(1)]],
      })
    );
  }

  quitarItem(i: number): void {
    this.items.removeAt(i);
  }

  crearPedido(): void {
    if (this.form.invalid) return;
    const raw = this.form.value;

    const items = (raw.items as Array<{ productoId: number; cantidad: number }>).map((i) => {
      const producto = this.productos.find((p) => p.id === i.productoId);
      return {
        productoId: i.productoId,
        nombreProducto: producto?.nombre,
        cantidad: i.cantidad,
        precioUnitario: producto ? Number(producto.precio) : 0,
      };
    });

    const cliente = this.clientes.find((c) => c.id === raw.clienteId);

    this.api.crearPedido({
      clienteId: raw.clienteId!,
      clienteEmail: cliente?.email,
      items,
    }).subscribe({
      next: () => {
        this.form.reset();
        this.items.clear();
        this.cargar();
      },
      error: () => (this.error = 'No se pudo crear el pedido.'),
    });
  }

  cambiarEstado(p: Pedido, event: Event): void {
    const estado = (event.target as HTMLSelectElement).value;
    this.api.cambiarEstadoPedido(p.id, estado).subscribe({
      next: () => this.cargar(),
      error: () => (this.error = 'No se pudo cambiar el estado.'),
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar pedido?')) return;
    this.api.eliminarPedido(id).subscribe({
      next: () => this.cargar(),
      error: () => (this.error = 'No se pudo eliminar el pedido.'),
    });
  }
}