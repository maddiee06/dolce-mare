import { NextRequest } from "next/server";
import { InventarioController } from "../../../../controllers/InventarioController";

export async function POST(req: NextRequest) {
  const controller = await InventarioController.crear();
  return controller.registrar(req);
}