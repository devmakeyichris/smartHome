# SmartHome

Projet de maison connectee realise en equipe. Le depot regroupe les trois
elements du produit : le backend Spring Boot, le site web React et
l'application mobile React Native.

## Organisation

| Dossier | Element | Technologie | Responsabilite |
| --- | --- | --- | --- |
| `backEnd/smarthome/` | API et communication Arduino | Spring Boot, Maven, MySQL | Backend |
| `frontEnd/front/` | Interface web | React, Vite | Frontend web |
| `mobileApp/` | Application Android et iOS | React Native | Application mobile |

Le dossier `frontEnd/front/` est la reference pour le site web. Les fichiers
React presents directement a la racine proviennent d'une ancienne structure et
doivent etre nettoyes uniquement apres validation de l'equipe.

## Demarrage rapide

### 1. Backend

Configurer MySQL, puis lancer Spring Boot :

```powershell
cd backEnd\smarthome
.\mvnw.cmd spring-boot:run
```

Le backend doit etre disponible sur :

```text
http://localhost:8080
```

### 2. Site web

Dans un second terminal :

```powershell
cd frontEnd\front
npm install
npm run dev
```

Le site web utilise normalement :

```text
http://localhost:5173
```

### 3. Application mobile

Dans un autre terminal :

```powershell
cd mobileApp
npm install
npm start
```

Puis dans un terminal supplementaire :

```powershell
cd mobileApp
npm run android
```

Adresse backend a saisir dans l'application :

```text
Emulateur Android : http://10.0.2.2:8080
Telephone physique : http://ADRESSE_IP_LOCALE_DU_PC:8080
```

## Contrat API commun

Le site web et l'application mobile doivent utiliser les memes routes :

| Action | Methode et route |
| --- | --- |
| Connexion | `POST /auth/login` |
| Inscription | `POST /auth/register` |
| Ajouter une piece | `POST /rooms` |
| Supprimer une piece | `DELETE /rooms/{id}` |
| Ajouter un module | `POST /devices` |
| Supprimer un module | `DELETE /devices/{id}` |
| Commander un module | `PUT /devices/{id}/state?state={state}` |
| Lister les badges RFID | `GET /rfid/all` |
| Ajouter un badge RFID | `POST /rfid/register` |

Valeurs de commande attendues :

```text
Lumieres : ON, OFF
Portes   : OPEN, CLOSED
```

La reponse de connexion et d'inscription doit au minimum contenir :

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

## Synchronisation de l'equipe

Avant de commencer une modification :

```powershell
git pull
```

Apres avoir termine une fonctionnalite :

```powershell
git add .
git commit -m "description claire de la modification"
git push
```

Pour limiter les conflits, chaque membre travaille dans son dossier et utilise
une branche dediee avant de fusionner dans `main`.

## Points backend a finaliser

Le backend publie actuellement plusieurs routes pour les pieces, les modules et
le RFID. L'equipe backend doit encore verifier :

- la presence effective de `POST /auth/login` et `POST /auth/register` ;
- la gestion dynamique des identifiants de modules ;
- l'utilisation du `pin` Arduino pour les commandes physiques ;
- les reponses JSON compactes apres l'ajout d'une piece ou d'un module.

## Documentation mobile

Les details propres a l'application, les tests et les commandes Android sont
egalement disponibles dans [`mobileApp/README.md`](mobileApp/README.md).
