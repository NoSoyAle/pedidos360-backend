import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService, Producto } from '../../services/api.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Productos</h2>

    <form [formGroup]="form" (ngSubmit)="guardar()" class="card">
      <input formControlName="nombre" placeholder="Nombre" required />
      <input formControlName="descripcion" placeholder="Descripción" />
      <input formControlName="precio" type="number" step="0.01" min="0" placeholder="Precio" required />
      <input formControlName="stock" type="number" min="0" placeholder="Stock" required />
      <div class="row">
        <button type="submit" class="primary">{{ editandoId ? 'Actualizar' : 'Crear' }}</button>
        <button type="button" (click)="cancelar()" *ngIf="editandoId">Cancelar</button>
      </div>
    </form>

    <table>
      <thead>
        <tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Precio</th><th>Stock</th><th></th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let p of productos">
          <td>{{ p.id }}</td>
          <td>{{ p.nombre }}</td>
          <td>{{ p.descripcion }}</td>
          <td>{{ p.precio | number: '1.0-2' }}</td>
          <td>{{ p.stock }}</td>
          <td>
            <button (click)="editar(p)">Editar</button>
            <button class="danger" (click)="eliminar(p.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p class="error" *ngIf="error">{{ error }}</p>
  `,
  styles: [`
    .card { display: grid; gap: 8px; padding: 16px; }
    .row { display: flex; gap: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #eef2f7; }
    button.primary { background: #2563eb; color: #fff; }
    button.danger { background: #dc2626; color: #fff; }
    .error { color: #dc2626; }
  `],
})
export class ProductosPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  productos: Producto[] = [];
  editandoId: number | null = null;
  error = '';

  form = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.api.getProductos().subscribe({
      next: (data) => (this.productos = data),
      error: () => (this.error = 'No se pudieron cargar los productos.'),
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    const value = this.form.value as Omit<Producto, 'id'>;
    const request = this.editandoId
      ? this.api.actualizarProducto(this.editandoId, value)
      : this.api.crearProducto(value);
    request.subscribe({
      next: () => {
        this.editandoId = null;
        this.form.reset();
        this.cargar();
      },
      error: () => (this.error = 'No se pudo guardar el producto.'),
    });
  }

  editar(p: Producto): void {
    this.editandoId = p.id;
    this.form.patchValue({
      nombre: p.nombre,
      descripcion: p.descripcion ?? '',
      precio: p.precio,
      stock: p.stock,
    });
  }

  cancelar(): void {
    this.editandoId = null;
    this.form.reset();
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar producto?')) return;
    this.api.eliminarProducto(id).subscribe({
      next: () => this.cargar(),
      error: () => (this.error = 'No se pudo eliminar el producto.'),
    });
  }
}