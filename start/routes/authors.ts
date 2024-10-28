const AuthorsController = () => import('#controllers/authors_controller')
import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.get('/', [AuthorsController, 'index'])
    router.get('/slugs/:slug', [AuthorsController, 'getBySlug'])
    router.get('/:id', [AuthorsController, 'getById']).where('id', router.matchers.number())
    router.post('/', [AuthorsController, 'create'])
    router.post('/multiple', [AuthorsController, 'createMultiple'])
  })
  .prefix('/api/authors')

// TODO: handle authorization
