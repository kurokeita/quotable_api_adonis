const QuotesController = () => import('#controllers/quotes_controller')
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.get('/', [QuotesController, 'index'])
    router.get('/random', [QuotesController, 'getRandomQuotes'])
    router.get('/:id', [QuotesController, 'getById']).where('id', router.matchers.number())

    router
      .group(() => {
        router.post('/', [QuotesController, 'create'])
        router.patch('/:id', [QuotesController, 'update'])
      })
      .middleware(middleware.resourceManipulation())
  })
  .prefix('/api/quotes')

router.get('/api', [QuotesController, 'getRandom'])
