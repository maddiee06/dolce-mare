import { AuthController } from "../../../../controllers/AuthController";

export async function GET(request: Request) {
  return new AuthController().obtenerPerfil(request);
}
