#!/bin/bash

# Nom des images Docker et des conteneurs
PROD_IMAGE_NAME="ciottation-bot-prod"
DEV_IMAGE_NAME="ciottation-bot-dev"
PROD_CONTAINER_NAME="ciottation-bot-prod"
DEV_CONTAINER_NAME="ciottation-bot-dev"

# Afficher un message d'information
echo "Nettoyage des ressources Docker pour le projet (production et développement)..."

# Supprimer les conteneurs de production et développement
echo "Suppression des conteneurs..."
podman rm -f $PROD_CONTAINER_NAME
podman rm -f $DEV_CONTAINER_NAME

# Supprimer les images de production et développement
echo "Suppression des images..."
podman rmi -f $PROD_IMAGE_NAME
podman rmi -f $DEV_IMAGE_NAME

# Supprimer les volumes non utilisés liés au projet
echo "Suppression des volumes non utilisés..."
podman volume prune -f

# Supprimer les réseaux non utilisés (optionnel)
echo "Suppression des réseaux non utilisés..."
podman network prune -f

# Afficher un message de confirmation
echo "Nettoyage du projet Docker (production et développement) terminé !"
