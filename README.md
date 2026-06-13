# Smart Home Hub

Eine React Native App (Expo) die alle deine Smart-Home-Plattformen in einer einzigen App vereint.

## Unterstützte Plattformen

| Plattform | Verbindung | Steuerung |
|---|---|---|
| **Philips Hue** | Lokale Bridge (REST API) | Licht, Helligkeit, Farbe |
| **Shelly** | Lokale REST API (Gen1 & Gen2) | Schalter, Steckdosen, Energiemessung |
| **IKEA Home Smart** | Dirigera Hub (HTTPS) | Licht, Helligkeit, Farbtemperatur |
| **Tuya / Smart Life** | Tuya IoT Cloud API | Alle Tuya-kompatiblen Geräte |
| **Eufy** | Eufy Cloud API | Kameras, Sensoren |

## Features

- **Dashboard** — Alle Geräte auf einen Blick, nach Räumen gruppiert
- **Gerätesteuerung** — An/Aus, Helligkeit, Farbe per Tipp
- **Automationen** — Zeitbasierte Regeln (z.B. "Licht um 22 Uhr aus")
- **Benachrichtigungen** — Push-Alerts für Geräteereignisse
- **Einstellungen** — Pro-Plattform API-Konfiguration

## Setup

### Voraussetzungen

- Node.js 18+
- Expo Go App auf dem Handy (iOS/Android)

### Installation

```bash
git clone https://github.com/Dopi0089/mein-erstes-repo.git
cd mein-erstes-repo
npm install
npx expo start
```

Scanne den QR-Code mit der Expo Go App.

### Plattformen einrichten

1. App öffnen → **Einstellungen**
2. Gewünschte Plattform antippen
3. Zugangsdaten eingeben (Details unten)

#### Philips Hue
- Tippe "Bridge automatisch suchen" (du musst im selben WLAN sein)
- Drücke die Taste auf der Bridge
- Tippe "Bridge-Taste drücken & registrieren"

#### Shelly
- IP-Adresse jedes Geräts aus der Shelly-App oder Router-Oberfläche
- Generation 1 oder 2 auswählen

#### IKEA Home Smart
- Dirigera Hub IP + Access-Token aus der IKEA App

#### Tuya / Smart Life
- Account auf [iot.tuya.com](https://iot.tuya.com) erstellen
- Projekt anlegen → Client-ID und Secret kopieren
- Smart-Life-App im Portal verknüpfen

#### Eufy
- E-Mail und Passwort deines Eufy/Anker-Kontos

## Entwicklung

```bash
# TypeScript prüfen
npm run type-check

# Dev-Server starten
npm start
```

## Projektstruktur

```
src/
├── api/          # API-Clients für alle 5 Plattformen
├── components/   # Wiederverwendbare UI-Komponenten
├── navigation/   # React Navigation Setup
├── screens/      # App-Screens
├── services/     # Geschäftslogik (Sync, Automationen, Notifications)
├── store/        # Zustand State Management
├── theme/        # Design-System (Farben, Spacing, Typografie)
└── types/        # TypeScript Typen
```
