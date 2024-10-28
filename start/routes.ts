/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const HealthChecksController = () => import('#controllers/health_checks_controller')
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

import '#start/routes/authors'
import '#start/routes/quotes'
import '#start/routes/tags'

router.get('/health', [HealthChecksController, 'handle']).use(middleware.serverMonitor())
router.get('/ping', [HealthChecksController, 'ping'])
