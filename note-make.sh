#!/bin/bash

# Function to get commit messages between two tags
get_commit_messages() {
    from_tag=$1
    to_tag=$2

    git log --pretty=%s "${to_tag}".."${from_tag}"
}

# Function to get merged pull request messages
get_merged_pull_requests() {
  from_tag=$1
  to_tag=$2

  git log --pretty=%s "${to_tag}".."${from_tag}" --merges
}

# Function to generate output
generate_output() {
    commit_messages=$1
    pull_request_messages=$2

    change_list=""

    change_list+="## changes made"
    change_list+="${commit_messages}"

    change_list+="\n"

    change_list+="\n## pull requests merged"
    change_list+="${pull_request_messages}"

    echo "::set-output name=CHANGE_LIST::$change_list"
}

# Get the latest tag
latest_tag=$(git describe --tags --abbrev=0)

# Get the oldest tag or if there's only one tag, set oldest_tag to latest_tag
oldest_tag=$(git describe --abbrev=0 $(git describe --abbrev=0)^)

if [ -n "${latest_tag}" ] && [ -n "${oldest_tag}" ]; then
    # Both latest_tag and oldest_tag exist
    commit_messages=$(get_commit_messages "${latest_tag}" "${oldest_tag}")
    pull_request_messages=$(get_merged_pull_requests "${latest_tag}" "${oldest_tag}")
    generate_output "${commit_messages}" "${pull_request_messages}"
else
    empty_message="## There is no tag range to check the changes!"
    echo "::set-output name=CHANGE_LIST::$empty_message"
fi
