import { User } from "../user/user.types";
import { TabBank } from "./Bank.model";

export interface Agency {
  id?: number;
  name?: string;
  contactEmail?: string;
  agencyCode?: string;
  contactPhoneNumber?: string;
  adresse?: string;
  Region?: Region;
  city?: 
    ArianaCities |
    BejaCities |
    BenArousCities |
    BizerteCities |
    GabesCities |
    GafsaCities |
    JendoubaCities |
    KairouanCities |
    KasserineCities |
    KebiliCities |
    KefCities |
    MahdiaCities |
    ManoubaCities |
    MedenineCities |
    MonastirCities |
    NabeulCities |
    SfaxCities |
    SidiBouzidCities |
    SilianaCities |
    SousseCities |
    TataouineCities |
    TozeurCities |
    TunisCities |
    ZaghouanCities |
    null;
  bank?: TabBank | null;
  users?: User[] | null;
}

export enum Region {
  Ariana = 'Ariana',
  Beja = 'Beja',
  BenArous = 'Ben Arous',
  Bizerte = 'Bizerte',
  Gabes = 'Gabes',
  Gafsa = 'Gafsa',
  Jendouba = 'Jendouba',
  Kairouan = 'Kairouan',
  Kasserine = 'Kasserine',
  Kebili = 'Kebili',
  Kef = 'Kef',
  Mahdia = 'Mahdia',
  Manouba = 'Manouba',
  Medenine = 'Medenine',
  Monastir = 'Monastir',
  Nabeul = 'Nabeul',
  Sfax = 'Sfax',
  SidiBouzid = 'Sidi Bouzid',
  Siliana = 'Siliana',
  Sousse = 'Sousse',
  Tataouine = 'Tataouine',
  Tozeur = 'Tozeur',
  Tunis = 'Tunis',
  Zaghouan = 'Zaghouan'
}


export enum ArianaCities {
  ArianaVille = 'Ariana Ville',
  Ettadhamen = 'Ettadhamen',
  Soukra = 'Soukra',
  Raoued = 'Raoued',
  SidiThabet = 'Sidi Thabet',
  Mnihla = 'Mnihla'
}

export enum BejaCities {
  BejaNord = 'Beja Nord',
  BejaSud = 'Beja Sud',
  MedjezElBab = 'Medjez El Bab',
  Nefza = 'Nefza',
  Testour = 'Testour',
  Teboursouk = 'Teboursouk',
  Goubellat = 'Goubellat',
  Amdoun = 'Amdoun'
}

export enum BenArousCities {
  BenArous = 'Ben Arous',
  Ezzahra = 'Ezzahra',
  HammamLif = 'Hammam Lif',
  HammamChatt = 'Hammam Chatt',
  Mornag = 'Mornag',
  Radès = 'Radès',
  Fouchana = 'Fouchana',
  Mohamedia = 'Mohamedia'
}

export enum BizerteCities {
  Bizerte = 'Bizerte',
  MenzelBourguiba = 'Menzel Bourguiba',
  Mateur = 'Mateur',
  RasJebel = 'Ras Jebel',
  GharElMelh = 'Ghar El Melh',
  Sejnane = 'Sejnane',
  Utique = 'Utique'
}

export enum GabesCities {
  Gabes = 'Gabes',
  Matmata = 'Matmata',
  Mareth = 'Mareth',
  Ghannouch = 'Ghannouch',
  Oudhref = 'Oudhref',
  Metouia = 'Metouia'
}

export enum GafsaCities {
  Gafsa = 'Gafsa',
  ElGuettar = 'El Guettar',
  Redeyef = 'Redeyef',
  Metlaoui = 'Metlaoui',
  Moulares = 'Moulares',
  SidiAich = 'Sidi Aich'
}

export enum JendoubaCities {
  Jendouba = 'Jendouba',
  Ghardimaou = 'Ghardimaou',
  Fernana = 'Fernana',
  OuedMliz = 'Oued Mliz',
  Tabarka = 'Tabarka',
  BaltaBoulkrim = 'Balta Bou Aouene'
}

export enum KairouanCities {
  Kairouan = 'Kairouan',
  Haffouz = 'Haffouz',
  Chebika = 'Chebika',
  Sbikha = 'Sbikha',
  Oueslatia = 'Oueslatia'
}

export enum KasserineCities {
  Kasserine = 'Kasserine',
  Thala = 'Thala',
  Sbeitla = 'Sbeitla',
  Foussana = 'Foussana',
  Feriana = 'Feriana'
}

export enum KebiliCities {
  Kebili = 'Kebili',
  Douz = 'Douz',
  SoukElAhed = 'Souk El Ahed',
  ElFaouar = 'El Faouar'
}

export enum KefCities {
  Kef = 'Kef',
  Dahmani = 'Dahmani',
  Nebeur = 'Nebeur',
  Touiref = 'Touiref'
}

export enum MahdiaCities {
  Mahdia = 'Mahdia',
  KsourEssef = 'Ksour Essef',
  Chebba = 'Chebba',
  ElJem = 'El Jem',
  SidiAmeur = 'Sidi Ameur'
}

export enum ManoubaCities {
  Manouba = 'Manouba',
  OuedEllil = 'Oued Ellil',
  Tebourba = 'Tebourba',
  DouarHicher = 'Douar Hicher',
  BorjElAmri = 'Borj El Amri'
}

export enum MedenineCities {
  Medenine = 'Medenine',
  Zarzis = 'Zarzis',
  BenGuerdane = 'Ben Guerdane',
  BeniKhedache = 'Beni Khedache',
  HoumtSouk = 'Houmt Souk',
  Ajim = 'Ajim'
}

export enum MonastirCities {
  Monastir = 'Monastir',
  KsibetElMediouni = 'Ksibet El Mediouni',
  Sahline = 'Sahline',
  Moknine = 'Moknine',
  Jemmal = 'Jemmal'
}

export enum NabeulCities {
  Nabeul = 'Nabeul',
  Hammamet = 'Hammamet',
  Korba = 'Korba',
  MenzelTemime = 'Menzel Temime',
  Kelibia = 'Kelibia',
  Grombalia = 'Grombalia',
  Soliman = 'Soliman'
}

export enum SfaxCities {
  Sfax = 'Sfax',
  SakietEzzit = 'Sakiet Ezzit',
  SakietEddaier = 'Sakiet Eddaier',
  Thyna = 'Thyna',
  Agareb = 'Agareb',
  BirAliBenKhelifa = 'Bir Ali Ben Khelifa'
}

export enum SidiBouzidCities {
  SidiBouzid = 'Sidi Bouzid',
  MenzelBouzaiane = 'Menzel Bouzaiane',
  Mezzouna = 'Mezzouna',
  Regueb = 'Regueb',
  Jelma = 'Jelma'
}

export enum SilianaCities {
  Siliana = 'Siliana',
  Kesra = 'Kesra',
  Makthar = 'Makthar',
  BouArada = 'Bou Arada'
}

export enum SousseCities {
  Sousse = 'Sousse',
  HammamSousse = 'Hammam Sousse',
  Msaken = 'Msaken',
  Akouda = 'Akouda',
  KalaaKebira = 'Kalaa Kebira'
}

export enum TataouineCities {
  Tataouine = 'Tataouine',
  BirLahmar = 'Bir Lahmar',
  Ghomrassen = 'Ghomrassen',
  Remada = 'Remada'
}

export enum TozeurCities {
  Tozeur = 'Tozeur',
  Nefta = 'Nefta',
  Degache = 'Degache',
  Hezoua = 'Hezoua'
}

export enum TunisCities {
  Tunis = 'Tunis',
  LaGoulette = 'La Goulette',
  Carthage = 'Carthage',
  LaMarsa = 'La Marsa',
  LeBardo = 'Le Bardo',
  SidiHassine = 'Sidi Hassine'
}

export enum ZaghouanCities {
  Zaghouan = 'Zaghouan',
  BirMcherga = 'Bir Mcherga',
  ElFahs = 'El Fahs',
  Nadhour = 'Nadhour'
}