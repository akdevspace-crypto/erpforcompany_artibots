import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class DepartmentGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
