import { Sede } from "../../models/Sede";

export interface ISedeDAO {
  listarSedesActivas(): Promise<Sede[]>;
}
