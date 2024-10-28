const AuthorsController = () => import('#controllers/authors_controller')
import Author from '#models/author'
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.get('/', [AuthorsController, 'index'])
    router.get('/slugs/:slug', [AuthorsController, 'getBySlug'])
    router.get('/:id', [AuthorsController, 'getById']).where('id', router.matchers.number())

    router
      .group(() => {
        router.post('/', [AuthorsController, 'create'])
        router.post('/multiple', [AuthorsController, 'createMultiple'])
        router
          .patch('/:id', [AuthorsController, 'update'])
          .where('id', router.matchers.number())
          .use(middleware.resourceExists({ resource: Author }))
      })
      .use(middleware.resourceManipulation())
  })
  .prefix('/api/authors')
