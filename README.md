# Météo Compare

Application web pour comparer les modèles de prévision météo via l’API [Open-Meteo](https://open-meteo.com/). Choisissez une localisation, plusieurs modèles et paramètres, puis comparez les prévisions en graphique et en tableau.

## Fonctionnalités

- Recherche de ville (géocodage Open-Meteo), carte Leaflet et géolocalisation navigateur.
- Catalogue des modèles Open-Meteo (~55), groupés par fournisseur, avec filtre et horizon.
- Paramètres horaires et journaliers : température, ressenti, humidité, précipitations, vent, pression, nuages, rayonnement, CAPE, etc.
- Graphique multi-modèles, tableau par échéance et synthèse (min/moyenne/max/couverture).
- Unités configurables, thème clair/sombre, responsive, URL partageable, cache local 10 min.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Chart.js (`react-chartjs-2`) et Leaflet (`react-leaflet`)
- Vitest + Testing Library

## Démarrage

```bash
npm install
npm run dev
```

L’application est servie sur `http://localhost:5173`.

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Vérification TypeScript + build de production |
| `npm run preview` | Prévisualisation du build |
| `npm run typecheck` | Vérification TypeScript |
| `npm run lint` | Analyse statique (oxlint) |
| `npm test` | Tests unitaires et composants |
| `npm run test:watch` | Tests en mode watch |

## Docker

```bash
docker compose up --build -d
```

L’application est servie sur `http://localhost:8080`.

Ou directement :

```bash
docker build -t meteo-compare .
docker run -d -p 8080:80 --name meteo-compare meteo-compare
```

L’image est construite en deux étapes (build Vite puis Nginx) et sert les fichiers statiques avec compression gzip et fallback SPA.

## Données

- Géocodage : `https://geocoding-api.open-meteo.com/v1/search`
- Prévisions : `https://api.open-meteo.com/v1/forecast`
- Une requête est envoyée par modèle sélectionné (6 en parallèle au maximum), ce qui isole les modèles indisponibles pour la localisation.
- Les horizons diffèrent selon les modèles : les valeurs manquantes apparaissent comme des trous dans le graphique et « — » dans le tableau.
- Les réponses sont mises en cache dans `localStorage` pendant 10 minutes ; le bouton « Actualiser » force un nouveau chargement.
- Aucune clé API n’est nécessaire pour un usage non commercial (voir la [tarification](https://open-meteo.com/en/pricing) pour un usage commercial).

## Structure

```
src/
├─ api/            # clients géocodage et prévisions
├─ components/     # interface (recherche, carte, sélecteurs, graphique, tableau)
├─ data/           # catalogues des modèles et paramètres
├─ hooks/          # géocodage, chargement des prévisions
├─ lib/            # URL, fusion des séries, cache, formatage, état d’URL
└─ test/           # configuration des tests
```

## Notes

- Les modèles régionaux (AROME, HRRR, ICON-D2, JMA MSM, etc.) sont marqués « hors domaine » lorsqu’ils ne couvrent pas la localisation choisie.
- Les ensembles et runs historiques ne sont pas inclus.
- Les prévisions sont indicatives et peuvent diverger selon les modèles.

## Licence des données

Données météo : [Open-Meteo](https://open-meteo.com/), usage non commercial, attribution requise.
Cartographie : © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).
