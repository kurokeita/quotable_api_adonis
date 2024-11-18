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
import '#start/routes/authors'
import '#start/routes/quotes'
import '#start/routes/tags'
import router from '@adonisjs/core/services/router'

const FileController = () => import('#controllers/file_controller')

router.get('/health', [HealthChecksController, 'handle']).use(middleware.serverMonitor())
router.get('/ping', [HealthChecksController, 'ping'])

router.post('/api/upload', [FileController, 'upload']).use(middleware.resourceManipulation())
