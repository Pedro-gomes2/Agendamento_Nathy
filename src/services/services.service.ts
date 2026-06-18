import {
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { Service } from '../entities/service.entity';
import { CreateServiceDto } from './dtos/create-service.dto';
import { UpdateServiceDto } from './dtos/update-service.dto';
import { PaginationDto, PaginatedResponse } from '../common/dtos/pagination.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(
    createServiceDto: CreateServiceDto,
    imageFile?: Express.Multer.File,
  ): Promise<Service> {
    let imageUrl: string | undefined;

    if (imageFile) {
      imageUrl = `/uploads/services/${imageFile.filename}`;
    } else if (createServiceDto.image_url) {
      imageUrl = createServiceDto.image_url;
    }

    const service = new Service();
    service.name = createServiceDto.name;
    service.description = createServiceDto.description || undefined;
    service.price = createServiceDto.price;
    service.duration = createServiceDto.duration || 60;
    service.image_url = imageUrl;
    service.is_active = true;

    const result = await this.servicesRepository.save(service);

    // Invalidate cache
    await this.cacheManager.del('services:all');

    return result;
  }

  async findAll(): Promise<Service[]> {
    const cached = await this.cacheManager.get<Service[]>('services:all');
    if (cached) {
      return cached;
    }

    const services = await this.servicesRepository.find({
      where: { is_active: true },
      order: { created_at: 'DESC' },
    });

    await this.cacheManager.set('services:all', services, 5 * 60 * 1000);
    return services;
  }

  async findAllPaginated(
    pagination: PaginationDto,
  ): Promise<PaginatedResponse<Service>> {
    const skip = (pagination.page - 1) * pagination.limit;

    const orderObj: any = {};
    const allowedSortFields = ['id', 'name', 'price', 'duration', 'created_at', 'updated_at', 'is_active'];
    const sortBy = allowedSortFields.includes(pagination.sortBy) ? pagination.sortBy : 'created_at';
    orderObj[sortBy] = pagination.sortOrder || 'DESC';

    const [services, total] = await this.servicesRepository.findAndCount({
      where: { is_active: true },
      skip,
      take: pagination.limit,
      order: orderObj,
    });

    return {
      data: services,
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages: Math.ceil(total / pagination.limit),
    };
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.servicesRepository.findOne({
      where: { id, is_active: true },
    });

    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    return service;
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
    imageFile?: Express.Multer.File,
  ): Promise<Service> {
    const service = await this.findOne(id);

    if (updateServiceDto.name) service.name = updateServiceDto.name;
    if (updateServiceDto.description !== undefined)
      service.description = updateServiceDto.description;
    if (updateServiceDto.price) service.price = updateServiceDto.price;
    if (updateServiceDto.duration)
      service.duration = updateServiceDto.duration;

    if (imageFile) {
      service.image_url = `/uploads/services/${imageFile.filename}`;
    }

    const result = await this.servicesRepository.save(service);

    // Invalidate cache
    await this.cacheManager.del('services:all');

    return result;
  }

  async delete(id: string): Promise<void> {
    const service = await this.findOne(id);
    service.is_active = false;
    await this.servicesRepository.save(service);

    // Invalidate cache
    await this.cacheManager.del('services:all');
  }
}
