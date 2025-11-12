# Monitoring Setup

## Prerequisites

- Helm installed locally (`helm version`)
- Kubernetes cluster (e.g. Minikube) with `kubectl` configured
- Prometheus Community Helm repo added:  
  `helm repo add prometheus-community https://prometheus-community.github.io/helm-charts`
- Grafana Helm repo added:  
  `helm repo add grafana https://grafana.github.io/helm-charts`

## Deploy Prometheus

```bash
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  -f monitoring/prometheus-values.yaml
```

This adds an additional scrape job targeting the Note Pinner backend metrics endpoint.

## Deploy Grafana

```bash
helm install grafana grafana/grafana \
  --namespace monitoring \
  --set adminPassword=admin \
  --set service.type=NodePort \
  --set service.nodePort=32000 \
  --set datasources."datasources\.yaml".apiVersion=1 \
  --set datasources."datasources\.yaml".datasources[0].name=Prometheus \
  --set datasources."datasources\.yaml".datasources[0].type=prometheus \
  --set datasources."datasources\.yaml".datasources[0].url=http://prometheus-kube-prometheus-prometheus.monitoring.svc.cluster.local:9090 \
  --set datasources."datasources\.yaml".datasources[0].access=proxy \
  --set datasources."datasources\.yaml".datasources[0].isDefault=true
```

Forward the Grafana service if required:

```bash
kubectl port-forward svc/grafana -n monitoring 3001:80
```

## Import Dashboard

1. Launch Grafana (`http://localhost:3001` if using port-forward).
2. Log in with `admin / admin` (or the password you set).
3. Navigate to *Dashboards → Import*.
4. Upload `monitoring/grafana-dashboard.json`.
5. Select the Prometheus datasource and import.

You now have panels for request rate, latency quantiles, and error rate based on the backend metrics.

