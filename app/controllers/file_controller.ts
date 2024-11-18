import UploadService from '#services/quotes/upload_service'
import { jsonFileValidator } from '#validators/files'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

export default class FileController {
  @inject()
  async upload({ request }: HttpContext, service: UploadService) {
    const { file } = await request.validateUsing(jsonFileValidator)

    return await service.handle(file)
  }
}
