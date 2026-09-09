import type { Response } from "express";

class AppResponse {
  static ok<T>(res: Response, message: string = "Success", data?: T) {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  static created<T>(res: Response, message: string = "Created successfully", data?: T) {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }
}

export default AppResponse;
