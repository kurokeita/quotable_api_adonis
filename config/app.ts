import env from '#start/env'
import { Secret } from '@adonisjs/core/helpers'
import { defineConfig } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

/**
 * The app key is used for encrypting cookies, generating signed URLs,
 * and by the "encryption" module.
 *
 * The encryption module will fail to decrypt data if the key is lost or
 * changed. Therefore it is recommended to keep the app key secure.
 */
export const appKey = new Secret(env.get('APP_KEY'))

/**
 * The configuration settings used by the HTTP server
 */
export const http = defineConfig({
  generateRequestId: true,
  allowMethodSpoofing: false,

  /**
   * Enabling async local storage will let you access HTTP context
   * from anywhere inside your application.
   */
  useAsyncLocalStorage: false,

  /**
   * Manage cookies configuration. The settings for the session id cookie are
   * defined inside the "config/session.ts" file.
   */
  cookie: {
    domain: '',
    path: '/',
    maxAge: '2h',
    httpOnly: true,
    secure: app.inProduction,
    sameSite: 'lax',
  },
  qs: {
    parse: {
      /**
       * Nesting depth till the parameters should be parsed.
       *
       * Defaults to 5
       */
      depth: 5,
      /**
       * Number of parameters to parse.
       *
       * Defaults to 1000
       */
      parameterLimit: 1000,
      /**
       * Allow sparse elements in an array.
       *
       * Defaults to false
       */
      allowSparse: false,
      /**
       * The max limimit for the array indices. After the given limit
       * the array indices will be converted to an object, where the
       * index is the key.
       *
       * Defaults to 20
       */
      arrayLimit: 20,
      /**
       * Join comma seperated query string values to an array
       *
       * Defaults to false
       */
      comma: false,
    },
    stringify: {
      /**
       * URI encode the stringified query string
       *
       * Defaults to true
       */
      encode: true,
      /**
       * URI encode but only the values and not the keys
       *
       * Defaults to false
       */
      encodeValuesOnly: false,
      /**
       * Define the format in which arrays should be serialized.
       *
       * - indices:   a[0]=b&a[1]=c
       * - brackets:  a[]=b&a[]=c
       * - repeat:    a=b&a=c
       * - comma:     a=b,c
       *
       * Defaults to "indices"
       */
      arrayFormat: 'indices',
      /**
       * Whether or not to skip null values when serializing. When set to
       * false, the null values will be treated as an empty string.
       *
       * Defaults to: false
       */
      skipNulls: false,
    },
  },
})
