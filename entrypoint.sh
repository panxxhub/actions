#!/bin/bash
# $1 = GH_TOKEN
# $2 = repository like "owner/repo"
# $3 = src_branch
# $4 = dst_branch

echo "get project name from repository"
PROJECT_NAME=$(echo $2 | cut -d'/' -f2)
echo "PROJECT_NAME: $PROJECT_NAME"

echo "setup ros2 environment"
source /opt/ros/humble/setup.sh

echo "prepare ros2 workspace"
mkdir -p /root/ros_workspace
cd /root/ros_workspace
ros2 pkg create --build-type ament_cmake $PROJECT_NAME

echo "Configuring git"
git config --global --add safe.directory /github/workspace
git config --global user.email "$GIT_USER_EMAIL"
git config --global user.name "$GIT_USER_NAME"
git fetch
 

