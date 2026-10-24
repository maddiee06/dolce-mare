import { InventarioController } from "../../../../controllers/InventarioController";

export async function GET() {
  const controller = await InventarioController.crear();
  return controller.tiposMovimiento();
}