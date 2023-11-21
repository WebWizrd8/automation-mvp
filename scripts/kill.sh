#!/bin/bash

# Check if the correct number of arguments are provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <process_name>"
    exit 1
fi

process_name=$1

# Find the process ID (PID) for the given process name
pids=$(ps -ef | grep "$process_name" | grep -v grep | awk '{print $2}')

if [ -z "$pids" ]; then
    echo "No process found with the name: $process_name in folder: $folder_path"
    exit 1
else
    echo "Killing processes with name $process_name in folder: $folder_path"
    for pid in $pids; do
        echo "Killing process $pid"
        kill "$pid"
    done
    exit 0
fi