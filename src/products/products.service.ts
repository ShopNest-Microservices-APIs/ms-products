import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  onModuleInit() {
    this.$connect();
    this.logger.log('Connected to the database');
  }

  create(createProductDto: CreateProductDto) {
    try {
      return this.product.create({ data: createProductDto });
    } catch (error) {
      throw new RpcException({
        message: error,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const total = await this.product.count({ where: { available: true } });
    const lastPage = Math.ceil(total / limit);

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { available: true },
      }),
      metadata: {
        page,
        lastPage,
        total,
      },
    };
  }

  async findOne(id: number) {
    return this.product
      .findUnique({ where: { id, available: true } })
      .then((product) => {
        if (!product) {
          throw new RpcException({
            message: `Product with id: ${id} not found`,
            status: HttpStatus.BAD_REQUEST,
          });
        }
        return product;
      });
  }

  async update(updateProductDto: UpdateProductDto) {
    const isDtoEmpty = Object.values(updateProductDto).every(
      (value) => value === null || value === undefined,
    );

    if (isDtoEmpty) {
      throw new RpcException({
        message: 'No data provided for update',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const { id, ...data } = updateProductDto;

    return await this.product
      .update({
        where: { id },
        data: data,
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          throw new RpcException({
            message: `Product with id: ${id} not found`,
            status: HttpStatus.NOT_FOUND,
          });
        }
        throw error;
      });
  }

  async remove(id: number) {
    return this.product
      .update({
        where: { id, available: true },
        data: { available: false },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          throw new RpcException({
            message: `Product with id: ${id} not found`,
            status: HttpStatus.NOT_FOUND,
          });
        }
        throw error;
      });
  }
}
