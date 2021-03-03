{{/*
Expand the name of the chart.
*/}}
{{- define "claim-api.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "claim-api.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "claim-api.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Default Common labels
*/}}
{{- define "claim-api.labels" -}}
{{ include "claim-api.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ include "claim-api.chart" . }}
{{- end }}

{{/*
DB Common labels
*/}}
{{- define "claim-api-db.labels" -}}
{{ include "claim-api-db.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ include "claim-api.chart" . }}
{{- end }}

{{/*
Default Selector labels
*/}}
{{- define "claim-api.selectorLabels" -}}
app: {{ .Values.app.name }}
component: {{ .Values.app.component }}
environment: {{ .Values.app.environment }}
app.kubernetes.io/name: {{ include "claim-api.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
DB Selector labels
*/}}
{{- define "claim-api-db.selectorLabels" -}}
app: {{ .Values.app.name }}
component: {{ .Values.app.component }}
environment: {{ .Values.app.environment }}
app.kubernetes.io/name: {{ include "claim-api.name" . }}-db-proxy
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}


{{/*
Create the name of the service account to use
*/}}
{{- define "claim-api.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "claim-api.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}
