#!/usr/bin/env bash

# scripts accept 3 positional parameters
# - path to directory of project root
# - branch to checkout
# This script is used by gitlab-ci (see http://gitlab.symbiodigital.com/snippets/3)

# color definitions
ORANGE='\033[0;33m'
PURPLE='\033[0;35m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# script argument reading
if [ $# -ne 2 ]; then
  printf "${RED}Invalid number of arguments!\nUsage: ${0} target_directory target_branch service_name${NC}\n"
  exit 1
fi

INSTANCE_DIRECTORY=$1
TARGET_BRANCH=$2

# deploy
printf "\n${PURPLE}> Changing directory to $INSTANCE_DIRECTORY${NC}\n"
cd $INSTANCE_DIRECTORY
if [ $? -ne 0 ]; then
    printf "${RED}Cannot access ${INSTANCE_DIRECTORY}! Terminating.${NC}\n"
    exit 2
fi

printf "\n${PURPLE}> Refresh list of branches${NC}\n"
git fetch --all
if [ $? -ne 0 ]; then
    printf "${RED}Cannot fetch from repository! Terminating.${NC}\n"
    exit 3
fi

printf "\n${PURPLE}> Git status${NC}\n"
git status

printf "\n${PURPLE}> Checkout branch ${TARGET_BRANCH}${NC}\n"
git checkout $TARGET_BRANCH
if [ $? -ne 0 ]; then
    printf "${RED}Cannot checkout branch ${TARGET_BRANCH}! Terminating.${NC}\n"
    exit 4
fi

printf "\n${PURPLE}> Pull changes in ${TARGET_BRANCH}${NC}\n"
git pull
if [ $? -ne 0 ]; then
    printf "${RED}Cannot pull branch ${TARGET_BRANCH}! Terminating.${NC}\n"
    exit 5
fi

# install new npm dependencies
printf "\n${PURPLE}> Installing npm dependencies${NC}\n"
yarn install
if [ $? -ne 0 ]; then
    printf "${RED}Cannot install npm dependencies! Terminating.${NC}\n"
    exit 11
fi

# build application
printf "\n${PURPLE}> Building application${NC}\n"
yarn run build
if [ $? -ne 0 ]; then
    printf "${RED}Cannot build application! Terminating.${NC}\n"
    exit 12
fi

exit 0
