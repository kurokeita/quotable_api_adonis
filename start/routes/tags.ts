const TagsController = () => import('#controllers/tags_controller')
import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.get('/', [TagsController, 'index'])
  })
  .prefix('/api/tags')
