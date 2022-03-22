#!/bin/bash
if [ "$#" -lt "1" ]; then
    echo 'Please provide at least 1 remote to be added into an existing monorepo'
    echo 'Usage: migrate.sh <remote-name> <remote-name> ...'
    echo 'Example: migrate.sh https://github.com/Taraxa-project/taraxa-claim-backend.git ...'
    exit
fi

my_repos=$@
src_dir=./services
git checkout -b monorepo-migration
for repo in $(echo $my_repos); do
  truncated=${repo%.*}
  echo $truncated
  project_name=${truncated##*/}
  echo $project_name
  git remote add $project_name $repo
  git fetch $project_name
  git read-tree --prefix=$src_dir/$project_name -u $project_name/main
  git add $src_dir/$project_name
  git commit -m "Migrated $project_name to $src_dir/$project_name"
done
git push -u origin HEAD