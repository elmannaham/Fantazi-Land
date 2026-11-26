import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string = "SERVER_ERROR",
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function validationError(message: string, details?: any) {
  return new ApiError(400, message, "VALIDATION_ERROR");
}

export function unauthorizedError(message: string = "Accès non autorisé") {
  return new ApiError(401, message, "UNAUTHORIZED");
}

export function forbiddenError(message: string = "Droits insuffisants") {
  return new ApiError(403, message, "FORBIDDEN");
}

export function notFoundError(message: string = "Ressource introuvable") {
  return new ApiError(404, message, "NOT_FOUND");
}

export function conflictError(message: string = "La ressource existe déjà") {
  return new ApiError(409, message, "CONFLICT");
}

export function errorHandler(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation échouée",
        code: "VALIDATION_ERROR",
        details: error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 }
    );
  }

  console.error("Unhandled Backend Error:", error);

  return NextResponse.json(
    {
      success: false,
      error: "Une erreur interne est survenue",
      code: "SERVER_ERROR",
    },
    { status: 500 }
  );
}
