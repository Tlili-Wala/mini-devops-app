# Note Pinner – Mini DevOps App

Application web minimaliste pour le mini-projet DevOps : un frontend React/TypeScript (Vite + Tailwind) et une API Node/Express/TypeScript exposant des métriques Prometheus. Le projet illustre la conteneurisation, l’automatisation CI/CD, le déploiement Kubernetes (Helm + ArgoCD) et le monitoring Prometheus/Grafana.

## Architecture

- `frontend/` – React 19, TypeScript, Vite, TailwindCSS. Le frontend consomme l’API via un proxy `/api`.
- `backend/` – Express 5, TypeScript, in-memory store, endpoint `/metrics` instrumenté avec `prom-client`.
- `docker-compose.yml` – Exécution locale combinée avec reverse proxy nginx.
- `Jenkinsfile` – Pipeline build/lint/test → Docker build → Trivy → push Docker Hub.
- `helm/note-pinner` – Chart Helm déployant frontend + backend (NodePort par défaut pour Minikube).
- `argocd/application.yaml` – Déploiement GitOps automatisé.
- `monitoring/` – Overrides Helm Prometheus + dashboard Grafana.

## Prérequis

- Node.js ≥ 20.19 et npm
- Docker et Docker Compose
- Helm, kubectl, cluster Kubernetes local (Minikube conseillé)
- Trivy (pour le stage “Security Scan”)

## Développement local (npm)

```bash
# Frontend
cd frontend
npm install
npm run dev  # http://localhost:5173

# Backend
cd backend
npm install
npm run dev  # http://localhost:4000
```

## Exécution via Docker Compose

```bash
docker compose build
docker compose up
```

- Frontend : `http://localhost:3000`
- API : `http://localhost:3000/api` (proxy nginx) ou `http://localhost:4000`
- Arrêter : `docker compose down`

## Pipeline Jenkins

1. Configurer un credential `dockerhub-credentials` (username/password).
2. Installer Node 20, Docker, Trivy sur l’agent.
3. Créer un job Pipeline pointant sur ce repo.
4. Le pipeline :
   - `npm ci` + lint/build pour frontend & backend (stages parallèles).
   - Build d’images `mini-devops-app-frontend` / `mini-devops-app-backend`.
   - Scan Trivy (`HIGH`,`CRITICAL`).
   - `docker login` puis `docker push`.

## Déploiement Kubernetes (Helm)

```bash
minikube start
helm install note-pinner ./helm/note-pinner \
  --set global.image.repositoryPrefix=<votre-utilisateur-dockerhub>

# Exposer le frontend
minikube service frontend --namespace default
```

- Backend: `http://backend.default.svc.cluster.local:4000`
- Activer l’ingress en ajustant `frontend.ingress.enabled=true` si un ingress controller est disponible.

## GitOps avec ArgoCD

1. Installer ArgoCD (`kubectl create namespace argocd`, etc.).
2. Mettre à jour `argocd/application.yaml` avec l’URL du repo.
3. `kubectl apply -f argocd/application.yaml`.
4. ArgoCD synchronise et maintient le chart à jour.

## Monitoring

Reportez-vous à `monitoring/README.md` :

- Installer `kube-prometheus-stack` avec `monitoring/prometheus-values.yaml`.
- Installer Grafana, ajouter la datasource Prometheus, importer `monitoring/grafana-dashboard.json`.
- Dashboard : débit, latence p90/p99, taux d’erreurs.

## Vérifications

```bash
cd frontend && npm run lint && npm run build
cd backend && npm run lint && npm run build
```

## Livrables couverts

- [x] Frontend & backend TypeScript fonctionnels
- [x] Dockerfiles + docker-compose
- [x] Jenkinsfile avec build/test/scan/push
- [x] Helm chart & manifest ArgoCD
- [x] Monitoring (Prometheus + Grafana)
- [x] Documentation (README + monitoring/README)

