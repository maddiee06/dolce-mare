import { AuthController } from "../../../controllers/AuthController";

export async function POST(request: Request) {
  return new AuthController().login(request);
}