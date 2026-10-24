import { NextRequest } from "next/server";
import { InventarioController } from "../../../../controllers/InventarioController";

export async function GET(req: NextRequest) {
  const controller = await InventarioController.crear();
  return controller.kardex(req);
}