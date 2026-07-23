import type { Request, Response } from "express";
type RegisterBody = {
    name: string;
    email: string;
    password: string;
};
type LoginBody = {
    email: string;
    password: string;
};
export declare const registerUser: (req: Request<{}, {}, RegisterBody>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const loginUser: (req: Request<{}, {}, LoginBody>, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=auth.controller.d.ts.map