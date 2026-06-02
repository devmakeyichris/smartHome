# SmartHomeMobile

Application mobile React Native pour piloter et visualiser une maison connectee :
pieces, lumieres, portes, RFID, servos et capteurs Arduino.

Le site web et le backend Spring Boot restent dans le depot partage `smartHome`.
Ce depot contient uniquement l'application mobile.

## Prerequis

- Node.js 22 ou version ulterieure
- Android Studio avec un emulateur Android, ou un telephone Android configure
- Backend Spring Boot demarre sur le port `8080`

## Installation

```powershell
npm install
```

## Lancement sur Android

Demarrer Metro dans un premier terminal :

```powershell
npm start
```

Lancer l'application dans un second terminal :

```powershell
npm run android
```

Pour l'emulateur Android, l'adresse backend proposee par defaut est :

```text
http://10.0.2.2:8080
```

Pour un telephone physique connecte au meme Wi-Fi que le PC, utiliser l'adresse
IP locale du PC :

```text
http://192.168.x.x:8080
```

## Contrat backend attendu

| Action | Methode et route |
| --- | --- |
| Connexion | `POST /api/auth/login` |
| Inscription | `POST /api/auth/register` |
| Tester le backend | `GET /users/email/ping@smarthome.local` |
| Ajouter une piece | `POST /rooms` |
| Supprimer une piece | `DELETE /rooms/{id}` |
| Ajouter un module | `POST /devices` |
| Supprimer un module | `DELETE /devices/{id}` |
| Commander un module | `PUT /devices/{id}/state?state={state}` |

Les valeurs de commande utilisees par l'application sont :

```text
Lumieres : ON, OFF
Portes   : OPEN, CLOSED
```

La reponse de connexion et d'inscription doit contenir au minimum :

```json
{
  "id": 1,
  "nom": "Dupont",
  "prenom": "Marie",
  "email": "marie@example.com",
  "nomMaison": "Villa Lucide",
  "role": "admin",
  "houseId": 1,
  "homeConfig": []
}
```

## Verification avant partage

```powershell
npm run lint
npm test -- --runInBand
cd android
.\gradlew.bat assembleDebug
```

## Organisation du projet

```text
App.tsx                 Experience principale et appels API
src/components/         Scene de maison et composants visuels
assets/                 Logo et illustrations
android/                Projet Android natif
ios/                    Projet iOS natif
```
