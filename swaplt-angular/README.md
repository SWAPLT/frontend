# Documentación Técnica - Frontend SWAPLT

## 1. Introducción General

### Descripción del Proyecto
SWAPLT es una aplicación web moderna desarrollada con Angular que sirve como plataforma de intercambio y gestión de servicios. El frontend proporciona una interfaz de usuario intuitiva y responsiva para interactuar con el backend de la aplicación.

### Propósito del Frontend
El frontend de SWAPLT está diseñado para ofrecer una experiencia de usuario fluida y eficiente, permitiendo a los usuarios gestionar sus intercambios, visualizar estadísticas y administrar sus perfiles de manera intuitiva.

### Tecnologías Utilizadas
- **Framework Principal**: Angular 14.2.0
- **Lenguaje**: TypeScript 4.7.2
- **Gestión de Estado**: RxJS 7.5.0
- **UI/UX**:
  - Bootstrap 5.3.5
  - FontAwesome 6.7.2
  - ngx-toastr 14.2.1
- **Gráficos**: 
  - Chart.js 3.9.1
  - ng2-charts 4.0.1
- **Autenticación**: 
  - @auth0/angular-jwt 5.2.0
  - jwt-decode 4.0.0
- **Utilidades**:
  - date-fns 4.1.0
  - Google Maps Integration (@angular/google-maps)

### Estructura General del Proyecto
```
swaplt-angular/
├── src/
│   ├── app/
│   │   ├── admin/           # Módulo de administración
│   │   ├── components/      # Componentes reutilizables
│   │   ├── directives/      # Directivas personalizadas
│   │   ├── guards/          # Guards de autenticación
│   │   ├── interceptors/    # Interceptores HTTP
│   │   ├── models/          # Interfaces y tipos
│   │   ├── pages/           # Componentes de página
│   │   ├── services/        # Servicios de la aplicación
│   │   └── shared/          # Módulos y componentes compartidos
│   ├── assets/             # Recursos estáticos
│   └── environments/       # Configuraciones de entorno
├── angular.json            # Configuración de Angular
└── package.json           # Dependencias del proyecto
```

## 2. Instalación y Ejecución del Proyecto

### Requisitos Previos
- Node.js (versión LTS recomendada)
- npm (incluido con Node.js)
- Angular CLI (`npm install -g @angular/cli`)

### Pasos de Instalación
1. Clonar el repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd swaplt-angular
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm start
   # o
   ng serve
   ```

### Comandos Comunes
- `npm start` o `ng serve`: Inicia el servidor de desarrollo
- `ng build`: Compila la aplicación para producción
- `ng test`: Ejecuta las pruebas unitarias
- `ng e2e`: Ejecuta las pruebas end-to-end
- `ng generate component [nombre]`: Genera un nuevo componente
- `ng generate service [nombre]`: Genera un nuevo servicio

## 3. Arquitectura del Proyecto

### Descripción de Carpetas Principales

#### `/src/app`
- **admin/**: Módulo de administración con funcionalidades específicas para administradores
- **components/**: Componentes reutilizables de la aplicación
- **directives/**: Directivas personalizadas de Angular
- **guards/**: Guards para protección de rutas
- **interceptors/**: Interceptores HTTP para manejo de peticiones
- **models/**: Interfaces y tipos TypeScript
- **pages/**: Componentes principales de página
- **services/**: Servicios de la aplicación
- **shared/**: Módulos y componentes compartidos

### Convenciones de Nombres
- **Componentes**: PascalCase (ej: `UserProfileComponent`)
- **Servicios**: PascalCase con sufijo 'Service' (ej: `AuthService`)
- **Interfaces**: PascalCase con prefijo 'I' (ej: `IUser`)
- **Archivos de Componente**: kebab-case (ej: `user-profile.component.ts`)
- **Variables y Métodos**: camelCase
- **Constantes**: UPPER_SNAKE_CASE

## 4. Routing

### Sistema de Rutas
El enrutamiento de la aplicación está configurado en `app-routing.module.ts`. La aplicación utiliza lazy loading para optimizar el rendimiento.

### Rutas Principales
```typescript
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard]
  },
  // Otras rutas...
];
```

### Protección de Rutas
- Se utilizan guards para proteger rutas que requieren autenticación
- Implementación de interceptores para manejo de tokens JWT

## 5. Componentes

### Componentes Principales
1. **AppComponent** (`app.component.ts`)
   - Componente raíz de la aplicación
   - Maneja el layout principal y la navegación

2. **Componentes de Autenticación**
   - LoginComponent
   - RegisterComponent
   - ProfileComponent

3. **Componentes de Administración**
   - DashboardComponent
   - UserManagementComponent
   - StatisticsComponent

### Ejemplo de Componente
```typescript
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  @Input() userId: string;
  @Output() profileUpdated = new EventEmitter<void>();

  // Implementación...
}
```

## 6. Servicios

### Servicios Principales
1. **AuthService**
   - Gestión de autenticación
   - Manejo de tokens JWT
   - Métodos de login/logout

2. **UserService**
   - Gestión de usuarios
   - Operaciones CRUD de perfiles

3. **ApiService**
   - Servicio base para llamadas HTTP
   - Manejo de interceptores

### Ejemplo de Uso de Servicio
```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(credentials: ILoginCredentials): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>('/api/auth/login', credentials);
  }
}
```

## 7. Gestión de Estado

### Implementación Actual
- Uso de RxJS BehaviorSubject para estado global
- Servicios como fuente única de verdad
- Patrón Observable para reactividad

### Ejemplo de Estado Global
```typescript
@Injectable({
  providedIn: 'root'
})
export class StateService {
  private userState = new BehaviorSubject<IUser | null>(null);
  user$ = this.userState.asObservable();

  updateUser(user: IUser) {
    this.userState.next(user);
  }
}
```

## 8. Autenticación

### Implementación
- JWT almacenado en localStorage
- Interceptor HTTP para inyección automática de tokens
- Guards para protección de rutas

### Flujo de Autenticación
1. Usuario ingresa credenciales
2. Backend valida y devuelve JWT
3. Token almacenado en localStorage
4. Interceptor añade token a peticiones
5. Guards verifican autenticación en rutas protegidas

## 9. Interacción con el Backend

### Configuración
- URL base: `http://localhost:8000/api`
- Interceptores para manejo de errores
- Tipado fuerte con interfaces

### Ejemplos de Peticiones
```typescript
// GET
this.http.get<IUser>('/api/users/profile')

// POST
this.http.post<IAuthResponse>('/api/auth/login', credentials)

// PUT
this.http.put<IUser>('/api/users/update', userData)

// DELETE
this.http.delete('/api/users/delete')
```

## 10. Pruebas

### Pruebas Unitarias
- Framework: Jasmine
- Runner: Karma
- Comando: `ng test`

### Pruebas E2E
- Framework: Protractor
- Comando: `ng e2e`

## 11. Entorno de Producción

### Build
```bash
ng build --configuration production
```

### Archivos de Entorno
- `environment.ts`: Desarrollo
- `environment.prod.ts`: Producción

### Configuraciones
- CORS configurado en backend
- URLs de API por entorno
- Variables de entorno para servicios externos

## 12. Buenas Prácticas Aplicadas

### Código Limpio
- Principios SOLID
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)

### Optimizaciones
- Lazy loading de módulos
- Componentes reutilizables
- Interceptores para caché
- Compresión de assets

### Accesibilidad
- ARIA labels
- Contraste adecuado
- Navegación por teclado
- Textos alternativos

## 13. Errores Comunes y Debugging

### Errores Frecuentes
1. **CORS**
   - Verificar configuración en backend
   - Revisar headers en peticiones

2. **Autenticación**
   - Validar token JWT
   - Verificar expiración
   - Comprobar localStorage

### Herramientas de Debugging
- Chrome DevTools
- Angular DevTools
- Console logging
- Network tab para peticiones

## 14. Autoría y Licencia

### Autor
[Jesus Carrasco Toscano]

### Versión
1.0.0 (Fecha: 14/05/2025)
