import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService, Cliente } from '../../services/api.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Clientes</h2>

    <form [formGroup]="form" (ngSubmit)="guardar()" class="card">
      <input formControlName="nombre" placeholder="Nombre" required />
      <input formControlName="email" type="email" placeholder="Email" required />
      <input formControlName="telefono" placeholder="Teléfono" />
      <input formControlName="direccion" placeholder="Dirección" />
      <button type="submit" class="primary">Crear cliente</button>
    </form>

    <table>
      <thead>
        <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th></th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let c of clientes">
          <td>{{ c.id }}</td>
          <td>{{ c.nombre }}</td>
          <td>{{ c.email }}</td>
          <td>{{ c.telefono }}</td>
          <td><button class="danger" (click)="eliminar(c.id)">Eliminar</button></td>
        </tr>
      </tbody>
    </table>

    <p class="error" *ngIf="error">{{ error }}</p>
  `,
  styles: [`
    .card { display: grid; gap: 8px; padding: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #eef2f7; }
    button.primary { background: #2563eb; color: #fff; }
    button.danger { background: #dc2626; color: #fff; }
    .error { color: #dc2626; }
  `],
})
export class ClientesPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  clientes: Cliente[] = [];
  error = '';

  form = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    direccion: [''],
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.api.getClientes().subscribe({
      next: (data) => (this.clientes = data),
      error: () => (this.error = 'No se pudieron cargar los clientes.'),
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    const value = this.form.value as Omit<Cliente, 'id'>;
    this.api.crearCliente(value).subscribe({
      next: () => {
        this.form.reset();
        this.cargar();
      },
      error: () => (this.error = 'No se pudo crear el cliente.'),
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar cliente?')) return;
    this.api.eliminarCliente(id).subscribe({
      next: () => this.cargar(),
      error: () => (this.error = 'No se pudo eliminar el cliente.'),
    });
  }
}