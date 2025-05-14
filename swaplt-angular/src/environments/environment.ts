// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  apiUrl: 'http://laravel.swaplt-compraventa.duckdns.org/api', // Ajustar a la URL real de producción
  googleMapsApiKey: 'AIzaSyCIzQc-xMyVBcN04ZyjRrTSTLQZwVycUe0', // Usar la misma clave que en desarrollo
  googleTranslateApiKey: 'AIzaSyAMY8sX9zAq2pKrREO_mByynsbVAsfOaJ0' // Debes reemplazar con tu clave real de Google Translate API
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
