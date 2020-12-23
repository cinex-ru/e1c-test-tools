import {
    Controller, Get, Param, Body, Post, Query, Logger, Put,
} from '@nestjs/common';
import { GeneralTaskRequest } from './interfaces/task-request.interface';
import { CreateTaskRequestDto } from './dto/create-task-request.dto';
import { TaskRequestsService } from './task-requests.service';
import { TaskRequestStatus } from './task-request-status';
import { UpdateTaskRequestDto } from './dto/update-task-request.dto';

@Controller('task-requests')
export class TaskRequestsController {
    private logger = new Logger('TaskRequestsController');

    // eslint-disable-next-line no-unused-vars
    constructor(private taskRequestsService: TaskRequestsService) {}

    @Get(':id')
    findOne(@Param() params: any): GeneralTaskRequest {
        return this.taskRequestsService.findOne(params.id);
    }

    @Get()
    findAll(@Query('status') status: TaskRequestStatus, @Query('limit') limit: number): GeneralTaskRequest[] {
        let result: GeneralTaskRequest[] = [];
        if (status) {
            result = this.taskRequestsService.findAllByStatus(status);
        } else {
            result = this.taskRequestsService.findAll();
        }

        if (limit && limit > 0) {
            result = result.slice(0, limit);
        }
        return result;
    }

    @Post()
    create(@Body() createTaskRequestDto: CreateTaskRequestDto): string {
        return this.taskRequestsService.create(createTaskRequestDto);
    }

    @Put()
    update(@Body() updateTaskRequestDto: UpdateTaskRequestDto) {
        this.taskRequestsService.update(updateTaskRequestDto);
    }
}
