import { BrowserCacheLocation, InteractionType, LogLevel, PublicClientApplication, type Configuration } from '@azure/msal-browser';
import type { ProtectedResourceScopes, MsalGuardConfiguration, MsalInterceptorConfiguration } from '@azure/msal-angular';

/**
 * IDaaS: Microsoft Entra ID (Azure AD).
 *
 * Rellena estos valores con los del tenant que configuraste en Entra ID:
 *  - AZURE_TENANT_ID   : id del tenant (Directory (tenant) ID)
 *  - AZURE_CLIENT_ID   : Client ID de la aplicación registrada (single-page application)
 *  - AZURE_API_SCOPE   : scope del token para tu API (ej: api://<client-id>/access_as_user)
 *
 * En desarrollo puedes sobreescribirlos creando src/assets/config.json o variables de entorno.
 */
export const authConfig: Configuration = {
  auth: {
    clientId: '5cd80da2-4880-475f-8d55-8e448ea3bf6d',
    authority: 'https://login.microsoftonline.com/e6ec1370-abd7-4bb3-8deb-8834e6989a27',
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
  },
  system: {
    loggerOptions: {
      loggerCallback(_logLevel, message) {
        console.debug(message);
      },
      piiLoggingEnabled: false,
    },
  },
};

export const pca = new PublicClientApplication(authConfig);

/** Scopes protegidos por el API Gateway / microservicios (Resource Server). */
export const protectedResourceMap = new Map<string, Array<string | ProtectedResourceScopes>>([
  ['api://5cd80da2-4880-475f-8d55-8e448ea3bf6d/Pedidos', ['api://5cd80da2-4880-475f-8d55-8e448ea3bf6d/Pedidos']],
]);

/** Scopes solicitados al iniciar sesión / renovar token. */
export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
};

export const tokenRequest = {
  scopes: ['openid', 'profile', 'email'],
};

/** Configuración del Guard de rutas (solicita login si no hay sesión). */
export const msalGuardConfig: MsalGuardConfiguration = {
  interactionType: InteractionType.Redirect,
  authRequest: loginRequest,
};

/** Configuración del interceptor HTTP (adjunta el token a llamadas protegidas). */
export const msalInterceptorConfig: MsalInterceptorConfiguration = {
  interactionType: InteractionType.Redirect,
  protectedResourceMap,
};