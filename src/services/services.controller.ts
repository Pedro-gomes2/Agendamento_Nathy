import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dtos/create-service.dto';
import { UpdateServiceDto } from './dtos/update-service.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../entities/user.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/services',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Criar novo serviço',
    description: 'Apenas admin pode criar serviços. Suporta upload de imagem.',
  })
  async create(
    @Body() createServiceDto: CreateServiceDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000000 }),
          new FileTypeValidator({ fileType: '.(png|jpg|jpeg)$' }),
        ],
        fileIsRequired: false,
      }),
    )
    imageFile?: Express.Multer.File,
  ) {
    return this.servicesService.create(createServiceDto, imageFile);
  }

  @Get('list/paginated')
  @ApiOperation({
    summary: 'Listar serviços com paginação',
    description: 'Rota pública - retorna serviços ativos com paginação',
  })
  async findAllPaginated(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const pagination = new PaginationDto();
    if (page) pagination.page = Math.max(1, parseInt(page, 10) || 1);
    if (limit) pagination.limit = Math.min(100, Math.max(5, parseInt(limit, 10) || 20));
    if (sortBy) pagination.sortBy = sortBy;
    if (sortOrder) pagination.sortOrder = (sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC');
    return this.servicesService.findAllPaginated(pagination);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os serviços',
    description: 'Rota pública - retorna todos os serviços ativos',
  })
  async findAll() {
    return this.servicesService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ID do serviço' })
  @ApiOperation({
    summary: 'Obter dados de um serviço',
    description: 'Rota pública',
  })
  async findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/services',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'ID do serviço' })
  @ApiOperation({
    summary: 'Atualizar um serviço',
  })
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000000 }),
          new FileTypeValidator({ fileType: '.(png|jpg|jpeg)$' }),
        ],
        fileIsRequired: false,
      }),
    )
    imageFile?: Express.Multer.File,
  ) {
    return this.servicesService.update(id, updateServiceDto, imageFile);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'id', description: 'ID do serviço' })
  @ApiOperation({
    summary: 'Deletar um serviço (soft delete)',
    description: 'Marca como inativo ao invés de deletar permanentemente',
  })
  async delete(@Param('id') id: string) {
    await this.servicesService.delete(id);
    return { message: 'Serviço deletado com sucesso' };
  }
}
