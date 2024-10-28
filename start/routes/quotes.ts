const QuotesController = () => import('#controllers/quotes_controller')
import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.get('/', [QuotesController, 'index'])
    router.get('/random', [QuotesController, 'getRandomQuotes'])
    router.get('/:id', [QuotesController, 'getById']).where('id', router.matchers.number())
  })
  .prefix('/api/quotes')

router.get('/api', [QuotesController, 'getRandom'])
