const AuthorsController = () => import('#controllers/authors_controller')
import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.get('/', [AuthorsController, 'index'])
    router.get('/slugs/:slug', [AuthorsController, 'getBySlug'])
    router.get('/:id', [AuthorsController, 'getById']).where('id', router.matchers.number())
  })
  .prefix('/api/authors')
