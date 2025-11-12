{{- define "note-pinner.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "note-pinner.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := include "note-pinner.name" . -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "note-pinner.labels" -}}
helm.sh/chart: {{ include "note-pinner.chart" . }}
{{ include "note-pinner.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "note-pinner.selectorLabels" -}}
app.kubernetes.io/name: {{ include "note-pinner.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "note-pinner.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" -}}
{{- end -}}

{{- define "note-pinner.fullImageName" -}}
{{- $global := .Values.global.image -}}
{{- $registry := trimSuffix "/" $global.registry -}}
{{- $prefix := trimSuffix "/" $global.repositoryPrefix -}}
{{- $repository := .image.repository -}}
{{- $tag := default $global.tag .image.tag -}}
{{- if and $registry (ne $registry "docker.io") -}}
{{- printf "%s/%s%s:%s" $registry (ternary "" (printf "%s/" $prefix) (eq $prefix "")) $repository $tag -}}
{{- else if $prefix -}}
{{- printf "%s/%s:%s" $prefix $repository $tag -}}
{{- else -}}
{{- printf "%s:%s" $repository $tag -}}
{{- end -}}
{{- end -}}

