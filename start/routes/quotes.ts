const QuotesController = () => import('#controllers/quotes_controller')
import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.get('/', [QuotesController, 'index'])
  })
  .prefix('/api/quotes')

router.get('/api', [QuotesController, 'getRandom'])
