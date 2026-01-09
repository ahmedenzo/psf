import { User } from "../user/user.types";
import { Agency } from "./Agency.model";

export interface TabBank {
  id?: number;
  name?: string;
  bankCode?: string;
  libelleBanque?: string;
  enseigneBanque?: string;
  ica?: string;
  binAcquereurVisa?: string;
  binAcquereurMcd?: string;
  ctb?: string;
  banqueEtrangere?: string;
  logoContent?: string;
  admin?: User | null;
  agencies?: Agency[];
}
