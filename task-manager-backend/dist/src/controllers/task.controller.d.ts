import type { Request, Response } from "express";
export declare const createTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const readTasks: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const toggleTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=task.controller.d.ts.map