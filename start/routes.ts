/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const HealthChecksController = () => import('#controllers/health_checks_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router.get('/health', [HealthChecksController, 'handle']).use(middleware.serverMonitor())
router.get('/ping', [HealthChecksController, 'ping'])
